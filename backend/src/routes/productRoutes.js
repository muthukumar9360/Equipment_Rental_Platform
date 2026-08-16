const express = require('express');
const router = express.Router();
const { createProduct, getProducts, getProductById } = require('../controllers/productController');
const { protect } = require('../middlewares/authMiddleware');
const { upload } = require('../utils/cloudinary');

// Public routes
router.get('/', getProducts);
router.get('/:id', getProductById);

// Protected routes (Provider)
router.post('/', protect, upload.fields([
  { name: 'images', maxCount: 5 },
  { name: 'invoice', maxCount: 1 }
]), createProduct);

module.exports = router;
