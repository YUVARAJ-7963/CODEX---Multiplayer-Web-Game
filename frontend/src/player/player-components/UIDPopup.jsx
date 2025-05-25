import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json'
  }
});

const UIDPopup = ({ uid, username, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username: username || localStorage.getItem('tempUsername') || ''
  });
  
  useEffect(() => {
    console.log('UIDPopup mounted with props:', { uid, username });
    // If no username was passed as prop, try to get it from localStorage
    if (!username) {
      const tempUsername = localStorage.getItem('tempUsername');
      if (tempUsername) {
        console.log('Setting username from localStorage:', tempUsername);
        setFormData(prev => ({ ...prev, username: tempUsername }));
      }
    }
  }, [username, uid]);
  
  const handleContinue = async () => {
    console.log('Continue clicked with data:', { uid, username: formData.username });
    
    if (!uid) {
      setError('No UID available. Please try again.');
      return;
    }

    if (!formData.username.trim()) {
      setError('Please enter a username');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      const token = localStorage.getItem('userToken');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      console.log('Making API call with data:', {
        UID: uid,
        username: formData.username.trim(),
        token: token.substring(0, 10) + '...' // Log partial token for debugging
      });
      
      // Update user profile with UID and username
      const response = await api.post(
        '/api/users/update-profile', // Updated endpoint path
        { 
          UID: uid,
          username: formData.username.trim()
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Profile update response:', response.data);
      
      // Check if the response indicates success
      if (response.data.message === 'Profile updated successfully') {
        // Set a flag in localStorage to indicate profile is completed
        localStorage.setItem('profileCompleted', 'true');
        // Clear the new signup flag and temporary username
        localStorage.removeItem('isNewSignup');
        localStorage.removeItem('tempUsername');
        
        // Update the user data in localStorage
        localStorage.setItem('userUsername', formData.username.trim());
        localStorage.setItem('userUID', uid);
        
        console.log('Profile updated successfully, closing popup');
        onClose();
      } else {
        throw new Error(response.data.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error saving profile:', err);
      // More detailed error message
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          'Failed to save your profile. Please try again.';
      setError(errorMessage);
      
      // Log additional error details
      console.error('Error details:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  console.log('UIDPopup render:', { 
    uid, 
    username: formData.username, 
    isLoading, 
    error,
    localStorage: {
      isNewSignup: localStorage.getItem('isNewSignup'),
      profileCompleted: localStorage.getItem('profileCompleted'),
      tempUsername: localStorage.getItem('tempUsername'),
      userUID: localStorage.getItem('userUID')
    }
  });
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full relative"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
        
        <h2 className="text-2xl font-bold text-purple-700 mb-4">Welcome to the Platform!</h2>
        
        <p className="text-gray-600 mb-6">
          Please review and confirm your profile information below.
        </p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Player Name</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter your player name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your UID</label>
            <input
              type="text"
              value={uid}
              readOnly
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 cursor-not-allowed"
            />
            <p className="text-sm text-gray-500 mt-1">This is your unique identifier and cannot be changed</p>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mt-4">
            {error}
          </div>
        )}
        
        <div className="flex justify-end mt-6">
          <button
            onClick={handleContinue}
            disabled={isLoading || !formData.username.trim() || !uid}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg
                      transition-colors duration-300 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : 'Continue'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default UIDPopup;