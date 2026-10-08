const express = require('express');
const router = express.Router();
const { createBooking, getBookings, updateBookingStatus, getAllBookings, getBookedDates, getMyPayments } = require('../controllers/bookingController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/product/:productId/booked-dates', getBookedDates);
router.get('/my-payments', protect, getMyPayments);

router.route('/')
  .post(protect, createBooking)
  .get(protect, getBookings);

router.put('/:id/status', protect, updateBookingStatus);

router.get('/admin/all', protect, getAllBookings);

module.exports = router;
