const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const otpRecordSchema = new mongoose.Schema({
  identifier: { type: String, required: true }, // Mobile or Email
  otpHash: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  attempts: { type: Number, default: 0 },
  maxAttempts: { type: Number, default: 3 }
}, { timestamps: true });

// Hash OTP before saving
otpRecordSchema.pre('save', async function() {
  if (!this.isModified('otpHash')) return;
  const salt = await bcrypt.genSalt(10);
  this.otpHash = await bcrypt.hash(this.otpHash, salt);
});

// Match OTP
otpRecordSchema.methods.matchOtp = async function(enteredOtp) {
  return await bcrypt.compare(enteredOtp, this.otpHash);
};

module.exports = mongoose.model('OtpRecord', otpRecordSchema);
