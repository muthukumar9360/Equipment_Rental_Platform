const User = require('../models/User');

// @desc    Submit KYC documents
// @route   POST /api/users/kyc
const submitKyc = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      // Expecting Cloudinary to have processed the files and put URLs in req.files
      const idDocumentUrl = req.files['idDocument'] ? req.files['idDocument'][0].path : null;
      const selfieUrl = req.files['selfie'] ? req.files['selfie'][0].path : null;

      if (!idDocumentUrl || !selfieUrl) {
        return res.status(400).json({ message: 'Both ID document and selfie are required' });
      }

      user.kycStatus = 'Identity Submitted';
      user.kycData = {
        idDocumentUrl,
        selfieUrl,
        idType: req.body.idType || 'Passport',
      };

      await user.save();

      res.json({
        message: 'KYC submitted successfully',
        kycStatus: user.kycStatus
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin: Get pending KYC requests
// @route   GET /api/users/admin/kyc-pending
const getPendingKyc = async (req, res) => {
  try {
    const users = await User.find({ kycStatus: 'Identity Submitted' }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin: Approve/Reject KYC
// @route   PUT /api/users/admin/kyc/:id
const updateKycStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { status, reason } = req.body; // status: 'Manually Verified', 'Rejected'

    if (user) {
      const prevStatus = user.kycStatus;
      user.kycStatus = status;
      if (status === 'Manually Verified' || status === 'Fully Verified') {
        user.isVerified = true;
      } else {
        user.isVerified = false;
      }
      
      await user.save();
      
      // TODO: Log to Audit Log

      res.json({
        message: `KYC status updated to ${status}`,
        kycStatus: user.kycStatus
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { submitKyc, getPendingKyc, updateKycStatus };
