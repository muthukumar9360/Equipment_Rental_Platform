const express = require('express');
const router = express.Router();
const { submitKyc, getPendingKyc, updateKycStatus } = require('../controllers/userController');
const { protect, admin } = require('../middlewares/authMiddleware');
const { upload } = require('../utils/cloudinary');

// Renter/Provider routes
router.post('/kyc', protect, upload.fields([
  { name: 'idDocument', maxCount: 1 },
  { name: 'selfie', maxCount: 1 }
]), submitKyc);

// Admin routes
router.get('/admin/kyc-pending', protect, admin, getPendingKyc);
router.put('/admin/kyc/:id', protect, admin, updateKycStatus);

module.exports = router;
