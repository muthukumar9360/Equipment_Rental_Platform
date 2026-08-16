const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  role: { type: String, enum: ['renter', 'provider', 'admin'], default: 'renter' },
  trustScore: { type: Number, default: 0 },
  
  // Verification/KYC Fields
  kycStatus: { 
    type: String, 
    enum: ['Basic Verified', 'Identity Submitted', 'AI/Automated Checks Passed', 'Manually Verified', 'Fully Verified'],
    default: 'Basic Verified'
  },
  kycData: {
    idDocumentUrl: { type: String },
    selfieUrl: { type: String },
    idType: { type: String },
    extractedData: { type: Object } // OCR data
  },
  
  isVerified: { type: Boolean, default: false } // Provider verified
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
