const Razorpay = require('razorpay');
const crypto = require('crypto');
const Booking = require('../models/Booking');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createOrder = async (req, res) => {
  try {
    const { amount, bookingId } = req.body;
    const options = {
      amount: Math.round(amount * 100), // convert to paisa
      currency: "INR",
      receipt: `receipt_order_${bookingId}`
    };
    
    const order = await razorpay.orders.create(options);
    if (!order) return res.status(500).json({ message: "Failed to create order" });
    
    res.json(order);
  } catch (error) {
    console.error('Error creating razorpay order:', error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    const sha = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = sha.digest("hex");

    if (digest !== razorpay_signature) {
      return res.status(400).json({ message: "Transaction is not valid!" });
    }

    // Payment is valid, update booking
    const booking = await Booking.findById(bookingId).populate('product');
    if (booking) {
      booking.status = 'Active';
      booking.ledger.paymentSettled = true;
      await booking.save();
      
      // Send notifications (using simple Notification creation if model exists, or console logging for now)
      try {
        const Notification = require('../models/Notification');
        if (Notification) {
          // Notify Provider
          await Notification.create({
            user: booking.provider,
            message: `Payment received for ${booking.product?.name}. Rent has started.`,
            type: 'booking_update'
          });
          // Notify Renter
          await Notification.create({
            user: booking.renter,
            message: `Payment successful for ${booking.product?.name}. Your rent has started.`,
            type: 'booking_update'
          });
        }
      } catch(e) {
        console.error("Failed to create notifications", e);
      }

      return res.json({ message: "success", orderId: razorpay_order_id, paymentId: razorpay_payment_id, booking });
    } else {
      return res.status(404).json({ message: "Booking not found" });
    }

  } catch (error) {
    console.error('Error verifying razorpay payment:', error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
