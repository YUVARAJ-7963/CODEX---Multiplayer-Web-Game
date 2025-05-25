const express = require('express');
const router = express.Router();
const { getLeaderboard } = require('../controllers/leaderboardController');

// Get leaderboard with pagination, sorting, and search
router.get('/', getLeaderboard);

module.exports = router;  