const User = require('../models/User');
const OtpRecord = require('../models/OtpRecord');
const jwt = require('jsonwebtoken');

const generateToken = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d'
  });

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000
  });
};

// @desc    Check if username is available
// @route   POST /api/auth/check-username
const checkUsername = async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ message: 'Username is required' });
    
    const userExists = await User.findOne({ username: username.trim() });
    res.json({ available: !userExists });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send OTP
// @route   POST /api/auth/send-otp
const sendOtp = async (req, res) => {
  try {
    const { identifier, type } = req.body; // mobile or email
    if (!identifier) return res.status(400).json({ message: 'Identifier is required' });
    
    // Check if identifier is already used by a verified active user, unless this is for a login
    if (type !== 'login') {
      const userExists = await User.findOne({ $or: [{ email: identifier }, { phone: identifier }] });
      if (userExists && userExists.kycStatus === 'ACTIVE') {
        return res.status(400).json({ message: 'This contact detail is already in use by an active account.' });
      }
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    console.log(`[MOCK OTP SERVICE] OTP for ${identifier} is ${otp}`);

    // Store in DB (expires in 10 minutes)
    await OtpRecord.create({
      identifier,
      otpHash: otp, // Pre-save hook will hash this
      expiresAt: new Date(Date.now() + 10 * 60000)
    });

    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
const verifyOtp = async (req, res) => {
  try {
    const { identifier, otp } = req.body;
    if (!identifier || !otp) return res.status(400).json({ message: 'Identifier and OTP are required' });

    // For dev testing, bypass if OTP is '123456'
    if (otp === '123456') {
       return res.json({ message: 'OTP verified successfully' });
    }

    // Find the latest unexpired OTP for this identifier
    const otpRecord = await OtpRecord.findOne({ 
      identifier, 
      expiresAt: { $gt: new Date() } 
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({ message: 'OTP expired or not found' });
    }

    if (otpRecord.attempts >= otpRecord.maxAttempts) {
      return res.status(400).json({ message: 'Maximum verification attempts exceeded. Please request a new OTP.' });
    }

    const isMatch = await otpRecord.matchOtp(otp);
    
    if (isMatch) {
      // OTP verified successfully
      // Delete the record to prevent reuse
      await OtpRecord.deleteOne({ _id: otpRecord._id });
      res.json({ message: 'OTP verified successfully' });
    } else {
      otpRecord.attempts += 1;
      await otpRecord.save();
      res.status(400).json({ message: 'Invalid OTP' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Final Registration (Creates User, Saves Files)
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const { 
      username, name, email, phone, password, 
      dob, gender, state, district, city, line1, pincode,
      primaryDocumentType, aadhaarNumber, panNumber, otherDocType, otherDocNumber
    } = req.body;

    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    // Generate Equipora ID
    const equiporaId = 'EQ-USER-' + Math.random().toString(36).substr(2, 4).toUpperCase() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();

    // Map uploaded files
    const documentUrls = [];
    if (req.files && Array.isArray(req.files)) {
      req.files.forEach(file => {
        documentUrls.push({
          docType: file.fieldname,
          url: '/uploads/' + file.filename
        });
      });
    } else if (req.files) {
      Object.keys(req.files).forEach(fieldName => {
        req.files[fieldName].forEach(file => {
          documentUrls.push({
            docType: fieldName,
            url: '/uploads/' + file.filename
          });
        });
      });
    }

    const user = await User.create({
      username, name, email, phone, password,
      emailVerified: true, // Assuming frontend checked this via OTP
      mobileVerified: true,
      role: 'user',
      dob, gender,
      address: { state, district, city, line1, pincode },
      equiporaId,
      kycStatus: 'PENDING_REVIEW',
      kycData: {
        primaryDocumentType,
        aadhaarNumber,
        panNumber,
        otherDocType,
        otherDocNumber,
        documentUrls
      }
    });

    if (user) {
      res.status(201).json({
        message: 'Application submitted successfully',
        equiporaId: user.equiporaId,
        kycStatus: user.kycStatus
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Pre-login to verify credentials and trigger OTP
// @route   POST /api/auth/pre-login
const preLoginUser = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    const user = await User.findOne({ username });

    if (user && (await user.matchPassword(password))) {
      // Validate role
      if (role && user.role !== role) {
         return res.status(403).json({ message: `Access denied. You are not registered as an ${role}.` });
      }

      // Check KYC status
      if (user.kycStatus !== 'ACTIVE' && user.role !== 'admin') {
        return res.status(403).json({ 
          message: 'Account is not active', 
          kycStatus: user.kycStatus 
        });
      }

      res.json({
        success: true,
        email: user.email,
        phone: user.phone,
        message: 'Credentials valid. Proceed to OTP.'
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token (Unified Login)
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (user && (await user.matchPassword(password))) {
      // Check status
      if (user.kycStatus !== 'ACTIVE') {
        return res.status(403).json({ 
          message: 'Account is not active', 
          kycStatus: user.kycStatus 
        });
      }

      generateToken(res, user._id);
      res.json({
        _id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        kycStatus: user.kycStatus
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
const logoutUser = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0)
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get user profile
// @route   GET /api/auth/profile
const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id).populate('followRequests', 'name username profileImage');

  if (user) {
    res.json({
      _id: user._id,
      username: user.username,
      name: user.name,
      email: user.email,
      phone: user.phone,
      dob: user.dob,
      address: user.address,
      role: user.role,
      kycStatus: user.kycStatus,
      kycData: user.kycData,
      trustScore: user.trustScore,
      equiporaId: user.equiporaId,
      likedProducts: user.likedProducts || [],
      savedProducts: user.savedProducts || [],
      followRequests: user.followRequests || []
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

module.exports = {
  checkUsername,
  sendOtp,
  verifyOtp,
  registerUser,
  preLoginUser,
  loginUser,
  logoutUser,
  getUserProfile
};
