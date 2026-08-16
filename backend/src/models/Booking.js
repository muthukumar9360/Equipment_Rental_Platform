const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  renter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  
  totalPrice: { type: Number, required: true },
  securityDeposit: { type: Number, required: true },
  
  status: {
    type: String,
    enum: [
      'Pending', 
      'Approved', 
      'Handover Scheduled', 
      'Active', 
      'Return Scheduled', 
      'Completed', 
      'Disputed', 
      'Cancelled'
    ],
    default: 'Pending'
  },

  // Internal simulated ledger for academic project
  ledger: {
    depositHeld: { type: Boolean, default: false },
    paymentSettled: { type: Boolean, default: false }
  },
  
  // To link inspections
  handoverInspectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Inspection' },
  returnInspectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Inspection' }
  
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
