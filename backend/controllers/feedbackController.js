const Feedback = require('../models/Feedback');
const User = require('../models/User');

const submitFeedback = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const feedback = new Feedback({
      username: user.username,
      uid: user.UID,
      message
    });

    await feedback.save();
    res.status(201).json({ message: 'Feedback submitted successfully', feedback });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ message: 'Error submitting feedback' });
  }
};

const getFeedbacks = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find feedbacks where uid matches the current user's UID
    const feedbacks = await Feedback.find({ uid: user.UID })
      .sort({ createdAt: -1 }) // Sort by newest first
      .select('message createdAt');
    
    res.json(feedbacks);
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    res.status(500).json({ message: 'Error fetching feedbacks' });
  }
};

// Get all feedbacks
const getAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .sort({ createdAt: -1 }) // Sort by newest first
      .select('uid username message createdAt'); // Select only required fields
    
    res.status(200).json({
      success: true,
      data: feedbacks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error fetching feedbacks',
      message: error.message
    });
  }
};

module.exports = {
  submitFeedback,
  getFeedbacks,
  getAllFeedbacks
}; 