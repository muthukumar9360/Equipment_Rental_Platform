const mongoose = require('mongoose');

const accessorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  isPresentAtHandover: { type: Boolean, default: false },
  isPresentAtReturn: { type: Boolean, default: false }
});

const productSchema = new mongoose.Schema({
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  subCategory: { type: String, required: false },
  brand: { type: String, required: true },
  model: { type: String, required: true },
  specifications: { type: Map, of: String },
  pricePerDay: { type: Number, required: true },
  securityDeposit: { type: Number, required: true },
  description: { type: String },
  
  images: [{ type: String }], // Cloudinary URLs
  
  serialNumber: { type: String },
  
  // Invoice / Ownership Proof
  invoiceUrl: { type: String },
  invoiceData: { type: Object }, // Data extracted via OCR
  
  accessories: [accessorySchema],
  
  location: { type: String, required: true, default: 'Chennai' },
  
  // Equipora Digital Trust Passport Fields
  verificationStatus: { 
    type: String, 
    enum: ['Pending', 'AI Checks Passed', 'Manual Review Required', 'Verified', 'Rejected'],
    default: 'Pending'
  },
  conditionScore: { type: Number, default: 100, min: 0, max: 100 },
  trustScore: { type: Number, default: 100, min: 0, max: 100 },
  
  // Fingerprint data for AI CV checks
  visualFingerprint: { type: Object }
  
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
