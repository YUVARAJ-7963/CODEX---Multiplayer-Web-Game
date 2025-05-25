const express = require('express');
const userController = require('../controllers/userController');
const router = express.Router();
const { getProfile, updateProfile } = require('../controllers/userController');
const { authenticateUser } = require('../middleware/auth');
const User = require('../models/User');
const auth = require('../middleware/auth');


// Auth routes
router.post('/send-otp', userController.sendOtp);
router.post('/verify-otp', userController.verifyOtp);
router.post('/login', userController.login);

// Protected routes
router.get('/profile', authenticateUser, getProfile);
router.post('/users/update-profile', authenticateUser, updateProfile);

// Get player states by UID - This should be before the /users/:category route
router.get('/player/:uid/states', authenticateUser, userController.getPlayerStates);

// Get users by game category
router.get('/users/:category', authenticateUser, userController.getUsersByGameCategory);

// Get player states by UID
router.get('/player-states/:uid', userController.getPlayerStates);

// Update user scores and completed levels
router.post('/user/update-scores', userController.updateScores);

// Update challenge scores
router.post('/user/update-challenge-score', userController.updateChallengeScore);

// Check if a level is completed
router.get('/user/check-level', userController.checkLevelCompleted);

// Create new user (admin only)
router.post('/', auth.authenticateAdmin, async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ username, email, password });
    await user.save();

    // Create audit log for user creation
    await createAuditLog(
      "create",
      `Created new user account: ${username}`,
      req.admin.id
    );

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user (admin only)
router.put('/:id', auth.authenticateAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { username, email, role } = req.body;
    if (username) user.username = username;
    if (email) user.email = email;
    if (role) user.role = role;

    await user.save();

    // Create audit log for user update
    await createAuditLog(
      "update",
      `Updated user account: ${user.username}`,
      req.admin.id
    );

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete user (admin only)
router.delete('/:id', auth.authenticateAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create audit log for user deletion
    await createAuditLog(
      "delete",
      `Deleted user account: ${user.username}`,
      req.admin.id
    );

    await user.remove();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all users (admin only)
router.get('/', auth.authenticateAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user by ID (admin only)
router.get('/:id', auth.authenticateAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;