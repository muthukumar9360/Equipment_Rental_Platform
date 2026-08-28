const Product = require('../models/Product');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Init Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'mock_key');

// @desc    Create new product listing
const createProduct = async (req, res) => {
  try {
    const { name, category, subCategory, brand, model, specifications, pricePerDay, securityDeposit, description, serialNumber, accessories, condition, location, includedAccessories } = req.body;
    
    let frontImage = '', backImage = '', leftImage = '', rightImage = '', topImage = '', bottomImage = '';
    let additionalImages = [];

    const getFilePath = (file) => {
      if (!file) return null;
      return `${process.env.API_URL || 'http://localhost:5000'}/uploads/${file.filename}`;
    };

    if (req.files) {
      if (req.files['frontImage']) frontImage = getFilePath(req.files['frontImage'][0]);
      if (req.files['backImage']) backImage = getFilePath(req.files['backImage'][0]);
      if (req.files['leftImage']) leftImage = getFilePath(req.files['leftImage'][0]);
      if (req.files['rightImage']) rightImage = getFilePath(req.files['rightImage'][0]);
      if (req.files['topImage']) topImage = getFilePath(req.files['topImage'][0]);
      if (req.files['bottomImage']) bottomImage = getFilePath(req.files['bottomImage'][0]);
      if (req.files['additionalImages']) {
        additionalImages = req.files['additionalImages'].map(file => getFilePath(file));
      }
    }
    
    let invoiceUrl = null;
    if (req.files && req.files['invoice']) {
      invoiceUrl = getFilePath(req.files['invoice'][0]);
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
    console.error('Error in createProduct:', error);
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
    if (req.query.location) query.location = req.query.location;
    if (req.query.maxPrice) query.pricePerDay = { $lte: Number(req.query.maxPrice) };
    if (req.query.minTrustScore) query.trustScore = { $gte: Number(req.query.minTrustScore) };
    if (req.query.minConditionScore) query.conditionScore = { $gte: Number(req.query.minConditionScore) };
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { brand: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    if (excludeId) query._id = { $ne: excludeId };
    if (req.query.providerId) query.providerId = req.query.providerId;

    const limit = req.query.limit ? parseInt(req.query.limit) : 200;

    const products = await Product.find(query)
      .limit(limit)
      .populate('providerId', 'name trustScore');
      
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get product metadata (unique categories, brands, locations, etc.)
// @route   GET /api/products/metadata
const getProductMetadata = async (req, res) => {
  try {
    const categories = await Product.distinct('category', { verificationStatus: 'Verified' });
    const locations = await Product.distinct('location', { verificationStatus: 'Verified' });
    const brands = await Product.distinct('brand', { verificationStatus: 'Verified' });
    const subCategories = await Product.distinct('subCategory', { verificationStatus: 'Verified' });
    
    res.json({ categories, locations, brands, subCategories });
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

// @desc    Update existing product
// @route   PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    if (product.providerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }

    const { name, category, subCategory, brand, model, specifications, pricePerDay, securityDeposit, description, serialNumber, accessories, condition, location, includedAccessories, keptAdditionalImages } = req.body;

    const getFilePath = (file) => {
      if (!file) return null;
      return `${process.env.API_URL || 'http://localhost:5000'}/uploads/${file.filename}`;
    };

    if (req.files) {
      if (req.files['frontImage']) product.frontImage = getFilePath(req.files['frontImage'][0]);
      if (req.files['backImage']) product.backImage = getFilePath(req.files['backImage'][0]);
      if (req.files['leftImage']) product.leftImage = getFilePath(req.files['leftImage'][0]);
      if (req.files['rightImage']) product.rightImage = getFilePath(req.files['rightImage'][0]);
      if (req.files['topImage']) product.topImage = getFilePath(req.files['topImage'][0]);
      if (req.files['bottomImage']) product.bottomImage = getFilePath(req.files['bottomImage'][0]);
      
      let finalAdditionalImages = keptAdditionalImages ? JSON.parse(keptAdditionalImages) : [];
      if (req.files['additionalImages']) {
        const newAdditionalImages = req.files['additionalImages'].map(file => getFilePath(file));
        finalAdditionalImages = [...finalAdditionalImages, ...newAdditionalImages];
      }
      product.additionalImages = finalAdditionalImages;
      
      if (req.files['invoice']) {
        product.invoiceUrl = getFilePath(req.files['invoice'][0]);
      }
    } else if (keptAdditionalImages) {
      product.additionalImages = JSON.parse(keptAdditionalImages);
    }

    if (name) product.name = name;
    if (category) product.category = category;
    if (subCategory) product.subCategory = subCategory;
    if (brand) product.brand = brand;
    if (model) product.model = model;
    if (specifications) product.specifications = JSON.parse(specifications);
    if (pricePerDay) product.pricePerDay = pricePerDay;
    if (securityDeposit) product.securityDeposit = securityDeposit;
    if (description) product.description = description;
    if (serialNumber) product.serialNumber = serialNumber;
    if (accessories) product.accessories = JSON.parse(accessories);
    if (condition) product.condition = condition;
    if (location) product.location = location;
    if (includedAccessories !== undefined) product.includedAccessories = includedAccessories;
    
    // When a product is updated, it might require re-verification
    product.verificationStatus = 'Pending';

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error in updateProduct:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createProduct, getProducts, getProductById, getMyProducts, updateProduct, getProductMetadata };
