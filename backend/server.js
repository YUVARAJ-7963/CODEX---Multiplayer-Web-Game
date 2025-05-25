require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const seedDefaultAdmin = require('./config/seedAdmin');
const rankService = require('./services/rankService');
const http = require('http');
const { Server } = require('socket.io');
const axios = require('axios');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Debug flag - set to true to see detailed connection logs
const DEBUG = process.env.NODE_ENV === 'development';

// Import routes
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const challengeRoutes = require('./routes/challengeRoutes');
const levelsRouter = require('./routes/levelRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const playerRoutes = require('./routes/playerRoutes');
const profileRoutes = require('./routes/profileRoutes');
 
// Initialize express app and server 
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:5000'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Store waiting players for each game mode
const waitingPlayers = {};

// Function to get random level based on game type
const getRandomLevel = async (gameType) => {
  try {
    if (DEBUG) console.log('Fetching levels for game type:', gameType);
    const response = await axios.get(`http://localhost:5000/api/levels?gameType=${gameType}`);
    if (!response.data || response.data.length === 0) {
      throw new Error('No levels found');
    }
    
    const levels = response.data;
    const randomIndex = Math.floor(Math.random() * levels.length);
    const level = levels[randomIndex];
    
    // Ensure level has required fields
    if (!level.title || !level.description) {
      console.error('Level missing required fields:', level);
      throw new Error('Invalid level data');
    }

    if (DEBUG) console.log('Selected level:', level);
    return level;
  } catch (error) {
    console.error('Error fetching random level:', error);
    throw error;
  }
};

// Socket.IO connection handling
io.on('connection', (socket) => {
  if (DEBUG) console.log(`Player connected: ${socket.id}`);

  socket.on('find_match', async ({ uid, username, gameMode }) => {
    try {
      if (DEBUG) console.log('Find match request:', { uid, username, gameMode });
      
      const transformedGameMode = gameMode.toLowerCase();

      if (waitingPlayers[transformedGameMode]) {
        const opponent = waitingPlayers[transformedGameMode];
        const roomId = `room-${uid}-${opponent.uid}`;
        
        // Get random level based on game type
        const level = await getRandomLevel(transformedGameMode);
        
        // Prepare clean level data
        const levelData = {
          title: level.title || 'Untitled Challenge',
          description: level.description || 'No description available',
          points: level.points || 0,
          level: level.level || 1,
          difficulty: level.difficulty || 'medium',
          gameType: transformedGameMode,
          gameMode: 'pvp',
          roomId: roomId,
          testCases: (level.testCases || []).map((testCase, index) => ({
            id: index + 1,
            input: testCase.input || '',
            output: testCase.output || '',
            description: testCase.description || `Test Case ${index + 1}`,
            isHidden: testCase.isHidden || false
          }))
        };

        // Add game-specific data
        switch (transformedGameMode) {
          case 'flashcode':
            if (!level.codeFile) throw new Error('FlashCode level missing codeFile');
            levelData.codeFile = level.codeFile;
            levelData.timeLimit = level.timeLimit || 30;
            break;
          case 'debugging':
            if (!level.buggycode) throw new Error('Debugging level missing buggycode');
            levelData.buggycode = level.buggycode;
            levelData.language = level.language || 'python';
            break;
          case 'contest':
            if (!level.testCases?.length) throw new Error('Contest level missing test cases');
            levelData.language = level.language || 'python';
            break;
          default:
            throw new Error(`Unsupported game mode: ${transformedGameMode}`);
        }

        // Emit to both players
        const matchData = {
          roomId,
          gameMode: transformedGameMode,
          level: levelData,
          opponent: { username, uid }
        };

        io.to(opponent.socketId).emit('match_found', matchData);
        socket.emit('match_found', {
          ...matchData,
          opponent: { username: opponent.username, uid: opponent.uid }
        });

        delete waitingPlayers[transformedGameMode];
      } else {
        waitingPlayers[transformedGameMode] = { 
          uid, 
          username, 
          socketId: socket.id,
          timestamp: Date.now()
        };
      }
    } catch (error) {
      console.error('Error in find_match:', error);
      socket.emit('match_error', { 
        message: 'Failed to find match. Please try again.',
        error: error.message 
      });
    }
  });

  socket.on('join_room', (roomId) => {
    socket.join(roomId);
  });

  socket.on('code_update', ({ roomId, code }) => {
    socket.to(roomId).emit('code_update', code);
  });

  socket.on('progress_update', ({ roomId, progress }) => {
    socket.to(roomId).emit('progress_update', { progress });
  });

  socket.on('give_up', ({ roomId, loser }) => {
    if (DEBUG) console.log('Player gave up:', { roomId, loser });
    const safeLoser = loser || { username: 'Unknown Player', uid: 'unknown' };
    socket.to(roomId).emit('opponent_gave_up', { 
      loser: safeLoser,
      timestamp: Date.now()
    });
  });

  socket.on('challenge_completed', ({ roomId, winner }) => {
    if (DEBUG) console.log('Challenge completed:', { roomId, winner });
    const safeWinner = winner || { username: 'Unknown Player', uid: 'unknown' };
    
    socket.emit('challenge_won', { 
      winner: safeWinner,
      timestamp: Date.now()
    });
    
    socket.to(roomId).emit('opponent_won_challenge', { 
      winner: safeWinner,
      timestamp: Date.now()
    });
  });

  socket.on('disconnect', () => {
    if (DEBUG) console.log(`Player disconnected: ${socket.id}`);
    Object.keys(waitingPlayers).forEach((gameMode) => {
      if (waitingPlayers[gameMode]?.socketId === socket.id) {
        delete waitingPlayers[gameMode];
      }
    });
  });
});

// Connect to database and seed default admin
const initializeServer = async () => {
  try {
    await connectDB();
    await seedDefaultAdmin();
    
    // Initialize rank service
    await rankService.updateUserRanks();
    rankService.startRankUpdate();
    
    // Middleware
    app.use(cors({
      origin: ['http://localhost:3000', 'http://localhost:5000'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    })); 
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    
    // Serve static files from uploads directory
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    app.use('/uploads', express.static(uploadsDir));
    
    // Routes
    app.use('/api/levels', levelsRouter);
    app.use('/api/leaderboard', leaderboardRoutes);
    app.use('/api', userRoutes);
    app.use('/api/admin', adminRoutes);
    app.use('/api/challenges', challengeRoutes);
    app.use('/api/feedback', feedbackRoutes);
    app.use('/api/announcements', announcementRoutes);
    app.use('/api/player', playerRoutes);
    app.use('/api/profile', profileRoutes);

    // Error handling middleware 
    app.use((err, req, res, next) => {
      console.error('Global error handler:', err);
      res.status(500).json({ message: 'Something went wrong!', error: err.message });
    });

    // Start server
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize server:', error);
    process.exit(1);
  }
};

// Start the server
initializeServer();

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codex', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));
