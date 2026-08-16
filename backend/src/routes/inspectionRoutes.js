const express = require('express');
const router = express.Router();
const { generateChecklist, submitInspection } = require('../controllers/inspectionController');
const { protect } = require('../middlewares/authMiddleware');
const { upload } = require('../utils/cloudinary');

router.post('/generate-checklist', protect, generateChecklist);

router.post('/', protect, upload.fields([
  { name: 'evidence', maxCount: 10 }
]), submitInspection);

module.exports = router;
