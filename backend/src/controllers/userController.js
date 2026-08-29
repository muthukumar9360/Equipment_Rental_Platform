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

// --- Social Networking & Profile Features ---

// @desc    Update user profile
// @route   PUT /api/users/profile
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = req.body.name || user.name;
    user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
    
    // Check if there is an uploaded file
    if (req.file) {
      user.profileImage = req.file.path; // Cloudinary URL
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      username: updatedUser.username,
      bio: updatedUser.bio,
      profileImage: updatedUser.profileImage
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get public profile
// @route   GET /api/users/profile/:id
const getPublicProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('name username bio profileImage followers following followRequests trustScore isVerified kycStatus role')
      .populate('followers', 'name username profileImage')
      .populate('following', 'name username profileImage')
      .populate('followRequests', 'name username profileImage');
      
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Follow a user directly (and send notification)
// @route   POST /api/users/follow/:id
const followUser = async (req, res) => {
  try {
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const targetUser = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);

    if (!targetUser) return res.status(404).json({ message: 'User not found' });

    // Check if already following
    if (targetUser.followers.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already following this user' });
    }

    // Direct Follow Logic
    targetUser.followers.push(req.user._id);
    currentUser.following.push(targetUser._id);

    // Use followRequests as a notification queue for the target user
    if (!targetUser.followRequests.includes(req.user._id)) {
      targetUser.followRequests.push(req.user._id);
    }

    await targetUser.save();
    await currentUser.save();

    res.json({ message: 'Successfully followed user' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve follow request
// @route   POST /api/users/approve-follow/:id
const approveFollowRequest = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const requesterId = req.params.id;

    if (!user.followRequests.includes(requesterId)) {
      return res.status(400).json({ message: 'No follow request from this user' });
    }

    user.followRequests = user.followRequests.filter(id => id.toString() !== requesterId);
    if (!user.followers.includes(requesterId)) {
      user.followers.push(requesterId);
    }
    await user.save();

    const requester = await User.findById(requesterId);
    if (requester && !requester.following.includes(user._id)) {
      requester.following.push(user._id);
      await requester.save();
    }

    res.json({ message: 'Follow request approved' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject follow request
// @route   POST /api/users/reject-follow/:id
const rejectFollowRequest = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const requesterId = req.params.id;

    user.followRequests = user.followRequests.filter(id => id.toString() !== requesterId);
    await user.save();

    res.json({ message: 'Follow request rejected' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Unfollow a user
// @route   POST /api/users/unfollow/:id
const unfollowUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;

    const targetUser = await User.findById(targetUserId);
    if (targetUser) {
      targetUser.followers = targetUser.followers.filter(id => id.toString() !== currentUserId.toString());
      await targetUser.save();
    }

    const currentUser = await User.findById(currentUserId);
    if (currentUser) {
      currentUser.following = currentUser.following.filter(id => id.toString() !== targetUserId.toString());
      await currentUser.save();
    }

    res.json({ message: 'Unfollowed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle Like on a Product
// @route   POST /api/users/like/:id
const toggleLikeProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const user = await User.findById(req.user._id);
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const index = user.likedProducts.indexOf(productId);
    let isLiked = false;
    
    if (index === -1) {
      user.likedProducts.push(productId);
      isLiked = true;
    } else {
      user.likedProducts.splice(index, 1);
    }
    
    await user.save();
    res.json({ message: isLiked ? 'Product liked' : 'Product unliked', isLiked });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle Save (Watch Later) on a Product
// @route   POST /api/users/save/:id
const toggleSaveProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const user = await User.findById(req.user._id);
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const index = user.savedProducts.indexOf(productId);
    let isSaved = false;
    
    if (index === -1) {
      user.savedProducts.push(productId);
      isSaved = true;
    } else {
      user.savedProducts.splice(index, 1);
    }
    
    await user.save();
    res.json({ message: isSaved ? 'Product saved for later' : 'Product removed from saved', isSaved });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Liked Products
// @route   GET /api/users/liked
const getLikedProducts = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('likedProducts');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.likedProducts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Saved Products
// @route   GET /api/users/saved
const getSavedProducts = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('savedProducts');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.savedProducts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  submitKyc, 
  getPendingKyc, 
  updateKycStatus,
  updateProfile,
  getPublicProfile,
  followUser,
  approveFollowRequest,
  rejectFollowRequest,
  unfollowUser,
  toggleLikeProduct,
  toggleSaveProduct,
  getLikedProducts,
  getSavedProducts
};
