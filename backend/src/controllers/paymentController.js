const Razorpay = require('razorpay');
const crypto = require('crypto');
const Booking = require('../models/Booking');

const createOrder = async (req, res) => {
  try {
    const { amount, receipt } = req.body;
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: amount * 100, // amount in smallest currency unit
      currency: "INR",
      receipt: receipt
    };

    const order = await instance.orders.create(options);

    if (!order) return res.status(500).send("Some error occured");

    res.json(order);
  } catch (error) {
    res.status(500).send(error);
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      // Payment is verified
      // Find booking and update paymentStatus
      const booking = await Booking.findById(bookingId);
      if (booking) {
        booking.paymentStatus = 'Paid';
        booking.paymentId = razorpay_payment_id;
        booking.status = 'Approved';
        await booking.save();
      }

      return res.status(200).json({ message: "Payment verified successfully" });
    } else {
      return res.status(400).json({ message: "Invalid signature sent!" });
    }
  } catch (error) {
    res.status(500).send(error);
  }
};


const refundPayment = async (req, res) => {
  try {
    // In production, initiate Razorpay Refund API here using req.body.bookingId
    res.status(200).json({ message: 'Refund initiated successfully' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = {
  refundPayment,
  createOrder,
  verifyPayment
};
