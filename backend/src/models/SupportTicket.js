const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ticketId: { type: String, unique: true, required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  category: { 
    type: String, 
    required: true,
    enum: [
      'Network Error During Payment',
      'Amount Debited But Booking Unconfirmed',
      'Security Deposit Refund Query',
      'Product Delivery / Handover Issue',
      'Damaged or Malfunctioning Gear',
      'General Payment & Account Issue'
    ]
  },
  transactionId: { type: String, trim: true },
  screenshotUrl: { type: String },
  description: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Resolved', 'Under Investigation', 'Open'], 
    default: 'Resolved' 
  },
  aiDiagnosis: { type: String },
  resolutionSteps: [{ type: String }],
  chatHistory: [
    {
      sender: { type: String, enum: ['user', 'bot', 'support_agent'] },
      message: { type: String },
      timestamp: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
