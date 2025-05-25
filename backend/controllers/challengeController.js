
const ContestChallenge = require('../models/ContestChallenge');
const DebuggingChallenge = require('../models/DebuggingChallenge');
const FlashCodeChallenge = require('../models/FlashCodeChallenge');
const fs = require('fs').promises;
const path = require('path');

// Get Next Level for Category
const getNextLevel = async (category) => {
    try {
        const lastChallenge = await Challenge.findOne({ category })
            .sort({ level: -1 }) // Sort by highest level
            .limit(1);

        return lastChallenge ? lastChallenge.level + 1 : 1; // If no previous challenge, start at 1
    } catch (error) {
        console.error("Error fetching next level:", error);
        return 1; // Default to level 1 if error
    }
};

// Helper function to get the appropriate model based on category
const getModelByCategory = (category) => {
    switch (category) {
        case 'Contest':
            return ContestChallenge;
        case 'Debugging':
            return DebuggingChallenge;
        case 'FlashCode':
            return FlashCodeChallenge;
        default:
            throw new Error('Invalid challenge category');
    }
};

// Create Challenge
const createChallenge = async (req, res) => {
    try {
        const { category } = req.params;
        console.log("Received category:", category); // Debug log
        const challengeData = req.body;
        console.log("Challenge data:", challengeData); // Debug log
        const Model = getModelByCategory(category);

        // Validate required fields
        if (!challengeData.title || !challengeData.description || !challengeData.difficulty || !challengeData.points) {
            return res.json({ error: "All fields are required" });
        }

        // Validate file upload for categories that require it
        if ((category === "Contest"  || category === "FlashCode") && !req.files?.codeFile) {
            return res.status(400).json({ error: "Program file is required for this category" });
        }

        const level = await getNextLevel(category);

        // Handle file upload
        if (req.files?.codeFile) {
            try {
                challengeData.codeFile = req.files.codeFile[0].path;
            } catch (error) {
                return res.status(400).json({ error: "Error processing file upload" });
            }
        }

        // Parse test cases if they exist
        if (challengeData.testCases) {
            try {
                challengeData.testCases = JSON.parse(challengeData.testCases);
                // Validate test cases for Contest and Debugging
                if ((category === "Contest" || category === "Debugging") && challengeData.testCases.length === 0) {
                    return res.status(400).json({ error: "At least one test case is required" });
                }
            } catch (error) {
                return res.status(400).json({ error: "Invalid test cases format" });
            }
        }

        const newChallenge = new Model({
            level,
            ...challengeData
        });

        await newChallenge.save();
        res.status(201).json({ message: "Challenge created successfully!", challenge: newChallenge });
    } catch (error) {
        console.error("Error creating challenge:", error);
        // Clean up uploaded file if there was an error
        if (req.files?.codeFile) {
            try {
                await fs.unlink(req.files.codeFile[0].path);
            } catch (unlinkError) {
                console.error("Error cleaning up file:", unlinkError);
            }
        }
        res.status(500).json({ error: "Server error", details: error.message });
    }
};

// Get All Challenges
const getChallenges = async (req, res) => {
    try {
        const { category } = req.params;
        const Model = getModelByCategory(category);
        const challenges = await Model.find().sort({ level: 1 }); // Sort by level
        res.json(challenges);
    } catch (error) {
        console.error("Error fetching challenges:", error);
        res.status(500).json({ error: "Server error", details: error.message });
    }
};

// Get a specific challenge
const getChallenge = async (req, res) => {
    try {
        const { category, id } = req.params;
        const Model = getModelByCategory(category);
        const challenge = await Model.findById(id);
        if (!challenge) {
            return res.status(404).json({ message: 'Challenge not found' });
        }
        res.json(challenge);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update Challenge
const updateChallenge = async (req, res) => {
    try {
        const { category, id } = req.params;
        const Model = getModelByCategory(category);
        const challenge = await Model.findById(id);
        
        if (!challenge) {
            return res.status(404).json({ message: 'Challenge not found' });
        }

        // Handle file updates
        if (req.files?.codeFile) {
            try {
                // Delete old file if it exists
                if (challenge.codeFile) {
                    await fs.unlink(challenge.codeFile);
                }
                req.body.codeFile = req.files.codeFile[0].path;
            } catch (error) {
                return res.status(400).json({ error: "Error processing file upload" });
            }
        }

        // Parse test cases if they exist
        if (req.body.testCases) {
            try {
                req.body.testCases = JSON.parse(req.body.testCases);
                // Validate test cases for Contest and Debugging
                if ((category === "Contest" || category === "Debugging") && req.body.testCases.length === 0) {
                    return res.status(400).json({ error: "At least one test case is required" });
                }
            } catch (error) {
                return res.status(400).json({ error: "Invalid test cases format" });
            }
        }

        const updatedChallenge = await Model.findByIdAndUpdate(
            id,
            { ...req.body, updatedAt: Date.now() },
            { new: true }
        );
        res.json(updatedChallenge);
    } catch (error) {
        // Clean up uploaded file if there was an error
        if (req.files?.codeFile) {
            try {
                await fs.unlink(req.files.codeFile[0].path);
            } catch (unlinkError) {
                console.error("Error cleaning up file:", unlinkError);
            }
        }
        res.status(400).json({ message: error.message });
    }
};

// Delete Challenge
const deleteChallenge = async (req, res) => {
    try {
        const { category, id } = req.params;
        const Model = getModelByCategory(category);
        const challenge = await Model.findById(id);
        
        if (!challenge) {
            return res.status(404).json({ message: 'Challenge not found' });
        }

        // Delete associated files
        if (challenge.solutionFile) {
            await fs.unlink(challenge.solutionFile);
        }
        if (challenge.testCaseFile) {
            await fs.unlink(challenge.testCaseFile);
        }

        await Model.findByIdAndDelete(id);
        res.json({ message: 'Challenge deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = { createChallenge, getChallenges, getChallenge, updateChallenge, deleteChallenge };
