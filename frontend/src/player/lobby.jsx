import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./player-components/sidebar";
import Layout from "./player-components/Dashboard";
import GameLayout from "./player-components/Games";
import Leaderboard from "./player-components/Leaderboard";
import Announcements from "./player-components/Announcements";
import { useNavigate } from "react-router-dom";
import Settings from "./player-components/Settings";
import UIDPopup from "./player-components/UIDPopup";
import axios from "axios";

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:5000', // Your backend server URL
  headers: {
    'Content-Type': 'application/json'
  }
});

export default function Lobby() { 
  const [selected, setSelected] = useState("Home");
  const [isLoading, setIsLoading] = useState(true);
  const [showUIDPopup, setShowUIDPopup] = useState(false);
  const [userData, setUserData] = useState({ UID: '', username: '' });
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("userToken");
    if (!token) {
      navigate("/");
      return;
    }
    
    // Check if this is a new signup
    const isNewSignup = localStorage.getItem('isNewSignup') === 'true';
    const profileCompleted = localStorage.getItem('profileCompleted') === 'true';
    const tempUsername = localStorage.getItem('tempUsername');
    const userUID = localStorage.getItem('userUID');
    
    console.log('Initial Debug Info:', {
      isNewSignup,
      profileCompleted,
      tempUsername,
      userUID
    });
    
    // If this is a new signup and profile is not completed, show popup immediately
    if (isNewSignup && !profileCompleted) {
      console.log('New signup detected, showing popup');
      setUserData({
        UID: userUID || '',
        username: tempUsername || ''
      });
      setShowUIDPopup(true);
      setIsLoading(false);
      return;
    }
    
    // For existing users, fetch their data
    const fetchUserData = async () => {
      try {
        console.log('Fetching user data with token:', token);
        const response = await api.get('/api/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const userProfile = response.data;
        console.log('Fetched user profile:', userProfile);
        
        setUserData(userProfile);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        // If there's an error, still show the popup for new signups
        if (isNewSignup && !profileCompleted) {
          console.log('Error fetching data, but showing popup for new signup');
          setUserData({
            UID: userUID || '',
            username: tempUsername || ''
          });
          setShowUIDPopup(true);
        }
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [navigate]);

  // Add effect to monitor state changes
  useEffect(() => {
    console.log('State changed:', {
      showUIDPopup,
      userData,
      isLoading,
      localStorage: {
        isNewSignup: localStorage.getItem('isNewSignup'),
        profileCompleted: localStorage.getItem('profileCompleted'),
        tempUsername: localStorage.getItem('tempUsername'),
        userUID: localStorage.getItem('userUID')
      }
    });
  }, [showUIDPopup, userData, isLoading]);

  const handleSelect = (option) => {
    if (option === "Logout") {
      // Handle logout
      localStorage.removeItem("userToken");
      navigate("/");
      return;
    }
    setSelected(option);
  };

  const handleUIDPopupClose = () => {
    console.log('Closing UID popup');
    setShowUIDPopup(false);
    // Refresh user data after popup closes
    const token = localStorage.getItem("userToken");
    if (token) {
      api.get('/api/profile', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(response => {
        console.log('Refreshed user data:', response.data);
        setUserData(response.data);
      }).catch(error => {
        console.error('Error refreshing user data:', error);
      });
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-purple-700 to-indigo-800">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-white text-center"
        >
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xl font-semibold">Loading your gaming hub...</p>
        </motion.div>
      </div>
    );
  }

  const pageTransition = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Sidebar onSelect={handleSelect} selected={selected} />

      <main className="flex-1 overflow-y-auto ml-20 p-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={selected}
            variants={pageTransition}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
           
          >
            {selected === "Home" && <Layout/>}
            {selected === "Games" && <GameLayout />}
            {selected === "Leader Board" && <Leaderboard />}
            {selected === "Announcements" && <Announcements />}
            {selected === "Settings" && <Settings />}
          </motion.div>
        </AnimatePresence>
      </main>
      
      {/* UID Popup for first-time users */}
      {showUIDPopup && (
        <UIDPopup 
          uid={userData.UID}
          username={userData.username}
          onClose={handleUIDPopupClose}
        />
      )}
    </div>
  );
}
