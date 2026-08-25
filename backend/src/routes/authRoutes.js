const express = require('express');
const router = express.Router();
const multer = require('multer');
const { 
  registerUser, preLoginUser, loginUser, logoutUser, getUserProfile, 
  checkUsername, sendOtp, verifyOtp 
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

const fs = require('fs');
const path = require('path');

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({ dest: 'uploads/' }); // simple local storage for now

router.post('/check-username', checkUsername);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);

// Accept any files thrown at it during registration
router.post('/register', upload.any(), registerUser);

router.post('/pre-login', preLoginUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/profile', protect, getUserProfile);

module.exports = router;
