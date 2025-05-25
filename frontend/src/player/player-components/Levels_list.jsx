import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Clock, Code, Trophy, Star } from 'lucide-react';
import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:5000', // Your backend server URL
  headers: {
    'Content-Type': 'application/json'
  }
});



const Levelslist = ({ searchQuery, difficulty, gameType }) => {

  const navigate = useNavigate();


  const [levels, setLevels] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLevels = useCallback(async () => {
    try {
      setIsLoading(true); 
      console.log('Fetching levels for gameType:', gameType);
      
      // Normalize gameType to lowercase for consistency
      const normalizedGameType = gameType.toLowerCase();
      
      const response = await api.get(`/api/levels?gameType=${normalizedGameType}`);
      
      console.log('API Response received:', response.data);
      
      if (!response.data) {
        console.error('Empty response data');
        throw new Error('Invalid response from server');
      }
      
      // Handle empty response or "No levels found" message
      if (response.data.message === "No levels found") {
        console.log('No levels found message received');
        setLevels([]);
        return;
      }
      
      // Ensure we have an array of levels
      if (!Array.isArray(response.data)) {
        console.error('Invalid response format:', response.data);
        setLevels([]);
        return;
      }
      
      console.log(`Processing ${response.data.length} levels`);
      
      // Transform the levels data with consistent field handling
      const transformedLevels = response.data.map(level => { 
        const baseFields = {
          ...level,
          title: level.title || 'Untitled Challenge',
          difficulty: level.difficulty || 'Medium',
          description: level.description || 'No description available',
          points: level.points || 0,
          level: level.level || 1
        };

        // Add game-specific fields with proper defaults
        switch (normalizedGameType) {
          case 'flashcode':
            return {
              ...baseFields,
              timeLimit: level.timeLimit || 30,
              limitTime: level.limitTime || 30
            };
          case 'contest':
          case 'debugging':
            return baseFields;
          default:
            console.warn(`Unknown game type: ${normalizedGameType}`);
            return baseFields;
        }
      });

      setLevels(transformedLevels);
    } catch (error) {
      console.error('Error fetching levels:', error);
      setLevels([]);
      
      // Handle specific error cases
      if (error.response?.status === 400) {
        console.error('Invalid request:', error.response.data);
      } else {
        console.error('Server error:', error.response?.data || error.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [gameType]);

  useEffect(() => {
    console.log('Levelslist mounted/updated with gameType:', gameType);
    if (gameType) {
      fetchLevels();
    }
  }, [gameType, fetchLevels]);

  const filteredLevels = levels.filter(level => {
    const matchesSearch = level.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = difficulty === 'all' || level.difficulty.toLowerCase() === difficulty.toLowerCase();
    return matchesSearch && matchesDifficulty;
  }).sort((a, b) => a.level - b.level);

  const handleLevelClick = (level) => {
    if (!gameType) {
      console.error('No game type specified');
      return;
    }
    
    const normalizedGameType = gameType.toLowerCase();
    let playgroundData = {
      gameType: normalizedGameType,
      level,
      mode: 'practice',
      from: 'challenge'
    };

    // Add game-specific data based on game type
    switch (normalizedGameType) {
      case 'flashcode':
        console.log('Level data for FlashCode:', level);
        console.log('codeFile for FlashCode:', level.codeFile);
        playgroundData = {
          ...playgroundData,
          title: level.title || '',
          description: level.description || '',
          points: level.points || 0,
          timeLimit: level.timeLimit || 30,
          codeFile: level.codeFile || '',
          testCases: level.testCases || []
        };
        console.log('Sending flashcode data:', playgroundData);
        break;
      case 'debugging':
        playgroundData = {
          ...playgroundData,
          buggycode: level.buggycode || '',
          testCases: level.testCases || [],
          description: level.description || '',
          points: level.points || 0,
          title: level.title || ''
        };
        console.log('Sending debugging data:', playgroundData);
        break;
      case 'contest':
        playgroundData = {
          ...playgroundData,
          testCases: level.testCases || [],
          description: level.description || '',
          points: level.points || 0,
          title: level.title || ''
        };
        break;
      default:
        playgroundData = {
          ...playgroundData,
          testCases: level.testCases || []
        };
    }
    
    navigate('/playground', {
      state: playgroundData
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (filteredLevels.length === 0) {
    return (
      <div className="text-center text-black dark:text-white py-8">
        <p className="text-lg">No levels available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredLevels.map((level, index) => (
        <motion.div
          key={level._id || index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleLevelClick(level)}
          className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 cursor-pointer
            hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-600 dark:hover:to-gray-700 transition-all duration-300 border border-gray-200 dark:border-gray-600
            shadow-lg hover:shadow-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="bg-purple-100 dark:bg-purple-400/20 p-2 rounded-lg">
                <Code className="text-purple-600 dark:text-purple-300" size={20} />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{level.title}</h3>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm ${
              level.difficulty === 'Easy' ? 'bg-green-100 dark:bg-green-400/20 text-green-600 dark:text-green-300' :
              level.difficulty === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-400/20 text-yellow-600 dark:text-yellow-300' :
              'bg-red-100 dark:bg-red-400/20 text-red-600 dark:text-red-300'
            }`}>
              {level.difficulty}
            </span>
          </div>
          
          <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{level.description}</p>
          
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-500 mb-4">
            {gameType === 'flashcode' && (
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>{level.timeLimit} sec</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Trophy size={16} />
              <span>{level.points} points</span>
            </div>
          </div>

          {gameType === 'FlashCode' && (
            <div className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-300 mb-4">
              <Clock size={16} />
              <span>Time Limit: {level.limitTime} seconds</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-300">
              <Star size={16} />
              <span>Level {level.level}</span>
            </div>
            <button className="bg-purple-600 dark:bg-purple-600 hover:bg-purple-700 dark:hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Start Challenge
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default Levelslist;