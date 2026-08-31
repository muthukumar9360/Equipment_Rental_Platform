const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Start or get conversation
// @route   POST /api/messages/conversations
const startConversation = async (req, res) => {
  try {
    const { receiverId, productId } = req.body;
    const senderId = req.user._id;

    if (senderId.toString() === receiverId) {
      return res.status(400).json({ message: 'Cannot message yourself' });
    }

    // Find if a conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
        product: productId || null,
        unreadCounts: {
          [senderId.toString()]: 0,
          [receiverId.toString()]: 0
        }
      });
    } else if (productId && !conversation.product) {
      conversation.product = productId;
      await conversation.save();
    }

    const populatedConv = await Conversation.findById(conversation._id)
      .populate('participants', 'name username profileImage')
      .populate('product', 'name frontImage pricePerDay');

    res.json(populatedConv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all conversations for user
// @route   GET /api/messages/conversations
const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id
    })
    .populate('participants', 'name username profileImage')
    .populate('product', 'name frontImage')
    .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get messages for a conversation
// @route   GET /api/messages/:conversationId
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    // Verify user is part of conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });
    
    if (!conversation.participants.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });
    
    // Mark as read
    if (conversation.unreadCounts && conversation.unreadCounts.get(req.user._id.toString()) > 0) {
      conversation.unreadCounts.set(req.user._id.toString(), 0);
      await conversation.save();
    }
    await Message.updateMany({ conversationId, sender: { $ne: req.user._id }, isRead: false }, { isRead: true });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send a message
// @route   POST /api/messages
const sendMessage = async (req, res) => {
  try {
    const { conversationId, text } = req.body;
    const senderId = req.user._id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });

    if (!conversation.participants.includes(senderId)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const message = await Message.create({
      conversationId,
      sender: senderId,
      text
    });

    const receiverId = conversation.participants.find(p => p.toString() !== senderId.toString());

    // Update conversation
    conversation.lastMessage = text;
    let currentUnread = conversation.unreadCounts?.get(receiverId.toString()) || 0;
    conversation.unreadCounts.set(receiverId.toString(), currentUnread + 1);
    await conversation.save();

    // Create Notification if receiver is offline? Handled via socket potentially, 
    // but doing it here guarantees it. We will only create it if they aren't connected via socket? 
    // For simplicity, we just create a NEW_MESSAGE notification and the frontend handles deduping or just seeing it in the bell.
    await Notification.findOneAndUpdate(
      { recipient: receiverId, type: 'NEW_MESSAGE', sender: senderId },
      { message: 'Sent you a new message', isRead: false },
      { upsert: true, new: true }
    );

    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  startConversation,
  getConversations,
  getMessages,
  sendMessage
};
