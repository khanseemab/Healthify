const express = require('express');
const multer = require('multer');
const { uploadPDF, askPDF, getStatus, clearDocument } = require('../controllers/aiController');

const router = express.Router();

// Store file in memory (not disk) so pdf-parse can read the buffer directly
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed.'), false);
    }
  },
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
});

router.post('/upload', upload.single('pdf'), uploadPDF);
router.post('/ask', askPDF);
router.get('/status', getStatus);
router.delete('/document', clearDocument);

module.exports = router;
