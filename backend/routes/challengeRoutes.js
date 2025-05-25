const express = require("express");
const upload = require("../middleware/fileUpload");
const {
  createChallenge,
  getChallenges,
  updateChallenge,
  deleteChallenge,
  getChallenge,
} = require("../controllers/challengeController");

const router = express.Router();

// Get all challenges of a specific category
router.get('/:category', getChallenges);

// Get a specific challenge
router.get('/:category/:id', getChallenge);

// Create a new challenge with file uploads
router.post('/:category', upload.fields([{ name: 'codeFile', maxCount: 1 }]), createChallenge);

// Update a challenge with file uploads
router.put('/:category/:id', upload.fields([{ name: 'codeFile', maxCount: 1 }]), updateChallenge);

// Delete a challenge
router.delete('/:category/:id', deleteChallenge);

module.exports = router;
