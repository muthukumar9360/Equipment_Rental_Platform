const Booking = require('../models/Booking');
const Product = require('../models/Product');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Create new booking
// @route   POST /api/bookings
const createBooking = async (req, res) => {
  try {
    const { productId, startDate, endDate } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Prevent overlapping bookings on already booked dates
    const existingConflict = await Booking.findOne({
      product: productId,
      status: { $in: ['Approved', 'Handover Scheduled', 'Active', 'Return Scheduled', 'Pending'] },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } }
      ]
    });

    if (existingConflict) {
      return res.status(400).json({ 
        message: 'This equipment is already booked/reserved for the selected dates. Please choose different dates.' 
      });
    }

    // Calculate days and price
    const diffTime = Math.abs(end - start);
    const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24))); 
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

// @desc    Get booked date ranges for a product
// @route   GET /api/bookings/product/:productId/booked-dates
const getBookedDates = async (req, res) => {
  try {
    const { productId } = req.params;
    const bookings = await Booking.find({
      product: productId,
      status: { $in: ['Approved', 'Handover Scheduled', 'Active', 'Return Scheduled', 'Pending'] }
    }).select('startDate endDate status');

    res.json(bookings);
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
    })
      .populate({
        path: 'product',
        select: 'name frontImage pricePerDay securityDeposit category subCategory providerId images',
        populate: { path: 'providerId', select: 'name email phone username' }
      })
      .populate('renter', 'name email phone username')
      .populate('provider', 'name email phone username');
    
    const formatted = bookings.map(b => {
      const obj = b.toObject ? b.toObject() : { ...b };
      if (!obj.provider || typeof obj.provider === 'string' || !obj.provider.name) {
        if (obj.product && obj.product.providerId) {
          obj.provider = obj.product.providerId;
        }
      }
      return obj;
    });

    res.json(formatted);
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

    const isProvider = Boolean(booking.provider && booking.provider.toString() === req.user._id.toString());
    const isRenter = Boolean(booking.renter && booking.renter.toString() === req.user._id.toString());
    const isAdmin = req.user.role === 'admin';

    // Authorization check
    if (!isProvider && !isRenter && !isAdmin) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Role-specific action permissions
    if (isRenter && !isProvider && !isAdmin) {
      // Renter can approve receipt ('Active') or initiate return ('Return Scheduled')
      if (status !== 'Active' && status !== 'Return Scheduled') {
        return res.status(403).json({ message: 'Renter can only confirm product receipt or initiate return' });
      }
    }

    booking.status = status;
    
    // Automatic Settlement and Security Deposit Refund upon Provider confirmation of Return (NO ADMIN APPROVAL NEEDED)
    if (status === 'Completed') {
      const renterUser = await User.findById(booking.renter);
      const providerUser = await User.findById(booking.provider);

      const clientUpi = renterUser?.upiId || 'client@upi';
      const providerUpi = providerUser?.upiId || 'provider@upi';

      // 1. Automatic Razorpay Refund of Security Deposit to Client UPI
      booking.refundStatus = 'Completed';
      booking.refundAmount = booking.securityDeposit || 0;
      booking.refundTxnId = 'RZP_REF_' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase();
      booking.refundUpiId = clientUpi;
      booking.refundDate = new Date();

      // 2. Automatic Razorpay Payout of Rental Fee to Provider
      booking.providerPayoutStatus = 'Completed';
      booking.providerPayoutAmount = booking.totalPrice || 0;
      booking.providerPayoutTxnId = 'RZP_PAY_' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase();
      booking.providerPayoutDate = new Date();

      // 3. Update internal escrow ledger
      booking.ledger.depositHeld = false;
      booking.ledger.paymentSettled = true;

      // 4. Send Instant Real-time Notifications
      try {
        await Notification.create([
          {
            recipient: booking.renter,
            sender: booking.provider,
            type: 'PAYMENT_ALERT',
            message: `Rental return verified! Your security deposit of ₹${booking.securityDeposit} has been automatically refunded to UPI ${clientUpi} (Txn: ${booking.refundTxnId}).`
          },
          {
            recipient: booking.provider,
            sender: booking.renter,
            type: 'PAYMENT_ALERT',
            message: `Rental gear returned & verified! Rental earnings of ₹${booking.totalPrice} have been transferred to your account (Txn: ${booking.providerPayoutTxnId}).`
          }
        ]);
      } catch (notifErr) {
        console.error('Notification dispatch error:', notifErr);
      }
    } else if (status === 'Approved' || status === 'Active') {
      booking.ledger.depositHeld = true;
    } else if (status === 'Cancelled') {
      booking.ledger.depositHeld = false;
      booking.ledger.paymentSettled = true;
    }

    await booking.save();
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user payment history (rentals, refunds, and payouts)
// @route   GET /api/bookings/my-payments
const getMyPayments = async (req, res) => {
  try {
    const bookings = await Booking.find({
      $or: [{ renter: req.user._id }, { provider: req.user._id }]
    })
      .populate('product', 'name frontImage pricePerDay securityDeposit category images')
      .populate('renter', 'name email phone username upiId bankDetails')
      .populate('provider', 'name email phone username upiId bankDetails')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate({
        path: 'product',
        select: 'name frontImage pricePerDay securityDeposit category subCategory providerId images brand model location conditionScore serialNumber',
        populate: { path: 'providerId', select: 'name email phone username equiporaId upiId bankAccountNumber ifscCode trustScore' }
      })
      .populate('renter', 'name email phone username equiporaId upiId bankAccountNumber ifscCode trustScore')
      .populate('provider', 'name email phone username equiporaId upiId bankAccountNumber ifscCode trustScore');
    
    const formatted = bookings.map(b => {
      const obj = b.toObject ? b.toObject() : { ...b };
      if (!obj.provider || typeof obj.provider === 'string' || !obj.provider.name) {
        if (obj.product && obj.product.providerId) {
          obj.provider = obj.product.providerId;
        }
      }
      return obj;
    });

    res.json(formatted);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = {
  getAllBookings,
  createBooking,
  getBookings,
  updateBookingStatus,
  getBookedDates,
  getMyPayments
};
