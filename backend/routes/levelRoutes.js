const express = require('express');
const router = express.Router();
const { getLevels, getLevelById } = require('../controllers/levelController');


// Get all levels for a specific game type
router.get('/', getLevels);

// Get a specific level by ID
router.get('/:id', getLevelById);
 
module.exports = router;  