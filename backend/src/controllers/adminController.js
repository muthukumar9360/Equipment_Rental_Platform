const User = require('../models/User');
const Product = require('../models/Product');
const Notification = require('../models/Notification');
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

// @desc    Get all users for admin
// @route   GET /api/admin/users
const getAdminUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get products for admin (can filter by verificationStatus)
// @route   GET /api/admin/products
const getAdminProducts = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status) {
      query.verificationStatus = status;
    }
    const products = await Product.find(query).populate('providerId', 'name email').sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Review product verification
// @route   POST /api/admin/products/review
const reviewProduct = async (req, res) => {
  try {
    const { productId, newStatus, reason } = req.body;
    
    if (!productId || !newStatus) {
      return res.status(400).json({ message: 'Product ID and new status are required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.verificationStatus = newStatus;
    // We could save notes or reasons to a VerificationAudit collection if needed
    await product.save();

    // Create Notification
    let notificationType = null;
    let message = '';
    if (newStatus === 'Verified') {
      notificationType = 'PRODUCT_VERIFIED';
      message = `Your product ${product.name} has been verified and is now live!`;
    } else if (newStatus === 'Rejected') {
      notificationType = 'PRODUCT_REJECTED';
      message = `Your product ${product.name} was rejected. Reason: ${reason}`;
    }

    if (notificationType) {
      await Notification.create({
        recipient: product.providerId,
        type: notificationType,
        product: product._id,
        message: message
      });
    }

    res.json({ message: `Product status updated to ${newStatus}`, product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/admin/products/:id
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPendingVerifications,
  reviewUserVerification,
  getAdminUsers,
  getAdminProducts,
  reviewProduct,
  deleteUser,
  deleteProduct
};
