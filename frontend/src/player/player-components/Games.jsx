import React, { useState, useEffect, useCallback } from "react";
import PlayerNameBar from "./Player_name_bar";
import Levelslist from "./Levels_list";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowLeft } from "react-icons/fa";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import io from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';

import MainMenu from "./MainMenu";
import GameSelection from "./GameSelection";
import SearchAndFilter from "./SearchAndFilter";
import { containerVariants } from "./gameConstants";

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Initialize socket connection
const socket = io('http://localhost:5000');

export default function Layout() {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState("main");
  const [selectedGame, setSelectedGame] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [userData, setUserData] = useState({ username: '', uid: '' });
  const [isSearching, setIsSearching] = useState(false);

  // Generate unique ID for the player
  useEffect(() => {
    if (!userData.uid) {
      setUserData(prev => ({ ...prev, uid: uuidv4() }));
    }
  }, [userData.uid]);

  // Socket event listeners
  useEffect(() => {
    socket.on('match_found', ({ roomId, gameMode, level, opponent }) => {
      console.log('Match found event received:', { roomId, gameMode, level, opponent });
      setIsSearching(false);
      
      // Basic validation
      if (!level || !roomId || !gameMode || !opponent) {
        console.error('Missing required data in match_found event');
        return;
      }

      // Add user data to level
      const levelData = {
        ...level,
        username: userData.username,
        uid: userData.uid,
        opponent: {
          username: opponent.username || 'Anonymous',
          uid: opponent.uid || 'unknown'
        }
      };

      // Navigate to playground with level data
      navigate("/playground-pvp", { 
        state: levelData
      });
    });

    socket.on('match_error', ({ message, error }) => {
      console.error('Match error:', { message, error });
      setIsSearching(false);
      alert(message);
    });

    return () => {
      socket.off('match_found');
      socket.off('match_error');
    };
  }, [navigate, userData.username, userData.uid]);

  const transformGameType = useCallback((gameType) => {
    console.log('Transforming game type:', gameType);
    switch (gameType) {
      case 'debug':
        return 'debugging';
      case 'flash':
        return 'flashcode';
      case 'contest':
        return 'contest';
      default:
        return gameType;
    }
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('userToken');
        if (!token) {
          console.log('No token found');
          return;
        }
        
        const response = await api.get('/api/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('User data fetched:', response.data);
        
        setUserData({
          username: response.data.username,
          uid: response.data.UID
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleViewChange = async (view, game = null) => {
    if (currentView === "pvp" && game) {
      try {
        if (!userData.username || !userData.uid) {
          console.error('User data not available:', userData);
          return;
        }

        setIsSearching(true);
        
        const transformedGameType = transformGameType(game.type);
        console.log('Emitting find_match with:', {
          uid: userData.uid,
          username: userData.username,
          gameMode: transformedGameType
        });
        
        socket.emit('find_match', {
          uid: userData.uid,
          username: userData.username,
          gameMode: transformedGameType
        });
        
        return;
      } catch (error) {
        console.error('Failed to find match:', error);
        setIsSearching(false);
        return;
      }
    }
    
    setCurrentView(view);
    setSelectedGame(game);
  };

  const handleCancelSearch = () => {
    console.log('Cancelling search');
    setIsSearching(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-0">
      <div className="container mx-auto px-4 py-8">
        <PlayerNameBar Pagename={"Games"} />

        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.2 }}
            className="space-y-8"
          >
            {currentView !== "main" && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleViewChange("main")}
                className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                <FaArrowLeft /> Back to Menu
              </motion.button>
            )}

            {currentView === "main" && (
              <MainMenu handleViewChange={handleViewChange} />
            )}

            {(currentView === "pvp" || currentView === "practice") && (
              <GameSelection 
                currentView={currentView} 
                handleViewChange={handleViewChange} 
              />
            )}

            {(currentView === "contest" || currentView === "practice") && selectedGame && (
              <div className="space-y-6 text-gray-900 dark:text-white">
                <SearchAndFilter
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  selectedDifficulty={selectedDifficulty}
                  setSelectedDifficulty={setSelectedDifficulty}
                />
                <Levelslist
                  searchQuery={searchQuery}
                  difficulty={selectedDifficulty}
                  gameType={selectedGame.type === 'debug' ? 'debugging' : 
                          selectedGame.type === 'flash' ? 'flashcode' : 
                          selectedGame.type}
                />
              </div>
            )}

            {isSearching && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Finding an opponent...</h3>
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                  <button
                    onClick={handleCancelSearch}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
