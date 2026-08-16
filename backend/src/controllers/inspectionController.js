const Inspection = require('../models/Inspection');
const Booking = require('../models/Booking');
const Product = require('../models/Product');
const crypto = require('crypto');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'mock_key');

// Helper to generate hash
const generateHash = (data) => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

// @desc    Generate AI Checklist for a product
// @route   POST /api/inspections/generate-checklist
const generateChecklist = async (req, res) => {
  try {
    const { productId } = req.body;
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let checklist = [];

    if (process.env.GEMINI_API_KEY) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `Generate a JSON array of inspection checklist items for renting a ${product.category}, specifically a ${product.brand} ${product.model}. The output must be valid JSON array of strings. Do not include markdown formatting.`;
        const result = await model.generateContent(prompt);
        let text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        checklist = JSON.parse(text).map(item => ({ item, status: 'Pass' }));
      } catch (e) {
        console.error("Gemini Checklist failed, using fallback", e);
      }
    }

    // Fallback template
    if (checklist.length === 0) {
      checklist = [
        { item: 'General Body Condition', status: 'Pass' },
        { item: 'Screen/Lens (if applicable)', status: 'Pass' },
        { item: 'Power/Battery', status: 'Pass' },
        { item: 'Ports and Connections', status: 'Pass' },
        { item: 'Included Accessories Verified', status: 'Pass' }
      ];
    }

    res.json(checklist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit Handover/Return Inspection
// @route   POST /api/inspections
const submitInspection = async (req, res) => {
  try {
    const { bookingId, type, checklist, signature } = req.body;
    
    const booking = await Booking.findById(bookingId).populate('product');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    let evidence = [];
    if (req.files && req.files['evidence']) {
      evidence = req.files['evidence'].map((file, index) => ({
        angle: req.body.angles ? req.body.angles[index] : `Angle ${index}`,
        imageUrl: file.path,
        hash: generateHash(file.path) // Simplistic hash of URL for demo, real system would hash file buffer
      }));
    }

    const parsedChecklist = checklist ? JSON.parse(checklist) : [];

    const inspection = await Inspection.create({
      booking: bookingId,
      product: booking.product._id,
      inspector: req.user._id,
      type,
      checklist: parsedChecklist,
      evidence,
      signature: signature === 'true',
      completedAt: new Date()
    });

    if (type === 'Handover') {
      booking.handoverInspectionId = inspection._id;
      booking.status = 'Active';
    } else if (type === 'Return') {
      booking.returnInspectionId = inspection._id;
      
      // Simulate Before/After CV comparison
      inspection.aiComparisonResult = 'Possible Difference Detected'; // Mock for demo
      inspection.aiComparisonNotes = 'AI detected a possible scratch on the left side.';
      await inspection.save();
      
      booking.status = 'Return Scheduled'; // Or 'Disputed' based on AI
    }
    
    await booking.save();

    res.status(201).json(inspection);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { generateChecklist, submitInspection };
