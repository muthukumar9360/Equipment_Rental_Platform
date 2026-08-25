import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const RecentActivityPage = () => {
  const navigate = useNavigate();
  const [historyItems, setHistoryItems] = useState([]);

  useEffect(() => {
    try {
      const viewed = JSON.parse(localStorage.getItem('recentlyViewed')) || [];
      setHistoryItems(viewed);
    } catch (e) {
      console.error(e);
      setHistoryItems([]);
    }
  }, []);

  const formatTime = (isoString) => {
    if (!isoString) return 'Previously Viewed';
    const date = new Date(isoString);
    return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  const clearHistory = () => {
    localStorage.removeItem('recentlyViewed');
    setHistoryItems([]);
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] bg-gray-50 overflow-hidden pb-16">
      
      {/* Abstract Background Blobs for Premium Feel */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-50 animate-pulse"></div>
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-50 animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-50 animate-pulse" style={{ animationDelay: '4s' }}></div>

      <div className="relative max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-5 border-b border-gray-200/50 pb-8">
          <div>
            <Link to="/" className="inline-flex items-center space-x-2 text-black font-bold hover:text-blue-800 transition-colors mb-4 hover:cursor-pointer bg-white px-4 py-2 rounded-full shadow-lg">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              <span className="hover:text-blue-600">Back to Home</span>
            </Link>
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter">
              Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Journey</span>
            </h1>
            <p className="text-gray-500 mt-4 text-xl font-medium max-w-3xl">A beautiful timeline of all the premium equipment you've explored on Equipora.</p>
          </div>
          {historyItems.length > 0 && (
            <button 
              onClick={clearHistory}
              className="mt-6 md:mt-0 px-6 py-3 bg-white border-2 border-red-100 text-red-500 font-bold rounded-2xl hover:bg-red-500 hover:text-white hover:border-red-500 shadow-sm hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              <span>Clear Timeline</span>
            </button>
          )}
        </div>
        
        {/* Content Section */}
        {historyItems.length === 0 ? (
          <div className="text-center py-10 bg-white/60 backdrop-blur-xl rounded-[3rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Your timeline is empty</h2>
            <p className="text-gray-500 mb-8 text-lg max-w-md mx-auto">It looks like you haven't viewed any equipment yet. Start exploring the marketplace to build your journey.</p>
            <button onClick={() => navigate('/products')} className="px-8 py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-blue-600 shadow-[0_10px_20px_-10px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_30px_-10px_rgba(37,99,235,0.5)] transition-all duration-300 transform hover:-translate-y-1">
              Explore Marketplace
            </button>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-200 via-purple-200 to-transparent transform -translate-x-1/2 rounded-full hidden md:block"></div>
            
            <div className="space-y-0 md:space-y-0">
              {historyItems.map((item, index) => {
                const isEven = index % 2 === 0;
                return (
                  <div key={item._id + index} className={`relative flex flex-col md:flex-row items-center justify-between w-full ${isEven ? 'md:flex-row-reverse' : ''}`}>
                    
                    {/* Timeline Node */}
                    <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 w-12 h-12 bg-white border-4 border-blue-500 rounded-full items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)] z-10">
                      <div className="w-3 h-3 bg-blue-600 rounded-full animate-ping"></div>
                      <div className="w-3 h-3 bg-blue-600 rounded-full absolute"></div>
                    </div>

                    {/* Content Card */}
                    <div className={`w-full md:w-[45%] z-20 mb-8 md:mb-0 ${isEven ? 'md:pl-12 lg:pl-20' : 'md:pr-12 lg:pr-20'}`}>
                      <div 
                        onClick={() => navigate(`/products/${item._id}`)}
                        className="group bg-white/80 backdrop-blur-xl rounded-[2.5rem] overflow-hidden border border-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_20px_40px_rgba(37,99,235,0.15)] transition-all duration-500 transform hover:-translate-y-2 cursor-pointer"
                      >
                        <div className="h-58 relative overflow-hidden p-5 pb-0">
                          <img src={item.images?.[0] || 'https://via.placeholder.com/400'} alt={item.name} className="w-full h-full object-cover rounded-[2rem] transform group-hover:scale-105 transition-transform duration-700 shadow-sm" />
                        </div>
                        
                        <div className="p-8">
                          <div className="flex items-center space-x-3 mb-1">
                            <span className="px-3 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold uppercase tracking-wider border border-blue-100">
                              {item.category}
                            </span>
                            <span className="text-gray-400 text-sm font-medium flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                              {item.location?.split(' - ')[0] || 'Location'}
                            </span>
                          </div>
                          
                          <h3 className="font-black text-gray-900 text-2xl group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300 line-clamp-1">
                            {item.name}
                          </h3>
                          
                          <div className="flex justify-between items-end pt-2 border-t border-gray-100/80">
                            <div>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Rental Rate</p>
                              <div className="flex items-baseline">
                                <p className="text-3xl font-black text-gray-900 tracking-tighter">₹{item.pricePerDay}</p>
                                <span className="text-sm text-gray-500 font-bold ml-1">/ day</span>
                              </div>
                            </div>
                            
                            <button className="bg-gray-100 group-hover:bg-blue-600 text-gray-600 group-hover:text-white rounded-2xl p-4 transition-all duration-300 transform group-hover:rotate-12 shadow-sm">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Timeline Details (Opposite Side) */}
                    <div className={`hidden md:flex w-full md:w-[45%] flex-col ${isEven ? 'items-start pr-12 lg:pr-20' : 'items-end pl-12 lg:pl-20'}`}>
                      <div className="bg-white/60 backdrop-blur-md px-8 py-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center space-x-4 transform hover:scale-105 transition-transform duration-300">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-blue-600 shadow-inner ${isEven ? 'order-first mr-4' : 'order-last ml-4'}`}>
                          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div className={`${isEven ? 'text-left' : 'text-right'}`}>
                          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Viewed On</p>
                          <p className="text-2xl font-black text-gray-900 tracking-tight">{formatTime(item.viewedAt)}</p>
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivityPage;
