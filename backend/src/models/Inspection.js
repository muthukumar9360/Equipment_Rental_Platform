const mongoose = require('mongoose');

const evidenceSchema = new mongoose.Schema({
  angle: { type: String, required: true }, // e.g., 'front', 'back', 'serial', 'accessory_name'
  imageUrl: { type: String, required: true },
  hash: { type: String, required: true }, // SHA-256 for tamper evidence
});

const checklistItemSchema = new mongoose.Schema({
  item: { type: String, required: true },
  status: { type: String, enum: ['Pass', 'Fail', 'Not Applicable'], default: 'Pass' },
  notes: { type: String }
});

const inspectionSchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  inspector: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Usually provider or renter
  
  type: { type: String, enum: ['Handover', 'Return'], required: true },
  
  checklist: [checklistItemSchema],
  evidence: [evidenceSchema],
  
  // For return inspections comparing against handover
  aiComparisonResult: { 
    type: String, 
    enum: ['No Significant Difference', 'Possible Difference Detected', 'Manual Review Required', 'N/A'],
    default: 'N/A'
  },
  aiComparisonNotes: { type: String },
  
  signature: { type: Boolean, default: false }, // User acknowledges
  completedAt: { type: Date }

}, { timestamps: true });

module.exports = mongoose.model('Inspection', inspectionSchema);
