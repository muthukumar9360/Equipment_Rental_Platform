const express = require('express');
const router = express.Router();
const { 
  startConversation, 
  getConversations, 
  getMessages, 
  sendMessage 
} = require('../controllers/messageController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/conversations')
  .post(protect, startConversation)
  .get(protect, getConversations);

router.route('/:conversationId')
  .get(protect, getMessages);

router.route('/')
  .post(protect, sendMessage);

module.exports = router;
