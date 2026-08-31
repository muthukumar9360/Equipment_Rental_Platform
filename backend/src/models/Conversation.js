const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product' // Optional context for the conversation
  },
  lastMessage: {
    type: String
  },
  unreadCounts: {
    type: Map,
    of: Number,
    default: {}
  }
}, { timestamps: true });

module.exports = mongoose.model('Conversation', conversationSchema);
