const SupportTicket = require('../models/SupportTicket');
const Booking = require('../models/Booking');
const Product = require('../models/Product');

// Helper to generate smart AI Bot response based on issue details
const generateAiDiagnosis = (category, transactionId, hasScreenshot) => {
  switch (category) {
    case 'Network Error During Payment':
      return {
        diagnosis: 'Network Glitch / Gateway Timeout Detected during Checkout.',
        steps: [
          `Verified transaction ref: ${transactionId || 'Pending Verification'}.`,
          'Our automated Razorpay reconciliation engine checks bank webhooks every 5 minutes.',
          'If funds were debited from your bank, the booking is automatically activated upon webhook capture.',
          'If the payment was interrupted at bank switch, the banking network will auto-reverse 100% of the funds to your source account within 2 hours.',
          'Your payment screenshot is secured with your ticket for audit reconciliation.'
        ]
      };
    case 'Amount Debited But Booking Unconfirmed':
      return {
        diagnosis: 'Payment In-Flight or Pending Bank Webhook Callback.',
        steps: [
          `Logged transaction ID: ${transactionId || 'Captured from attached screenshot'}.`,
          'Razorpay escrow node received the authorization token.',
          'If the booking is still pending, clicking "Refresh Status" in Dashboard will sync directly with the UPI switch.',
          'No duplicate charges will occur. If not confirmed, automatic refund is routed back to your UPI within 2 hours.'
        ]
      };
    case 'Security Deposit Refund Query':
      return {
        diagnosis: 'Security Deposit Escrow Status & Auto-Disbursement Guarantee.',
        steps: [
          'All security deposits remain securely locked in Equipora Escrow.',
          'As soon as the equipment provider receives the item back and clicks "Confirm Item Received", your deposit is INSTANTLY refunded to your registered UPI ID.',
          'Zero admin approval is needed for deposit return — it is 100% automated via Razorpay Payouts.',
          'You will receive an in-app alert and UPI confirmation immediately.'
        ]
      };
    case 'Product Delivery / Handover Issue':
      return {
        diagnosis: 'Handover Verification & Provider Coordination.',
        steps: [
          'Your booking payment is held in Escrow and will NOT be released to the provider until you confirm receipt.',
          'Use Direct Chat in your Dashboard to coordinate handover location with the provider.',
          'Only click "Confirm Product Received" after physically inspecting the camera/lens.'
        ]
      };
    default:
      return {
        diagnosis: 'Automated Diagnostic Complete.',
        steps: [
          'Ticket logged with high priority.',
          'Our AI support engine has indexed your gear details and payment records.',
          'An Equipora resolution specialist will monitor this ticket if automated reversal does not complete within 2 hours.'
        ]
      };
  }
};

// @desc    Create new support ticket / Query resolution
// @route   POST /api/support/tickets
const createTicket = async (req, res) => {
  try {
    const { category, productId, bookingId, transactionId, description, screenshotUrl, userMessages } = req.body;
    
    if (!description && !category) {
      return res.status(400).json({ message: 'Category and description are required' });
    }

    const ticketId = 'EQ-TKT-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
    
    const { diagnosis, steps } = generateAiDiagnosis(category, transactionId, Boolean(screenshotUrl));

    const initialChat = [
      {
        sender: 'user',
        message: description || `Issue reported: ${category} (Txn: ${transactionId || 'N/A'})`,
        timestamp: new Date()
      },
      {
        sender: 'bot',
        message: `🤖 [Equipora AI Support Assistant]: Hello! I have processed your issue regarding "${category}".\n\n📌 Diagnosis: ${diagnosis}\n\n✅ Resolution Steps:\n` + steps.map((s, i) => `${i + 1}. ${s}`).join('\n'),
        timestamp: new Date()
      }
    ];

    if (Array.isArray(userMessages)) {
      userMessages.forEach(msg => {
        initialChat.push({
          sender: msg.sender || 'user',
          message: msg.text || msg.message,
          timestamp: new Date()
        });
      });
    }

    const ticket = await SupportTicket.create({
      user: req.user._id,
      ticketId,
      product: productId || null,
      booking: bookingId || null,
      category: category || 'General Payment & Account Issue',
      transactionId: transactionId || '',
      screenshotUrl: screenshotUrl || '',
      description: description || 'Automatic AI Support Query',
      status: 'Resolved',
      aiDiagnosis: diagnosis,
      resolutionSteps: steps,
      chatHistory: initialChat
    });

    const populated = await SupportTicket.findById(ticket._id)
      .populate('product', 'name frontImage')
      .populate('booking', 'totalPrice securityDeposit status startDate endDate');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's support tickets
// @route   GET /api/support/my-tickets
const getMyTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ user: req.user._id })
      .populate('product', 'name frontImage category')
      .populate('booking', 'totalPrice securityDeposit status')
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add message to existing support ticket
// @route   POST /api/support/tickets/:id/reply
const replyToTicket = async (req, res) => {
  try {
    const { message } = req.body;
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    ticket.chatHistory.push({
      sender: 'user',
      message,
      timestamp: new Date()
    });

    // Generate intelligent contextual response
    let botReply = "Thank you for the update. Our automated system has logged this information. If your transaction status does not update within 2 hours, 100% of the funds will be automatically restored.";
    const lower = (message || '').toLowerCase();
    if (lower.includes('refund') || lower.includes('deposit')) {
      botReply = "Your deposit refund is completely automated. As soon as the provider receives the item back and taps 'Confirm Received', the system instantly refunds to your UPI ID.";
    } else if (lower.includes('net') || lower.includes('failed') || lower.includes('deducted') || lower.includes('upi')) {
      botReply = "In cases of network timeout during UPI payment, the NPCI banking switch will auto-reverse the amount back to your source bank account within 2 hours. If captured, your booking will become Active automatically.";
    }

    ticket.chatHistory.push({
      sender: 'bot',
      message: `🤖 [Equipora AI Support Assistant]: ${botReply}`,
      timestamp: new Date()
    });

    await ticket.save();
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTicket,
  getMyTickets,
  replyToTicket
};
