const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');
const { protect } = require('../middleware/auth');

// Upload a single image
router.post('/', protect, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }
    // multer-storage-cloudinary automatically uploads the file to Cloudinary
    // and populates req.file.path with the securely hosted Cloudinary URL.
    res.status(200).json({ 
        message: 'Image uploaded successfully',
        url: req.file.path 
    });
  } catch (error) {
    console.error('File upload err:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
