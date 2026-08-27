const Product = require('../models/Product');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Init Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'mock_key');

// @desc    Create new product listing
// @route   POST /api/products
const createProduct = async (req, res) => {
  try {
    const { name, category, subCategory, brand, model, specifications, pricePerDay, securityDeposit, description, serialNumber, accessories, condition, location, includedAccessories } = req.body;
    
    let frontImage = '', backImage = '', leftImage = '', rightImage = '', topImage = '', bottomImage = '';
    let additionalImages = [];

    if (req.files) {
      if (req.files['frontImage']) frontImage = req.files['frontImage'][0].path;
      if (req.files['backImage']) backImage = req.files['backImage'][0].path;
      if (req.files['leftImage']) leftImage = req.files['leftImage'][0].path;
      if (req.files['rightImage']) rightImage = req.files['rightImage'][0].path;
      if (req.files['topImage']) topImage = req.files['topImage'][0].path;
      if (req.files['bottomImage']) bottomImage = req.files['bottomImage'][0].path;
      if (req.files['additionalImages']) {
        additionalImages = req.files['additionalImages'].map(file => file.path);
      }
    }
    
    let invoiceUrl = null;
    if (req.files && req.files['invoice']) {
      invoiceUrl = req.files['invoice'][0].path;
    }

    // Mock OCR using Gemini if key exists, else mock data
    let invoiceData = {};
    if (invoiceUrl && process.env.GEMINI_API_KEY) {
      try {
        // Normally we'd download the image and send to Gemini Vision, but for this demo
        // we'll assume a basic text prompt for now or just mock it since it's a URL.
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `Extract details from invoice for product ${name}. Expected fields: Date, Vendor, SerialNumber. (Simulated response)`;
        const result = await model.generateContent(prompt);
        invoiceData = { rawText: result.response.text() };
      } catch (e) {
        console.error("Gemini OCR failed", e);
      }
    }

    const parsedAccessories = accessories ? JSON.parse(accessories) : [];
    const parsedSpecs = specifications ? JSON.parse(specifications) : {};

    const product = await Product.create({
      providerId: req.user._id,
      name,
      category,
      subCategory,
      brand,
      model,
      specifications: parsedSpecs,
      pricePerDay,
      securityDeposit,
      description,
      serialNumber,
      frontImage,
      backImage,
      leftImage,
      rightImage,
      topImage,
      bottomImage,
      additionalImages,
      invoiceUrl,
      invoiceData,
      accessories: parsedAccessories,
      condition,
      location: location || 'Chennai',
      includedAccessories,
      verificationStatus: 'Pending'
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all products
// @route   GET /api/products
const getProducts = async (req, res) => {
  try {
    const { brand, model, excludeId, category, subCategory } = req.query;
    let query = { verificationStatus: 'Verified' };
    
    if (brand) query.brand = brand;
    if (model) query.model = model;
    if (category) query.category = category;
    if (subCategory) query.subCategory = subCategory;
    if (excludeId) query._id = { $ne: excludeId };

    const products = await Product.find(query).populate('providerId', 'name trustScore');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single product passport
// @route   GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('providerId', 'name trustScore kycStatus');
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get products created by logged in user
// @route   GET /api/products/my-products
const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ providerId: req.user._id }).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createProduct, getProducts, getProductById, getMyProducts };
