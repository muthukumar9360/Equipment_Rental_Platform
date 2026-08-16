const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  eventType: { 
    type: String, 
    enum: [
      'Booking Created', 
      'Booking Approved', 
      'Handover Scheduled', 
      'Handover Completed',
      'Return Initiated',
      'Return Inspection Completed',
      'Possible Difference Detected',
      'Dispute Opened',
      'Rental Completed'
    ], 
    required: true 
  },
  
  message: { type: String, required: true },
  readStatus: { type: Boolean, default: false }

}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
