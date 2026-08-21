const mongoose = require('mongoose');

const verificationAuditSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  previousStatus: { type: String, required: true },
  newStatus: { type: String, required: true },
  action: { type: String, required: true },
  reason: { type: String },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('VerificationAudit', verificationAuditSchema);
