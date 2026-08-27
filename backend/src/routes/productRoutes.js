const express = require('express');
const router = express.Router();
const { createProduct, getProducts, getProductById, getMyProducts } = require('../controllers/productController');
const { protect } = require('../middlewares/authMiddleware');
const { upload } = require('../utils/cloudinary');

// Protected routes (Provider)
router.get('/my-products', protect, getMyProducts);

// Public routes
router.get('/', getProducts);
router.get('/:id', getProductById);

router.post('/', protect, upload.fields([
  { name: 'frontImage', maxCount: 1 },
  { name: 'backImage', maxCount: 1 },
  { name: 'leftImage', maxCount: 1 },
  { name: 'rightImage', maxCount: 1 },
  { name: 'topImage', maxCount: 1 },
  { name: 'bottomImage', maxCount: 1 },
  { name: 'additionalImages', maxCount: 4 },
  { name: 'invoice', maxCount: 1 }
]), createProduct);

module.exports = router;
