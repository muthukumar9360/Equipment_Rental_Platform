const express = require('express');
const router = express.Router();
const { getPendingVerifications, reviewUserVerification } = require('../controllers/adminController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.get('/verifications/pending', protect, admin, getPendingVerifications);
router.post('/verifications/review', protect, admin, reviewUserVerification);

module.exports = router;
