const express = require('express');
const router = express.Router();
const { 
  submitKyc, getPendingKyc, updateKycStatus,
  updateProfile, getPublicProfile, followUser,
  approveFollowRequest, rejectFollowRequest, unfollowUser,
  toggleLikeProduct, toggleSaveProduct,
  getLikedProducts, getSavedProducts
} = require('../controllers/userController');
const { protect, admin } = require('../middlewares/authMiddleware');
const { upload } = require('../utils/upload');

// Profile & Social Routes
router.put('/profile', protect, upload.single('profileImage'), updateProfile);
router.get('/liked', protect, getLikedProducts);
router.get('/saved', protect, getSavedProducts);
router.get('/profile/:id', protect, getPublicProfile);
router.post('/follow/:id', protect, followUser);
router.post('/approve-follow/:id', protect, approveFollowRequest);
router.post('/reject-follow/:id', protect, rejectFollowRequest);
router.post('/unfollow/:id', protect, unfollowUser);
router.post('/like/:id', protect, toggleLikeProduct);
router.post('/save/:id', protect, toggleSaveProduct);

// Renter/Provider routes
router.post('/kyc', protect, upload.fields([
  { name: 'idDocument', maxCount: 1 },
  { name: 'selfie', maxCount: 1 }
]), submitKyc);

// Admin routes
router.get('/admin/kyc-pending', protect, admin, getPendingKyc);
router.put('/admin/kyc/:id', protect, admin, updateKycStatus);

module.exports = router;
