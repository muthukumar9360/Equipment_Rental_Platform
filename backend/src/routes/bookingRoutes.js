const express = require('express');
const router = express.Router();
const { createBooking, getBookings, updateBookingStatus } = require('../controllers/bookingController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/')
  .post(protect, createBooking)
  .get(protect, getBookings);

router.put('/:id/status', protect, updateBookingStatus);

module.exports = router;
