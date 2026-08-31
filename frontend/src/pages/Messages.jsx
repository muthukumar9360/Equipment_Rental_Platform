import React, { useState, useEffect, useContext, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import Loader from '../components/Loader';

const Messages = () => {
  const { user } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  const location = useLocation();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // If navigated from "Message" button, location.state might have receiverId, productId
  useEffect(() => {
    const init = async () => {
      try {
        const state = location.state;
        if (state?.receiverId) {
          // Start or get conversation
          const { data } = await api.post('/messages/conversations', {
            receiverId: state.receiverId,
            productId: state.productId
          });
          setActiveConversation(data);
          // clear state so refresh doesn't trigger again
          navigate(location.pathname, { replace: true });
        }
        
        // Load all conversations
        const { data: convs } = await api.get('/messages/conversations');
        setConversations(convs);
        
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [location.state, navigate]);

  // Load messages for active conversation
  useEffect(() => {
    if (activeConversation) {
      const fetchMsgs = async () => {
        try {
          const { data } = await api.get(`/messages/${activeConversation._id}`);
          setMessages(data);
          scrollToBottom();
        } catch (err) {
          console.error(err);
        }
      };
      fetchMsgs();
      
      // Clear unread in the local state
      setConversations(prev => prev.map(c => {
        if (c._id === activeConversation._id) {
          const newCounts = { ...c.unreadCounts };
          newCounts[user._id] = 0;
          return { ...c, unreadCounts: newCounts };
        }
        return c;
      }));
    }
  }, [activeConversation, user._id]);

  // Socket listener
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (data) => {
      // If message belongs to active conversation
      if (activeConversation && activeConversation._id === data.conversationId) {
        // We could fetch messages again or just append if we have the full message object.
        // For simplicity, refetch.
        api.get(`/messages/${data.conversationId}`).then(res => {
          setMessages(res.data);
          scrollToBottom();
        });
      } else {
        // Refresh conversations to update lastMessage and unreadCounts
        api.get('/messages/conversations').then(res => setConversations(res.data));
      }
    };

    socket.on('receive_message', handleReceiveMessage);
    
    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [socket, activeConversation]);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    }, 100);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    try {
      const { data } = await api.post('/messages', {
        conversationId: activeConversation._id,
        text: newMessage
      });

      setMessages(prev => [...prev, data]);
      setNewMessage('');
      scrollToBottom();

      const receiverId = activeConversation.participants.find(p => p._id !== user._id)._id;

      // Emit to socket
      if (socket) {
        socket.emit('send_message', {
          receiverId,
          conversationId: activeConversation._id,
          senderId: user._id
        });
      }

      // Update local conversations list
      setConversations(prev => prev.map(c => {
        if (c._id === activeConversation._id) {
          return { ...c, lastMessage: data.text, updatedAt: new Date().toISOString() };
        }
        return c;
      }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)));

    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <Loader type="fullpage" text="Loading Messages..." />;

  return (
    <div className="max-w-8xl mx-2 lg:mx-auto flex h-[calc(100vh-120px)] bg-white/70 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] overflow-hidden border border-white/60 mb-5 relative">
      
      {/* Decorative Gradients Behind the UI */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-400/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-400/20 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Left Sidebar - Conversations */}
      <div className="w-[35%] lg:w-[30%] border-r border-gray-200/50 flex flex-col bg-white/40 z-10">
        <div className="p-8 border-b border-gray-200/50 shrink-0">
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
            Messages
          </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 custom-scrollbar">
          {conversations.filter(c => c.lastMessage).length === 0 ? (
            <div className="p-6 text-center flex flex-col items-center justify-center h-full opacity-60">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                 <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              </div>
              <p className="text-gray-600 font-bold">No messages yet.</p>
              <p className="text-gray-400 text-sm mt-1">Start a conversation from a provider's profile.</p>
            </div>
          ) : (
            conversations.filter(c => c.lastMessage).map(conv => {
              const otherUser = conv.participants.find(p => p._id !== user._id);
              const unread = conv.unreadCounts?.[user._id] || 0;
              const isActive = activeConversation?._id === conv._id;

              return (
                <div 
                  key={conv._id} 
                  onClick={() => setActiveConversation(conv)}
                  className={`flex items-center gap-4 p-4 cursor-pointer transition-all duration-300 rounded-2xl group ${isActive ? 'bg-white shadow-xl shadow-blue-500/5 border border-gray-100 transform scale-[1.02]' : 'hover:bg-white/80 hover:shadow-md hover:border-gray-100 border border-transparent'}`}
                >
                  <div className="relative shrink-0">
                    <div className="w-14 h-14 rounded-[1.25rem] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden border-[3px] border-white shadow-sm transition-transform duration-300 group-hover:scale-105">
                      {otherUser?.profileImage ? (
                        <img src={otherUser.profileImage} alt="" className="w-full h-full object-cover"/>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500 font-black text-xl">{otherUser?.name?.charAt(0)}</div>
                      )}
                    </div>
                    {unread > 0 && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full border-[3px] border-white flex items-center justify-center text-[10px] font-black text-white shadow-md animate-bounce">
                        {unread}
                      </div>
                    )}
                  </div>
                  
                  <div className="grow overflow-hidden">
                    <div className="flex justify-between items-baseline mb-1.5">
                      <h3 className="font-bold text-gray-900 truncate pr-2 group-hover:text-blue-600 transition-colors">{otherUser?.username || otherUser?.name}</h3>
                      <span className="text-[10px] text-gray-400 font-bold shrink-0 uppercase tracking-wider">
                        {new Date(conv.updatedAt).toLocaleDateString() === new Date().toLocaleDateString() 
                          ? new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                          : new Date(conv.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p className={`text-sm truncate ${unread > 0 ? 'text-gray-900 font-black' : 'text-gray-500 font-medium'}`}>
                      {conv.lastMessage || '\u00A0'}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Content - Active Chat */}
      <div className="flex-1 flex flex-col bg-gray-50/40 relative z-10">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-5 px-8 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 flex items-center gap-5 shrink-0 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] z-20">
              <div className="w-12 h-12 rounded-[1rem] bg-gray-200 overflow-hidden shrink-0 border-2 border-white shadow-sm">
                {activeConversation.participants.find(p => p._id !== user._id)?.profileImage ? (
                  <img src={activeConversation.participants.find(p => p._id !== user._id).profileImage} alt="" className="w-full h-full object-cover"/>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 font-black text-lg">
                    {activeConversation.participants.find(p => p._id !== user._id)?.name?.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-black text-gray-900 text-lg">
                  {activeConversation.participants.find(p => p._id !== user._id)?.username}
                </h3>
                {activeConversation.product ? (
                  <p className="text-xs text-blue-600 font-bold flex items-center mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5 animate-pulse"></span>
                    Inquiring about: {activeConversation.product.name}
                  </p>
                ) : (
                  <p className="text-xs text-green-500 font-bold flex items-center mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>
                    Online
                  </p>
                )}
              </div>
            </div>

            {/* Chat Messages */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
              {messages.map((msg, idx) => {
                const isMe = msg.sender === user._id;
                return (
                  <div key={msg._id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-slide-up`} style={{ animationDelay: `${idx * 0.05}s`, animationFillMode: 'both' }}>
                    <div className={`max-w-[75%] px-5 py-3.5 rounded-3xl shadow-sm relative group ${isMe ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-tr-sm shadow-blue-500/20 origin-bottom-right transform transition-transform hover:scale-[1.02]' : 'bg-white text-gray-800 rounded-tl-sm border border-gray-100 shadow-[0_4px_15px_-5px_rgba(0,0,0,0.05)] origin-bottom-left transform transition-transform hover:scale-[1.02]'}`}>
                      <p className="text-[15px] leading-relaxed break-words font-medium">{msg.text}</p>
                      <p className={`text-[10px] mt-2 text-right font-bold ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-6 bg-white/80 backdrop-blur-xl border-t border-gray-200/50 shrink-0 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)] z-20">
              <form onSubmit={handleSendMessage} className="flex gap-3 max-w-5xl mx-auto">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-100/80 text-gray-900 px-6 py-4 rounded-2xl focus:outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/20 border border-transparent focus:border-blue-200 transition-all font-medium placeholder-gray-400 shadow-inner"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white flex items-center justify-center transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:shadow-none transform hover:-translate-y-1 active:translate-y-0"
                >
                  <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50/30">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-100 rounded-full blur-3xl opacity-50 animate-pulse"></div>
              <svg className="w-28 h-28 mb-8 text-gray-300 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            </div>
            <p className="text-2xl font-black text-gray-800 tracking-tight">Your Messages</p>
            <p className="text-gray-500 font-medium mt-2">Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Messages;
