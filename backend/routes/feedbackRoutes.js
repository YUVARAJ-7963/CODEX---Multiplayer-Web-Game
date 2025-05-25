const express = require('express');
const router = express.Router();
const { submitFeedback, getFeedbacks, getAllFeedbacks } = require('../controllers/feedbackController');
const { authenticateUser } = require('../middleware/auth');

router.post('/submit', authenticateUser, submitFeedback);
router.get('/list', authenticateUser, getFeedbacks);

// Get all feedbacks (admin only)
router.get('/all', getAllFeedbacks);

module.exports = router; 