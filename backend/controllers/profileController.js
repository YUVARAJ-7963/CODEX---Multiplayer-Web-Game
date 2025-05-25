const User = require('../models/User');
const path = require('path');
const fs = require('fs');

// Add a logging function for profile operations
const logProfileActivity = (activity, userId, details) => {
  const logDir = path.join(__dirname, '../logs');
  const logFile = path.join(logDir, 'profile-activity.log');
  
  // Create logs directory if it doesn't exist
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] [${activity}] [User: ${userId}] ${details}\n`;
  
  fs.appendFileSync(logFile, logEntry);
  
  // Also log to console in development environment
  if (process.env.NODE_ENV === 'development') {
    console.log(`Profile Activity: ${logEntry.trim()}`);
  }
};

// Controller for profile-related functionality
const profileController = {
  // Get user profile with extended information
  getProfile: async (req, res) => {
    try {
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }

      const user = await User.findOne({ UID: userId }).select('-password');
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      logProfileActivity('GET_PROFILE', userId, `User retrieved profile`);

      // Return comprehensive profile data
      res.json({
        UID: user.UID,
        username: user.username,
        email: user.email,
        bio: user.bio || '',
        language: user.language || 'English',
        avatarUrl: user.avatarUrl || '',
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        HonorScore: user.HonorScore || 0,
        GlobalRank: user.GlobalRank || 0,
        TotalScore: user.TotalScore || 0
      });
      console.log(user.avatarUrl);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
  
  // Get user profile by UID
  getProfileByUID: async (req, res) => {
    try {
      const { uid } = req.params;
      
      if (!uid) {
        return res.status(400).json({ message: 'UID is required' });
      }
      
      const user = await User.findById(uid).select('-password');
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      logProfileActivity('GET_PROFILE_BY_UID', uid, `Retrieved profile for UID: ${uid}`);

      // Return profile data
      res.json({
        UID: user._id,
        username: user.username,
        bio: user.bio || '',
        language: user.language || 'English',
        avatarUrl: user.avatarUrl || '',
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        HonorScore: user.HonorScore || 0,
        GlobalRank: user.GlobalRank || 0,
        TotalScore: user.TotalScore || 0
      });
    } catch (error) {
      console.error('Error fetching user profile by UID:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
  
  // Get profile avatar by UID
  getProfileAvatar: async (req, res) => {
    try {
      const { uid } = req.params;
      console.log('Getting avatar for UID:', uid);
      
      if (!uid) {
        console.log('No UID provided');
        return res.status(400).json({ message: 'UID is required' });
      }
      
      const user = await User.findOne({ UID: uid }).select('avatarUrl');
      console.log('Found user:', user);
      
      if (!user) {
        console.log('User not found');
        return res.status(404).json({ message: 'User not found' });
      }

      // If no avatar URL, send empty response
      if (!user.avatarUrl) {
        console.log('No avatar URL found');
        return res.status(404).json({ message: 'No avatar found' });
      }

      // Extract filename from URL
      const filename = user.avatarUrl.split('/').pop();
      const filePath = path.join(__dirname, '../uploads/profiles', filename);
      console.log('Looking for file at:', filePath);

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        console.log('File not found at path:', filePath);
        return res.status(404).json({ message: 'Avatar file not found' });
      }

      // Get file extension to determine content type
      const ext = path.extname(filename).toLowerCase();
      let contentType = 'image/jpeg'; // default
      
      // Set proper content type based on extension
      switch (ext) {
        case '.png':
          contentType = 'image/png';
          break;
        case '.gif':
          contentType = 'image/gif';
          break;
        case '.webp':
          contentType = 'image/webp';
          break;
      }

      console.log('Sending file with content type:', contentType);

      // Send the actual image file
      res.set({
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${filename}"`,
        'Cache-Control': 'public, max-age=31536000' // Cache for 1 year
      });
      
      // Stream the file instead of loading it all into memory
      const fileStream = fs.createReadStream(filePath);
      fileStream.on('error', (error) => {
        console.error('Error streaming file:', error);
        res.status(500).json({ message: 'Error streaming file' });
      });
      
      fileStream.pipe(res);

      logProfileActivity('GET_PROFILE_AVATAR', uid, `Retrieved avatar for UID: ${uid}`);
    } catch (error) {
      console.error('Error fetching user avatar:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
  
  // Update user profile information
  updateProfile: async (req, res) => {
    try {
      const { userId, displayName, bio, language } = req.body;

      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }

      // Find user by UID
      const user = await User.findOne({ UID: userId });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Track what fields were updated
      const updatedFields = [];
      if (displayName && displayName !== user.username) {
        user.username = displayName;
        updatedFields.push('displayName');
      }
      if (bio !== undefined && bio !== user.bio) {
        user.bio = bio;
        updatedFields.push('bio');
      }
      if (language && language !== user.language) {
        user.language = language;
        updatedFields.push('language');
      }

      // Save updated user
      await user.save();
      
      logProfileActivity('UPDATE_PROFILE', userId, `Updated fields: ${updatedFields.join(', ')}`);

      // Return updated profile data
      res.json({
        message: 'Profile updated successfully',
        user: {
          UID: user.UID,
          username: user.username,
          bio: user.bio || '',
          language: user.language || 'English',
          avatarUrl: user.avatarUrl || '',
          updatedAt: new Date()
        }
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
  
  // Upload profile image
  uploadProfileImage: async (req, res) => {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      console.log('Received file upload request:', {
        userId,
        fileSize: req.file.size,
        fileType: req.file.mimetype,
        originalName: req.file.originalname
      });

      // Get file buffer and metadata
      const fileBuffer = req.file.buffer;
      const fileType = req.file.mimetype;
      const fileSize = req.file.size;
      
      // Generate unique filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(req.file.originalname).toLowerCase();
      const filename = `profile-${uniqueSuffix}${ext}`;
      
      // Save file to disk
      const uploadDir = path.join(__dirname, '../uploads/profiles');
      console.log('Upload directory:', uploadDir);
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(uploadDir)) {
        console.log('Creating upload directory...');
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      const filePath = path.join(uploadDir, filename);
      console.log('Saving file to:', filePath);
      
      await fs.promises.writeFile(filePath, fileBuffer);
      console.log('File saved successfully');
      
      // Get host URL from request to form complete URL
      const host = req.protocol + '://' + req.get('host');
      const fileUrl = `${host}/uploads/profiles/${filename}`;
      console.log('Generated file URL:', fileUrl);

      // Update user's avatarUrl
      const user = await User.findOne({ UID: userId });
      if (!user) {
        console.log('User not found, deleting uploaded file');
        await fs.promises.unlink(filePath);
        return res.status(404).json({ message: 'User not found' });
      }
      
      // If user already has avatar, delete the old image
      if (user.avatarUrl) {
        try {
          const oldImagePath = user.avatarUrl.split('/').pop();
          const oldFilePath = path.join(__dirname, '../uploads/profiles', oldImagePath);
          console.log('Attempting to delete old file:', oldFilePath);
          
          if (fs.existsSync(oldFilePath)) {
            await fs.promises.unlink(oldFilePath);
            console.log('Old file deleted successfully');
            logProfileActivity('DELETE_AVATAR', userId, `Old avatar removed: ${oldImagePath}`);
          }
        } catch (error) {
          console.error('Error deleting old profile image:', error);
          // Continue even if deletion fails
        }
      }
      
      // Save new avatar URL to user
      user.avatarUrl = fileUrl;
      await user.save();
      console.log('User profile updated with new avatar URL');
      
      logProfileActivity('UPLOAD_AVATAR', userId, `New avatar uploaded: ${filename}, size: ${fileSize}B, type: ${fileType}`);

      res.json({ 
        message: 'Profile image uploaded successfully',
        url: fileUrl
      });
    } catch (error) {
      console.error('Error uploading profile image:', error);
      
      // If file was uploaded but error occurred, delete it
      if (req.file && req.file.path) {
        try {
          await fs.promises.unlink(req.file.path);
        } catch (unlinkError) {
          console.error('Error deleting uploaded file:', unlinkError);
        }
      }
      
      res.status(500).json({ 
        message: 'Server error',
        error: error.message 
      });
    }
  }
};

module.exports = profileController; 