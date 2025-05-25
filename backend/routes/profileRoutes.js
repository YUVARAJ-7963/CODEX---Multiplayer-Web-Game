const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const profileController = require('../controllers/profileController');

// Configure storage for profile images using memory storage for better performance
const profileStorage = multer.memoryStorage();

// File filter for images with better validation
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  // Validate file type
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'), false);
  }
  
  // Validate file extension
  if (!['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
    return cb(new Error('Invalid file extension. Only .jpg, .jpeg, .png, .gif, and .webp files are allowed.'), false);
  }
  
  cb(null, true);
};

// Configure multer upload with memory storage
const upload = multer({
  storage: profileStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
    files: 1 // Only allow one file
  },
  fileFilter: fileFilter
});

// Error handling middleware for file uploads
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File size too large. Maximum size is 5MB.' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ message: 'Only one file can be uploaded at a time.' });
    }
    return res.status(400).json({ message: err.message });
  }
  if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
};

// Get user profile
router.get('/', profileController.getProfile);

// Get user profile by UID
router.get('/user/:uid', profileController.getProfileByUID);

// Get profile avatar by UID
router.get('/:uid/avatar', async (req, res, next) => {
  console.log('Avatar request received for UID:', req.params.uid);
  try {
    await profileController.getProfileAvatar(req, res);
  } catch (error) {
    console.error('Error in avatar route:', error);
    next(error);
  }
});

// Get profile by UID
router.get('/:uid', profileController.getProfileByUID);

// Update user profile
router.post('/update', profileController.updateProfile);

// Upload profile image
router.post('/upload', 
  upload.single('file'),
  handleUploadError,
  profileController.uploadProfileImage
);

module.exports = router; 