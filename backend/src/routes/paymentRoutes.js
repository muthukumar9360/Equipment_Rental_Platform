const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const paymentController = require('../controllers/paymentController');

// Route: POST /api/payment/create-order
router.post('/create-order', protect, paymentController.createOrder);

// Route: POST /api/payment/verify
router.post('/verify', protect, paymentController.verifyPayment);

module.exports = router;
