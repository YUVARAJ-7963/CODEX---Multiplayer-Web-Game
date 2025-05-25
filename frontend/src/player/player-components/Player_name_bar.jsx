import React, { useState, useEffect } from 'react';
import { User2Icon, Copy, Sun, Moon } from "lucide-react";
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

const PlayerNameBar = ({ Pagename }) => {
  const [userData, setUserData] = useState({ 
    username: 'Player', 
    uid: '',
    avatarUrl: '',
    isImageLoading: true,
    imageError: false
  });
  const [copied, setCopied] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('userToken');
        if (!token) return;
        
        const response = await api.get('/api/profile', {
          headers: { Authorization: `Bearer ${token}` }
        }); 
        
        // Store userId in localStorage
        localStorage.setItem('userId', response.data.UID);
        
        // Construct the avatar URL with timestamp to prevent caching
        const avatarUrl = response.data.UID ? 
          `${API_BASE_URL}/api/profile/${response.data.UID}/avatar?t=${new Date().getTime()}` : 
          '';
        
        setUserData(prev => ({
          ...prev,
          username: response.data.username,
          uid: response.data.UID,
          avatarUrl: avatarUrl,
          isImageLoading: !!avatarUrl
        }));

        if (avatarUrl) {
          const img = new Image();
          img.src = avatarUrl;
          
          img.onload = () => {
            setUserData(prev => ({
              ...prev,
              isImageLoading: false,
              imageError: false
            }));
          };
          
          img.onerror = (e) => {
            console.error('Failed to load avatar:', e);
            setUserData(prev => ({
              ...prev,
              isImageLoading: false,
              imageError: true
            }));
          };
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUserData(prev => ({
          ...prev,
          isImageLoading: false,
          imageError: true
        }));
      }
    };

    fetchUserData();
  }, []);
  
  const copyUID = () => {
    if (userData.uid) {
      navigator.clipboard.writeText(userData.uid);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full px-4 flex items-center justify-between mb-4">
      <h1 className={`text-4xl font-bold flex-col mt-2 ${Pagename === "Dashboard" ? "text-purple-400" : "text-gray-900 dark:text-white"}`}>
        {Pagename}
      </h1>

      <div className="bg-transparent rounded-full flex flex-row justify-center items-center gap-6 px-3 py-2 hover:shadow-lg transition-all duration-300 border-2 border-gray-200 dark:border-gray-700 mt-3">
        
        {/* Theme Toggle Button */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-purple-500"
          aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDarkMode ? (
            <Sun size={20} className="text-yellow-500 transition-transform duration-300" />
          ) : (
            <Moon size={20} className="text-purple-500 transition-transform duration-300" />
          )}
        </button>

        <div className="text-purple-700 hover:scale-110 transition-transform cursor-pointer">
          <svg
            className="w-10 h-10 stroke-purple-700 dark:stroke-purple-500 fill-purple-700 dark:fill-purple-500"
            viewBox="0 0 384 512"
          >
            <path d="M162.7 210c-1.8 3.3-25.2 44.4-70.1 123.5-4.9 8.3-10.8 12.5-17.7 12.5H9.8c-7.7 0-12.1-7.5-8.5-14.4l69-121.3c.2 0 .2-.1 0-.3l-43.9-75.6c-4.3-7.8 .3-14.1 8.5-14.1H100c7.3 0 13.3 4.1 18 12.2l44.7 77.5zM382.6 46.1l-144 253v.3L330.2 466c3.9 7.1 .2 14.1-8.5 14.1h-65.2c-7.6 0-13.6-4-18-12.2l-92.4-168.5c3.3-5.8 51.5-90.8 144.8-255.2 4.6-8.1 10.4-12.2 17.5-12.2h65.7c8 0 12.3 6.7 8.5 14.1z" />
          </svg>
        </div>

        <div className="player_details">
          <h1 className="text-gray-900 dark:text-gray-200 font-semibold">
            {userData.username}
          </h1>
          <div className="flex items-center gap-1">
            <h4 className="text-gray-600 dark:text-gray-400 text-sm">{userData.uid || 'No UID'}</h4>
            {userData.uid && (
              <button 
                onClick={copyUID} 
                className="text-gray-500 hover:text-purple-600 transition-colors"
                title="Copy UID"
              >
                {copied ? (
                  <span className="text-xs text-green-600">Copied!</span>
                ) : (
                  <Copy size={12} />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Profile Icon */}
        <div className="relative">
          <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-md border-2 border-transparent overflow-hidden">
            {userData.isImageLoading ? (
              <div className="animate-pulse bg-gray-200 dark:bg-gray-700 w-full h-full flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : userData.imageError || !userData.avatarUrl ? (
              <User2Icon size={24} className="text-purple-700 dark:text-purple-400" />
            ) : (
              <img 
                src={userData.avatarUrl}
                alt="Profile avatar"
                className="w-full h-full object-cover"
                onError={() => {
                  setUserData(prev => ({
                    ...prev,
                    imageError: true
                  }));
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerNameBar;
