const express = require('express');
const router = express.Router();
const { createTicket, getMyTickets, replyToTicket } = require('../controllers/supportController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/tickets', protect, createTicket);
router.get('/my-tickets', protect, getMyTickets);
router.post('/tickets/:id/reply', protect, replyToTicket);

module.exports = router;
