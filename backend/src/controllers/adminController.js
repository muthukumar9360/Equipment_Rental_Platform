const User = require('../models/User');
const VerificationAudit = require('../models/VerificationAudit');

// @desc    Get all users pending verification
// @route   GET /api/admin/verifications/pending
const getPendingVerifications = async (req, res) => {
  try {
    const users = await User.find({ kycStatus: { $ne: 'ACTIVE' }, role: 'user' })
                            .select('-password')
                            .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Review user verification (Approve/Reject/Request Info)
// @route   POST /api/admin/verifications/review
const reviewUserVerification = async (req, res) => {
  try {
    const { userId, newStatus, reason, notes } = req.body;
    
    if (!userId || !newStatus) {
      return res.status(400).json({ message: 'User ID and new status are required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const previousStatus = user.kycStatus;
    user.kycStatus = newStatus;
    
    // If we're making them active, legacy isVerified to true
    if (newStatus === 'ACTIVE') {
      user.isVerified = true;
    }

    await user.save();

    // Log the audit trail
    await VerificationAudit.create({
      user: user._id,
      admin: req.user._id,
      previousStatus,
      newStatus,
      action: newStatus,
      reason: reason || '',
      notes: notes || ''
    });

    res.json({ message: `User status updated to ${newStatus}`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPendingVerifications,
  reviewUserVerification
};
