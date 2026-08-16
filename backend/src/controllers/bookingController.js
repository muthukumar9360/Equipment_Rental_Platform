const Booking = require('../models/Booking');
const Product = require('../models/Product');

// @desc    Create new booking
// @route   POST /api/bookings
const createBooking = async (req, res) => {
  try {
    const { productId, startDate, endDate } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Calculate days and price
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    const totalPrice = diffDays * product.pricePerDay;

    const booking = await Booking.create({
      product: productId,
      renter: req.user._id,
      provider: product.providerId,
      startDate,
      endDate,
      totalPrice,
      securityDeposit: product.securityDeposit
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user bookings
// @route   GET /api/bookings
const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      $or: [{ renter: req.user._id }, { provider: req.user._id }]
    }).populate('product', 'name images');
    
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Authorization check
    if (booking.provider.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    booking.status = status;
    
    // Simulate Ledger
    if (status === 'Approved') {
      booking.ledger.depositHeld = true;
    } else if (status === 'Completed' || status === 'Cancelled') {
      booking.ledger.depositHeld = false;
      booking.ledger.paymentSettled = true;
    }

    await booking.save();
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createBooking, getBookings, updateBookingStatus };
