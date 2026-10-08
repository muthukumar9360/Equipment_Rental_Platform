const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { createOrder, verifyPayment, refundPayment } = require('../controllers/paymentController');

router.post('/orders', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.post('/refund', protect, refundPayment);

module.exports = router;
