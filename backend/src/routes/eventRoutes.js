const express = require('express');
const router = express.Router();
const { getEvents, markAsRead } = require('../controllers/eventController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', protect, getEvents);
router.put('/:id/read', protect, markAsRead);

module.exports = router;
