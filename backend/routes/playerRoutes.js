const express = require('express');
const router = express.Router();
const { getPlayerStats } = require('../controllers/playerController');
const auth = require('../middleware/auth');

// Get player statistics
router.get('/:uid/states', getPlayerStats);

module.exports = router; 