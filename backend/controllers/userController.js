const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../config/email');

const userController = {
  // Get user profile
  getProfile: async (req, res) => {
    try {
      console.log('User from token:', req.user); // Debug log
      const user = await User.findById(req.user.id).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({
        username: user.username,
        UID: user.UID,
        email: user.email,
        HonorScore: user.HonorScore,
        GlobalRank: user.GlobalRank,
        TotalScore: user.TotalScore
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
  
  // Update user profile (UID and username)
  updateProfile: async (req, res) => {
    try {
      const { uid, username } = req.body;
      

      // Check if UID is already taken by another user
      if (uid) {
        const existingUser = await User.findOne({ uid, _id: { $ne: req.user.id } });
        if (existingUser) {
          return res.status(400).json({ message: 'UID already taken' });
        }
      }

      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Update fields if provided
      if (username) user.username = username;
      if (uid) user.UID = uid;

      await user.save();
      res.json({ message: 'Profile updated successfully', user });
    } catch (error) {
      console.error('Error updating user profile:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
  
  // Send OTP for signup
  sendOtp: async (req, res) => {
    try {
      const { email } = req.body;

      // Check if user already exists and is registered
      const existingUser = await User.findOne({ email, isRegistered: true });
      if (existingUser) {
        return res.json({ 
          message: "Account already exists...Wait!" 
        });
      }

      // Find or create temporary user
      let user = await User.findOne({ email, isRegistered: false });
      if (!user) {
        user = new User({ 
          email,
          isRegistered: false,
          username: "temp_" + Math.random().toString(36).substring(2, 8), // Temporary username
          password: "temp_" + Math.random().toString(36).substring(2, 8)  // Temporary password
        });
      }
      
      // Generate and save 4-digit OTP
      const otp = user.generateOTP();
      await user.save();

      // Send OTP via email with improved formatting
      await sendEmail(
        email,
        "Your Verification Code",
        `Your 4-digit verification code is: ${otp}\n\nThis code will expire in 10 minutes.\nDo not share this code with anyone.`
      );

      res.json({ message: "OTP sent successfully" });
    } catch (error) {
      console.error('Send OTP error:', error);
      res.status(500).json({ message: "Error sending OTP" });
    }
  },

  // Verify OTP and complete signup
  verifyOtp: async (req, res) => {
    try {
      const { username, email, password, otp } = req.body;

      // Find user by email
      const user = await User.findOne({ email, isRegistered: false }).select('+otp +otpExpires');
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      console.log(otp);
      // Verify 4-digit OTP
      if (!user.verifyOTP(otp)) {
        return res.json({ message: "Invalid OTP or OTP expired" });
      }
      
      // Update user details
      user.username = username;
      user.password = password;
      user.isRegistered = true;
      user.otp = undefined;
      user.otpExpires = undefined;
      
      // Generate a 9-digit UID
      user.UID = Math.floor(1000000000 + Math.random() * 9000000000).toString();
      
      await user.save();

      // Generate JWT token
      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({ 
        message: "Signup successful",
        token,
        UID: user.UID // Changed from uid to UID
      });
    } catch (error) {
      console.error('Verify OTP error:', error);
      res.status(500).json({ message: "Server Error" });
    }
  },

  // List all users (admin only)
  listUsers: async (req, res) => {
    try {
      const users = await User.find()
        .select('-password')
        .sort({ createdAt: -1 });
      
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Error fetching users' });
    }
  },

  // Login
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find registered user
      const user = await User.findOne({ email, isRegistered: true });
      if (!user) {
        return res.json({ 
          message: "Player not found...Wait!" 
        });
      }

      // Check if account is locked
      if (user.lockUntil && user.lockUntil > Date.now()) {
        return res.status(423).json({
          message: "Account is locked. Please try again later."
        });
      }

      // Verify password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        user.loginAttempts += 1;
        
        // Lock account after 5 failed attempts
        if (user.loginAttempts >= 5) {
          user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        }
        
        await user.save();
        return res.json({ message: "Incorrect Password" });
      }

      // Reset login attempts and update last login
      user.loginAttempts = 0;
      user.lastLogin = new Date();
      user.lockUntil = null;
      await user.save();

      // Generate token
      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({ 
        message: "Login successful",
        token,
        UID: user.UID // Changed from uid to UID
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: "Server Error" });
    }
  },

  // Get users by game category
  getUsersByGameCategory: async (req, res) => {
    try {
      const { category } = req.params;
      const validCategories = ['contest', 'debugging', 'flashcode'];
      
      if (!validCategories.includes(category)) {
        return res.status(400).json({ message: 'Invalid game category' });
      }

      const users = await User.find()
        .select('username UID HonorScore GlobalRank Challenges ContestCompleted ContestScore DebuggingCompleted DebuggingScore FlashCodeCompleted FlashCodeScore TotalScore')
        .sort({ [`${category}Score`]: -1 })
        .limit(50);

      res.json(users);
    } catch (error) {
      console.error('Error fetching users by game category:', error);
      res.status(500).json({ message: 'Error fetching users' });
    }
  },

  // Update user scores and completed levels
  updateScores: async (req, res) => {
    try {
      const { gameType, points, level, uid } = req.body;

      if (!gameType || !points || !level || !uid) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      // Find user by UID
      const user = await User.findOne({ UID: uid });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const updateFields = {};
      
      // Initialize completedLevels if it doesn't exist
      if (!user.completedLevels) {
        updateFields.completedLevels = {
          contest: [],
          debugging: [],
          flashcode: []
        };
      }

      // Check if level is already completed
      const gameTypeLower = gameType.toLowerCase();
      const completedLevels = user.completedLevels?.[gameTypeLower] || [];
      const isLevelCompleted = completedLevels.includes(level);
      
      // Use full points regardless of completion status
      const actualPoints = points;
      
      // Update game-specific fields based on game type
      switch (gameTypeLower) {
        case 'contest':
          updateFields.ContestScore = (user.ContestScore || 0) + actualPoints;
          if (!isLevelCompleted) {
            updateFields.ContestCompleted = (user.ContestCompleted || 0) + 1;
            // Add level to completed levels array
            updateFields['completedLevels.contest'] = [...completedLevels, level];
          }
          break;
        case 'debugging':
          updateFields.DebuggingScore = (user.DebuggingScore || 0) + actualPoints;
          if (!isLevelCompleted) {
            updateFields.DebuggingCompleted = (user.DebuggingCompleted || 0) + 1;
            // Add level to completed levels array
            updateFields['completedLevels.debugging'] = [...completedLevels, level];
          }
          break;
        case 'flashcode':
          updateFields.FlashCodeScore = (user.FlashCodeScore || 0) + actualPoints;
          if (!isLevelCompleted) {
            updateFields.FlashCodeCompleted = (user.FlashCodeCompleted || 0) + 1;
            // Add level to completed levels array
            updateFields['completedLevels.flashcode'] = [...completedLevels, level];
          }
          break;
        default:
          return res.status(400).json({ message: 'Invalid game type' });
      }

      // Update total score 
      updateFields.TotalScore = (user.TotalScore || 0) + points;

      
      // Create new activity
      const newActivity = {
        time: new Date(),
        activity: `Completed ${gameType} level ${level} with ${actualPoints} points${isLevelCompleted ? ' (replay)' : ''}`
      };

      // Get existing activities or initialize empty array
      const existingActivities = user.RecentActivity || [];
      
      // Add new activity and keep only last 3
      const updatedActivities = [newActivity, ...existingActivities].slice(0, 3);
      
      // Update the activities array
      updateFields.RecentActivity = updatedActivities;

      // Update user's scores
      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        { $set: updateFields },
        { new: true }
      );

      res.json({ 
        success: true, 
        message: 'Scores updated successfully',
        updatedStats: {
          gameType,
          points: actualPoints,
          level,
          isReplay: isLevelCompleted,
          totalScore: updatedUser.TotalScore,

          completedCount: updatedUser[`${gameType}Completed`],
          completedLevels: updatedUser.completedLevels?.[gameTypeLower],
          recentActivity: updatedUser.RecentActivity
        }
      });
    } catch (error) {
      console.error('Error updating scores:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Update challenge scores
  updateChallengeScore: async (req, res) => {
    try {
      const { uid, challengeType, points } = req.body;

      if (!uid || !challengeType || !points) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
      
      // Find user by UID
      const user = await User.findOne({ UID: uid });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const updateFields = {};
      
      // Double the points
      const doubledPoints = points * 2;
      
      // Update challenge-specific fields based on challenge type
      switch (challengeType.toLowerCase()) {
        case 'contest':
          updateFields['Challenges.completedContestChallenges'] = (user.Challenges?.completedContestChallenges || 0) + 1;
          break;
        case 'debugging':
          updateFields['Challenges.completedDebuggingChallenges'] = (user.Challenges?.completedDebuggingChallenges || 0) + 1;
          break;
        case 'flashcode':
          updateFields['Challenges.completedFlashCodeChallenges'] = (user.Challenges?.completedFlashCodeChallenges || 0) + 1;
          break;
        default:
          return res.status(400).json({ message: 'Invalid challenge type' });
      }

      // Update total completed challenges
      updateFields['Challenges.completedChallenges'] = (user.Challenges?.completedChallenges || 0) + 1;

      // Update battle score with doubled points
      updateFields.BattleScore = (user.BattleScore || 0) + doubledPoints;

      // Create new activity
      const newActivity = {
        time: new Date(),
        activity: `Completed ${challengeType} challenge with ${doubledPoints} points`
      };

      // Get existing activities or initialize empty array
      const existingActivities = user.RecentActivity || [];
      
      // Add new activity and keep only last 3
      const updatedActivities = [newActivity, ...existingActivities].slice(0, 3);
      
      // Update the activities array
      updateFields.RecentActivity = updatedActivities;

      // Update user's scores
      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        { $set: updateFields },
        { new: true }
      );

      res.json({ 
        success: true, 
        message: 'Challenge scores updated successfully',
        updatedStats: {
          challengeType,
          points: doubledPoints,
          battleScore: updatedUser.BattleScore,
          completedChallenges: updatedUser.Challenges.completedChallenges,
          recentActivity: updatedUser.RecentActivity
        }
      });
    } catch (error) {
      console.error('Error updating challenge scores:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get all player states by UID
  getPlayerStates: async (req, res) => {
    try {
      const { uid } = req.params;

      // Find user by UID
      const user = await User.findOne({ UID: uid })
        .select('HonorScore GlobalRank Challenges BattleScore ContestCompleted ContestScore DebuggingCompleted DebuggingScore FlashCodeCompleted FlashCodeScore TotalScore completedLevels RecentActivity');

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Format the response
      const playerStates = {
        honorScore: user.HonorScore,
        globalRank: user.GlobalRank,
        challenges: {
          total: user.Challenges.completedChallenges,
          contest: user.Challenges.completedContestChallenges,
          debugging: user.Challenges.completedDebuggingChallenges,
          flashcode: user.Challenges.completedFlashCodeChallenges
        },
        battleScore: user.BattleScore,
        contest: {
          completed: user.ContestCompleted,
          score: user.ContestScore
        },
        debugging: {
          completed: user.DebuggingCompleted,
          score: user.DebuggingScore
        },
        flashcode: {
          completed: user.FlashCodeCompleted,
          score: user.FlashCodeScore
        },
        totalScore: user.TotalScore,
        completedLevels: user.completedLevels,
        recentActivity: user.RecentActivity
      };

      res.json(playerStates);
    } catch (error) {
      console.error('Error fetching player states:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get leaderboard
  getLeaderboard: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 10;
      const skip = (page - 1) * limit;
      const sort = req.query.sort || 'GlobalRank';
      const order = req.query.order === 'ascending' ? 1 : -1;
      const search = req.query.search || '';

      // Build query
      const query = {};
      if (search) {
        query.$or = [
          { username: { $regex: search, $options: 'i' } },
          { UID: { $regex: search, $options: 'i' } }
        ];
      }

      // Get total count for pagination
      const total = await User.countDocuments(query);

      // Get users with sorting and pagination
      const users = await User.find(query)
        .sort({ [sort]: order })
        .skip(skip)
        .limit(limit)
        .select('username UID TotalScore BattleScore HonorScore GlobalRank Challenges ContestCompleted ContestScore DebuggingCompleted DebuggingScore FlashCodeCompleted FlashCodeScore completedLevels lastLogin createdAt');

      // Calculate next page
      const next = skip + limit < total ? page + 1 : null;

      res.json({
        results: users,
        total,
        next,
        page,
        totalPages: Math.ceil(total / limit)
      });
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      res.status(500).json({ message: 'Error fetching leaderboard data' });
    }
  },

  // Check if a level is completed
  checkLevelCompleted: async (req, res) => {
    try {
      const { uid, gameType, level } = req.query;

      if (!uid || !gameType || !level) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      // Find user by UID
      const user = await User.findOne({ UID: uid });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Get completed levels for the game type
      const gameTypeLower = gameType.toLowerCase();
      const completedLevels = user.completedLevels?.[gameTypeLower] || [];
      const isLevelCompleted = completedLevels.includes(level);

      res.json({
        isCompleted: isLevelCompleted,
        gameType: gameTypeLower,
        level: level
      });
    } catch (error) {
      console.error('Error checking level completion:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
};

module.exports = userController;