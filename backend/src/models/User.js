const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  emailVerified: { type: Boolean, default: false },
  phone: { type: String, required: true },
  mobileVerified: { type: Boolean, default: false },
  password: { type: String, required: true },
  
  role: { type: String, enum: ['user', 'admin'], default: 'user' }, // Universal Role
  trustScore: { type: Number, default: 0 },
  
  // Personal Details
  dob: { type: Date },
  gender: { type: String, enum: ['Male', 'Female', 'Other', 'Prefer not to say'] },
  address: {
    state: { type: String },
    district: { type: String },
    city: { type: String },
    line1: { type: String },
    pincode: { type: String }
  },

  // Profile & Social Features
  profileImage: { type: String }, // URL from cloudinary
  bio: { type: String, maxlength: 500 },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  followRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  likedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  savedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],


  // Verification/KYC Fields
  equiporaId: { type: String, unique: true, sparse: true },
  kycStatus: { 
    type: String, 
    enum: [
      'DRAFT', 
      'PENDING_REVIEW', 
      'MORE_INFO_REQUIRED', 
      'REJECTED', 
      'SUSPENDED', 
      'ACTIVE'
    ],
    default: 'DRAFT'
  },
  
  kycData: {
    primaryDocumentType: { type: String, enum: ['Aadhaar', 'Passport', 'Voter ID', 'Driving Licence'] },
    primaryDocumentNumber: { type: String }, // Masked in UI later
    aadhaarNumber: { type: String },
    panNumber: { type: String },
    otherDocType: { type: String },
    otherDocNumber: { type: String },
    documentUrls: [
      {
        docType: { type: String }, // e.g., 'Aadhaar Front', 'PAN Card'
        url: { type: String }
      }
    ],
    extractedData: { type: Object } // OCR data if implemented later
  },
  
  isVerified: { type: Boolean, default: false } // Legacy flag just for quick checks
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
