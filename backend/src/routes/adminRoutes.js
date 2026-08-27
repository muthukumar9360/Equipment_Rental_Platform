const express = require('express');
const router = express.Router();
const { 
  getPendingVerifications, 
  reviewUserVerification,
  getAdminUsers,
  getAdminProducts,
  reviewProduct,
  deleteUser,
  deleteProduct
} = require('../controllers/adminController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.get('/verifications/pending', protect, admin, getPendingVerifications);
router.post('/verifications/review', protect, admin, reviewUserVerification);

router.get('/users', protect, admin, getAdminUsers);
router.delete('/users/:id', protect, admin, deleteUser);

router.get('/products', protect, admin, getAdminProducts);
router.post('/products/review', protect, admin, reviewProduct);
router.delete('/products/:id', protect, admin, deleteProduct);

module.exports = router;
