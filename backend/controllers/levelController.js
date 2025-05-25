const ContestChallenge = require('../models/ContestChallenge');
const DebuggingChallenge = require('../models/DebuggingChallenge');
const FlashCodeChallenge = require('../models/FlashCodeChallenge');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const fs = require('fs').promises;
const path = require('path');

// Get all levels for a specific game type
const getLevels = async (req, res) => {
    try {
        const { gameType } = req.query;
        
        if (!gameType) {
            return res.status(400).json({ error: "Game type is required" });
        }

        // Normalize gameType to lowercase for consistency
        const normalizedGameType = gameType.toLowerCase();

        let Model;
        switch (normalizedGameType) {
            case 'contest':
                Model = ContestChallenge;
                break;
            case 'debugging':
                Model = DebuggingChallenge;
                break;
            case 'flashcode':
                Model = FlashCodeChallenge;
                break;
            default:
                return res.status(400).json({ error: "Invalid game type. Must be one of: contest, debugging, flashcode" });
        }

        // Fetch levels with proper sorting and field selection
        const levels = await Model.find()
            .select(normalizedGameType === 'debugging' 
                ? 'title difficulty description points level timeLimit limitTime testCases buggyCode'
                : normalizedGameType === 'flashcode'
                    ? 'title difficulty description points level timeLimit limitTime testCases codeFile'
                    : 'title difficulty description points level timeLimit limitTime testCases')
            .sort({ level: 1 })
            .lean();
        
        console.log(`Found ${levels?.length || 0} levels for game type: ${normalizedGameType}`);
        
        if (!levels || levels.length === 0) {
            return res.json({ message: "No levels found" });
        }

        // Transform the response to ensure consistent field names
        const transformedLevels = await Promise.all(levels.map(async level => {
            const baseLevel = {
                ...level,
                timeLimit: level.timeLimit || 30,
                limitTime: level.limitTime || 30,
                points: level.points || 0,
                level: level.level || 1,
            };

            if (normalizedGameType === 'debugging') {
                return {
                    ...baseLevel,
                    buggycode: level.buggyCode || ''
                };
            }

            if (normalizedGameType === 'flashcode' && level.codeFile) {
                try {
                    console.log('Reading codeFile:', level.codeFile);
                    const filePath = path.resolve(level.codeFile);
                    const fileContent = await fs.readFile(filePath, 'utf-8');
                    return {
                        ...baseLevel,
                        codeFile: fileContent
                    };
                } catch (error) {
                    console.error('Error reading codeFile:', error);
                    return {
                        ...baseLevel,
                        codeFile: '// Error reading code file'
                    };
                }
            }

            return baseLevel;
        }));

        console.log('Sending transformed levels:', transformedLevels.length);
        res.json(transformedLevels);
    } catch (error) {
        console.error("Error fetching levels:", error);
        
        // Handle specific error cases
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid ID format' });
        }
        
        res.status(500).json({ 
            error: "Server error", 
            message: "An unexpected error occurred while fetching levels",
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get a specific level by ID
const getLevelById = async (req, res) => {
    try {
        const { id } = req.params;
        const { gameType } = req.query;

        if (!gameType) {
            return res.status(400).json({ error: "Game type is required" });
        }

        // Get token from header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        const token = authHeader.split(' ')[1];

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find user
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        let Model;
        switch (gameType) {
            case 'contest':
                Model = ContestChallenge;
                break;
            case 'debugging':
                Model = DebuggingChallenge;
                break;
            case 'flashcode':
                Model = FlashCodeChallenge;
                break;
            default:
                return res.status(400).json({ error: "Invalid game type" });
        }

        const level = await Model.findById(id);
        
        if (!level) {
            return res.json({ message: "Level not found" });
        }

        res.json(level);
    } catch (error) {
        console.error("Error fetching level:", error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        res.status(500).json({ error: "Server error", details: error.message });
    }
};

module.exports = {
    getLevels,
    getLevelById
}; 