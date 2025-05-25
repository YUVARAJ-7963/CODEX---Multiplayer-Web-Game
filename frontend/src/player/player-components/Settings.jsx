import React, { useState, useEffect } from 'react';
import { User, Copy, MessageSquare, Globe } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import PlayerNameBar from './Player_name_bar';
import bannerImage from '../player-images/banner.png';

// Add API base URL constant and update fetch calls to use absolute URLs
export default function Settings() {
  const API_BASE_URL = 'http://localhost:5000';
  const [searchParams] = useSearchParams();
  const uidParam = searchParams.get('uid');

  const [activeSection, setActiveSection] = useState('profile');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [feedbacks, setFeedbacks] = useState([]);
  const [isLoadingFeedbacks, setIsLoadingFeedbacks] = useState(false);
  const [copyStatus, setCopyStatus] = useState(false);
  const [isViewingOtherProfile, setIsViewingOtherProfile] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [profileData, setProfileData] = useState({
    uid: '',
    displayName: '',
    bio: '',
    yearJoined: new Date().getFullYear(),
    avatarUrl: '',
    language: 'English',
    username: '',
    email: ''
  });

  const [uploadStatus, setUploadStatus] = useState({ type: '', message: '' });
  const [saveStatus, setSaveStatus] = useState({ loading: false, success: false, error: null });

  const [originalProfileData, setOriginalProfileData] = useState({});
  const [imageError, setImageError] = useState(false);
  const [notification, setNotification] = useState({ 
    show: false, 
    message: '', 
    type: '' 
  });
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [tempBio, setTempBio] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus(true);
      setTimeout(() => setCopyStatus(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const fetchFeedbacks = async () => {
    try {
      setIsLoadingFeedbacks(true);
      const token = localStorage.getItem('userToken');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/feedback/list`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setFeedbacks(data);
      } else {
        console.error('Failed to fetch feedbacks');
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
    } finally {
      setIsLoadingFeedbacks(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        setFeedbackStatus('error');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/feedback/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({
          message: feedbackMessage
        }),
      });

     await response.json();
      if (response.ok) {
        setFeedbackStatus('success');
        setFeedbackMessage('');
        fetchFeedbacks();
      } else {
        setFeedbackStatus('error');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setFeedbackStatus('error');
    }
  };

  const fetchUserProfile = async () => {
    setIsLoading(true);
    try {
      console.log('Attempting to fetch user profile...');
      
      // Get the token from localStorage
      const token = localStorage.getItem('userToken');
      if (!token) {
        console.error('No authentication token found');
        window.location.href = '/login';
        return;
      }
      
      // Get the user ID from localStorage
      const userId = localStorage.getItem('userId');
      console.log('User ID:', userId);
      
      if (!userId) {
        // If no userId found, try to get it from the token
        try {
          const response = await fetch(`${API_BASE_URL}/api/profile`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (!response.ok) {
            throw new Error('Failed to fetch profile');
          }
          
          const data = await response.json();
          localStorage.setItem('userId', data.UID);
          userId = data.UID;
        } catch (error) {
          console.error('Error getting userId from token:', error);
          window.location.href = '/login';
          return;
        }
      }
      
      const response = await fetch(`${API_BASE_URL}/api/profile?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Profile API response status:', response.status);
      
      if (!response.ok) {
        console.error('Profile fetch failed with status:', response.status);
        throw new Error(`Failed to fetch profile (Status: ${response.status})`);
      }

      const userData = await response.json();
      console.log('Profile data received:', userData);
      
      // Reset viewing other profile flag
      setIsViewingOtherProfile(false);
      
      // Important: Reset image related states first
      setImageError(false);
      setIsImageLoading(false);
      
      // Ensure we have userData with correct fields
      if (userData) {
        // Create updated profile data with all fields
        const updatedProfile = {
          uid: userData.UID || '',
          displayName: userData.username || '',
          username: userData.username || '',
          email: userData.email || '',
          avatarUrl: userData.avatarUrl || '',
          bio: userData.bio || '',
          language: userData.language || 'English',
          yearJoined: userData.createdAt ? new Date(userData.createdAt).getFullYear() : new Date().getFullYear(),
          // Add stats if available
          HonorScore: userData.HonorScore || 0,
          GlobalRank: userData.GlobalRank || 0,
          TotalScore: userData.TotalScore || 0
        };
        
        console.log('Setting profile data:', updatedProfile);
        setProfileData(updatedProfile);
        
        // Keep track of original data to detect changes
        setOriginalProfileData({
          displayName: userData.username || '',
          username: userData.username || '',
          email: userData.email || '',
          bio: userData.bio || '',
          language: userData.language || 'English',
          avatarUrl: userData.avatarUrl || ''
        });
      } else {
        console.error('Invalid user data format received:', userData);
        throw new Error('No user data returned from server');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setNotification({
        type: 'error',
        message: `Failed to load profile data: ${error.message}`,
        show: true
      });
      
      // Keep notification visible longer for error messages
      setTimeout(() => {
        setNotification({
          show: false,
          message: '',
          type: ''
        });
      }, 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProfileByUID = async (uid) => {
    try {
      setIsLoading(true);
      
      // First fetch profile data
      const profileResponse = await fetch(`${API_BASE_URL}/api/profile/user/${uid}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!profileResponse.ok) {
        throw new Error('Failed to fetch profile data');
      }

      const profileData = await profileResponse.json();
      
      // Then fetch the avatar image if it exists
      if (profileData.avatarUrl) {
        const imageResponse = await fetch(`${API_BASE_URL}/api/profile/${uid}`);
        
        if (imageResponse.ok) {
          const blob = await imageResponse.blob();
          const imageUrl = URL.createObjectURL(blob);
          profileData.avatarUrl = imageUrl;
        }
      }

      // Set viewing other profile flag
      setIsViewingOtherProfile(true);
      
      // Reset image error state
      setImageError(false);
      
      // Update profile data with all fields
      setProfileData({
        uid: profileData.UID || uid,
        displayName: profileData.username || '',
        username: profileData.username || '',
        email: '',  // Don't expose other users' emails
        avatarUrl: profileData.avatarUrl || '',
        bio: profileData.bio || '',
        language: profileData.language || 'English',
        yearJoined: profileData.createdAt ? new Date(profileData.createdAt).getFullYear() : new Date().getFullYear(),
        HonorScore: profileData.HonorScore || 0,
        GlobalRank: profileData.GlobalRank || 0,
        TotalScore: profileData.TotalScore || 0
      });
      
      // Update original profile data
      setOriginalProfileData({
        displayName: profileData.username || '',
        username: profileData.username || '',
        email: '',
        bio: profileData.bio || '',
        language: profileData.language || 'English',
        avatarUrl: profileData.avatarUrl || ''
      });
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setNotification({
        show: true,
        message: error.message || 'Failed to fetch profile',
        type: 'error'
      });
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    // If UID param is provided, fetch that specific profile
    if (uidParam) {
      console.log(`Loading profile for UID: ${uidParam}`);
      fetchProfileByUID(uidParam);
    } else {
      // Otherwise load the current user's profile
      fetchUserProfile();
    }
  }, [uidParam]);

  // Add a dedicated effect to preload avatar image when the URL changes
  useEffect(() => {
    if (profileData.avatarUrl) {
      console.log('Preloading avatar image:', profileData.avatarUrl);
      
      // Always reset loading state when URL changes
      setIsImageLoading(true);
      setImageError(false);
      
      // Directly set up the image
      const img = new Image();
      img.src = profileData.avatarUrl;
      
      img.onload = () => {
        console.log('Avatar image loaded successfully');
        setIsImageLoading(false);
        setImageError(false);
      };
      
      img.onerror = (e) => {
        console.error('Failed to preload avatar image:', e);
        setIsImageLoading(false);
        setImageError(true);
      };
    }
  }, [profileData.avatarUrl]);

  useEffect(() => {
    if (activeSection === 'feedback') {
      fetchFeedbacks();
    }
  }, [activeSection]);

  // Add a useEffect for debug logging
  useEffect(() => {
    // Debug log for important state values
    console.log('======= DEBUG STATE VALUES =======');
    console.log('Profile Data:', profileData);
    console.log('Image Error State:', imageError);
    console.log('Avatar URL:', profileData.avatarUrl);
    console.log('Bio:', profileData.bio);
    console.log('Upload Status:', uploadStatus);
    console.log('==================================');
  }, [profileData, imageError, uploadStatus]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setNotification({
          show: true,
          message: 'Please select a valid image file (JPEG, PNG, GIF, or WebP)',
          type: 'error'
        });
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setNotification({
          show: true,
          message: 'File size must be less than 5MB',
          type: 'error'
        });
        return;
      }

      setSelectedFile(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setPreviewUrl(previewUrl);
      
      // Show preview immediately
      setImageError(false);
      setIsImageLoading(false);
      setProfileData(prev => ({
        ...prev,
        avatarUrl: previewUrl
      }));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setIsImageLoading(true);
      setNotification({ show: false, message: '', type: '' });
      
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('userId', profileData.uid);

      console.log('Uploading file:', {
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileType: selectedFile.type,
        userId: profileData.uid
      });

      const response = await fetch(`${API_BASE_URL}/api/profile/upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload image');
      }

      const data = await response.json();
      console.log('Upload response:', data);
      
      // Clear selected file and preview
      setSelectedFile(null);
      setPreviewUrl('');
      
      // Force image reload by updating the URL with a timestamp
      const timestamp = new Date().getTime();
      const newAvatarUrl = `${API_BASE_URL}/api/profile/${profileData.uid}/avatar?t=${timestamp}`;
      
      // Update profile data with new URL
      setProfileData(prev => ({
        ...prev,
        avatarUrl: newAvatarUrl
      }));

      // Preload the new image
      const img = new Image();
      img.src = newAvatarUrl;
      
      img.onload = () => {
        setIsImageLoading(false);
        setImageError(false);
        setNotification({
          show: true,
          message: 'Profile image updated successfully',
          type: 'success'
        });
      };
      
      img.onerror = () => {
        setIsImageLoading(false);
        setImageError(true);
        setNotification({
          show: true,
          message: 'Image uploaded but failed to load. Please refresh the page.',
          type: 'error'
        });
      };

    } catch (error) {
      console.error('Error uploading image:', error);
      setNotification({
        show: true,
        message: error.message || 'Failed to upload image',
        type: 'error'
      });
      setIsImageLoading(false);
      setImageError(true);
    }
  };

  const handleBioEdit = () => {
    setTempBio(profileData.bio || '');
    setIsEditingBio(true);
  };

  const handleBioSave = async () => {
    try {
      setSaveStatus({ loading: true, success: false, error: null });
      const token = localStorage.getItem('userToken');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/api/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bio: tempBio
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update bio');
      }

      setProfileData(prev => ({ ...prev, bio: tempBio }));
      setSaveStatus({ loading: false, success: true, error: null });
      setIsEditingBio(false);
      setNotification({
        show: true,
        message: 'Bio updated successfully',
        type: 'success'
      });
    } catch (error) {
      console.error('Error updating bio:', error);
      setSaveStatus({ loading: false, success: false, error: error.message });
      setNotification({
        show: true,
        message: error.message || 'Failed to update bio',
        type: 'error'
      });
    }
  };

  const handleBioCancel = () => {
    setIsEditingBio(false);
    setTempBio('');
  };

  const settingSections = [
    {
      id: 'profile',
      title: "Profile",
      icon: <User className="text-purple-600 dark:text-purple-400" />,
      content: (
        <div className="space-y-6">
          <div className="relative">
            <div 
              className="w-full h-48 rounded-lg overflow-hidden relative"
              style={{
                backgroundImage: `url(${bannerImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              {/* Left to right gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
              
              {/* Profile Info Section */}
              <div className="absolute inset-0 flex items-center">
                <div className="container mx-auto px-8">
                  <div className="flex items-center gap-6">
                    {/* Avatar Section */}
                    <div className="relative shrink-0">
                      <div 
                        className="w-28 h-28 bg-purple-100 dark:bg-purple-900/50 rounded-xl border-2 border-purple-400 dark:border-purple-500 
                          flex items-center justify-center overflow-hidden shadow-lg transition-all duration-300 relative cursor-pointer"
                        onClick={() => document.getElementById('avatar-upload').click()}
                      >
                        {isImageLoading ? (
                          <div className="animate-pulse bg-gray-200 dark:bg-gray-700 w-full h-full flex items-center justify-center">
                            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        ) : imageError || !profileData.uid ? (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-10 h-10 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                            </svg>
                          </div>
                        ) : (
                          <img 
                            src={`${API_BASE_URL}/api/profile/${profileData.uid}/avatar${profileData.avatarUrl.includes('?') ? '' : '?t=' + new Date().getTime()}`}
                            alt="Profile avatar"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.error('Image failed to load:', e);
                              setImageError(true);
                              setIsImageLoading(false);
                            }}
                            onLoad={() => {
                              console.log('Image loaded successfully');
                              setIsImageLoading(false);
                              setImageError(false);
                            }}
                          />
                        )}
                        
                        <input
                          id="avatar-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        
                        {!isViewingOtherProfile && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity duration-200">
                            <span className="p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
                              Change Photo
                            </span>
                          </div>
                        )}
                      </div>
                      {selectedFile && (
                        <div className="mt-2 flex gap-2">
                          <button
                            onClick={handleUpload}
                            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                          >
                            Upload
                          </button>
                          <button
                            onClick={() => {
                              setSelectedFile(null);
                              setPreviewUrl('');
                            }}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Profile Details */}
                    <div className="flex flex-col justify-center gap-3">
                      {/* Name and Language Row */}
                      <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold text-white tracking-wide">
                          {profileData.displayName || 'Username'}
                        </h2>
                        <div className="flex items-center gap-2 px-3 py-1 bg-black/30 rounded-full">
                          <Globe size={16} className="text-gray-300" />
                          <span className="text-sm text-gray-300">{profileData.language}</span>
                        </div>
                      </div>

                      {/* UID Row */}
                  <button
                    onClick={() => copyToClipboard(profileData.uid)}
                        className="group flex items-center gap-2 text-sm text-gray-300 bg-black/30 hover:bg-black/40 px-3 py-1.5 rounded-full w-fit transition-all duration-200"
                      >
                        <Copy size={14} className={`${copyStatus ? "text-green-400" : ""} transition-colors duration-200`} />
                        <span className="font-mono tracking-wide">UID: {profileData.uid}</span>
                        <span 
                          className={`text-xs ${
                            copyStatus 
                              ? "opacity-100 translate-x-0" 
                              : "opacity-0 -translate-x-2"
                          } transition-all duration-200 text-green-400`}
                        >
                          Copied!
                        </span>
                  </button>

                      {/* Bio Row */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Bio</label>
                        {isEditingBio ? (
                          <div className="space-y-2">
                            <textarea
                              value={tempBio}
                              onChange={(e) => setTempBio(e.target.value)}
                              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 
                                bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                                border-gray-200 dark:border-gray-600 transition-all duration-300"
                              rows={4}
                              placeholder="Write something about yourself..."
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={handleBioSave}
                                disabled={saveStatus.loading}
                                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
                              >
                                {saveStatus.loading ? 'Saving...' : 'Save'}
                              </button>
                              <button
                                onClick={handleBioCancel}
                                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="relative">
                            <textarea
                              value={profileData.bio || ''}
                              readOnly
                              className="w-full p-3 border rounded-lg cursor-not-allowed
                                bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                                border-gray-200 dark:border-gray-600 transition-all duration-300"
                              rows={4}
                              placeholder="No bio provided"
                            />
                            {!isViewingOtherProfile && (
                              <button
                                onClick={handleBioEdit}
                                className="absolute top-2 right-2 px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
                              >
                                Edit
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {uploadStatus.message && (
            <div className={`p-4 rounded-lg ${
              uploadStatus.type === 'success' 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' 
                : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
            } transition-colors duration-200`}>
              {uploadStatus.message}
            </div>
          )}

          {/* Rest of the profile settings */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 transition-all duration-300">
            <div className="grid gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Display Name</label>
                <input
                  type="text"
                  value={profileData.displayName}
                  className="w-full p-3 border rounded-lg cursor-not-allowed
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                    border-gray-200 dark:border-gray-600 transition-all duration-300"
                  placeholder="Enter your display name"
                  readOnly
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Language</label>
                <input
                  type="text"
                  value={profileData.language}
                  className="w-full p-3 border rounded-lg cursor-not-allowed
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                    border-gray-200 dark:border-gray-600 transition-all duration-300"
                  readOnly
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Bio</label>
                <textarea
                  value={profileData.bio || ''}
                  className="w-full p-3 border rounded-lg cursor-not-allowed
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                    border-gray-200 dark:border-gray-600 transition-all duration-300"
                  rows={4}
                  placeholder="No bio provided"
                  readOnly
                />
              </div>

              {/* Remove reference to disabled functionality */}
              <div className="flex justify-end mt-4">
                <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                  Profile information
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'feedback',
      title: "Feedback",
      icon: <MessageSquare className="text-purple-600 dark:text-purple-400" />,
      content: (
        <div className="space-y-6">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 transition-all duration-300">
            <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Submit Feedback</h3>
            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your Feedback
                </label>
                <textarea
                  value={feedbackMessage}
                  onChange={(e) => setFeedbackMessage(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                    border-gray-200 dark:border-gray-600 transition-colors duration-200"
                  rows={4}
                  placeholder="Share your thoughts, suggestions, or report issues..."
                  required
                />
              </div>
              {feedbackStatus === 'success' && (
                <div className="text-green-600 dark:text-green-400 text-sm">
                  Thank you for your feedback!
              </div>
              )}
              {feedbackStatus === 'error' && (
                <div className="text-red-600 dark:text-red-400 text-sm">
                  There was an error submitting your feedback. Please try again.
            </div>
              )}
                  <button
                type="submit"
                className="w-full bg-purple-600 dark:bg-purple-500 text-white py-2 px-4 rounded-lg 
                  hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors duration-200"
              >
                Submit Feedback
                  </button>
            </form>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 transition-all duration-300">
            <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Your Feedback History</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Here are all the feedbacks you've submitted:</p>
            {isLoadingFeedbacks ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : feedbacks.length > 0 ? (
              <div className="max-h-[400px] overflow-y-auto pr-2 space-y-4">
                {feedbacks.map((feedback, index) => (
                  <div key={index} className="border-b dark:border-gray-700/50 last:border-0 pb-4 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Submitted on {new Date(feedback.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{feedback.message}</p>
                </div>
              ))}
            </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">You haven't submitted any feedback yet.</p>
            )}
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-all duration-300">
      <PlayerNameBar Pagename={isViewingOtherProfile ? `${profileData.displayName}'s Profile` : "Profile Settings"} />
      
      {/* Global notification */}
      {notification.show && (
        <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 py-2 px-4 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white transition-all duration-300 flex items-center`}>
          <span className="mr-2">
            {notification.type === 'success' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
          </span>
          {notification.message}
              </div>
      )}
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 dark:border-purple-400"></div>
          </div>
        ) : profileData.uid ? (
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar Navigation */}
            <div className="w-full md:w-64 flex-shrink-0">
              <div className="bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 dark:border-gray-700/50 transition-all duration-300">
                {settingSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3.5 text-left transition-all duration-300
                      ${activeSection === section.id 
                        ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 border-l-4 border-purple-500 dark:border-purple-400 font-medium' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-l-4 border-transparent'}`}
                  >
                    {section.icon}
                    <span>{section.title}</span>
                  </button>
            ))}
          </div>
        </div>

            {/* Main Content */}
            <div className="flex-1">
              <div className="bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 dark:border-gray-700/50 p-6 transition-all duration-300">
                {/* Conditional Rendering Based on Active Section */}
                {activeSection === 'profile' ? (
                  <>
                    {/* Profile Section */}
                    <div className="relative mb-8">
                      <div 
                        className="w-full h-48 rounded-xl overflow-hidden relative"
                        style={{
                          backgroundImage: `url(${bannerImage})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-transparent"></div>
                        
                        {/* Profile Info Section */}
                        <div className="absolute inset-0 flex items-center">
                          <div className="container mx-auto px-8">
                            <div className="flex items-center gap-6">
                              {/* Avatar Section */}
                              <div className="relative shrink-0">
                                <div 
                                  className="w-28 h-28 bg-purple-100 dark:bg-purple-900/50 rounded-xl border-2 border-purple-400 dark:border-purple-500 
                                    flex items-center justify-center overflow-hidden shadow-lg transition-all duration-300 relative cursor-pointer"
                                  onClick={() => document.getElementById('avatar-upload').click()}
                                >
                                  {isImageLoading ? (
                                    <div className="animate-pulse bg-gray-200 dark:bg-gray-700 w-full h-full flex items-center justify-center">
                                      <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                  ) : imageError || !profileData.uid ? (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <svg className="w-10 h-10 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                      </svg>
                                    </div>
                                  ) : (
                                    <img 
                                      src={`${API_BASE_URL}/api/profile/${profileData.uid}/avatar${profileData.avatarUrl.includes('?') ? '' : '?t=' + new Date().getTime()}`}
                                      alt="Profile avatar"
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        console.error('Image failed to load:', e);
                                        setImageError(true);
                                        setIsImageLoading(false);
                                      }}
                                      onLoad={() => {
                                        console.log('Image loaded successfully');
                                        setIsImageLoading(false);
                                        setImageError(false);
                                      }}
                                    />
                                  )}
                                  
                                  <input
                                    id="avatar-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                  />
                                  
                                  {!isViewingOtherProfile && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity duration-200">
                                      <span className="p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
                                        Change Photo
                                      </span>
                                    </div>
                                  )}
                                </div>
                                {selectedFile && (
                                  <div className="mt-2 flex gap-2">
                                    <button
                                      onClick={handleUpload}
                                      className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                                    >
                                      Upload
                                    </button>
                                    <button
                                      onClick={() => {
                                        setSelectedFile(null);
                                        setPreviewUrl('');
                                      }}
                                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                )}
                              </div>

                              {/* Profile Details */}
                              <div className="flex flex-col justify-center gap-3">
                                <div className="flex items-center gap-3">
                                  <h2 className="text-2xl font-bold text-white tracking-wide">
                                    {profileData.displayName || 'Username'}
                                  </h2>
                                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg border border-white/10">
                                    <Globe size={16} className="text-purple-200" />
                                    <span className="text-sm text-purple-100">{profileData.language}</span>
          </div>
        </div>

                  <button
                                  onClick={() => copyToClipboard(profileData.uid)}
                                  className="group flex items-center gap-2 text-sm text-gray-300 bg-white/10 backdrop-blur-sm hover:bg-white/20 
                                    px-3 py-1.5 rounded-lg w-fit transition-all duration-300 border border-white/10"
                                >
                                  <Copy size={14} className={`${copyStatus ? "text-green-400" : ""} transition-all duration-300`} />
                                  <span className="font-mono tracking-wide">UID: {profileData.uid}</span>
                                  <span 
                                    className={`text-xs ${
                                      copyStatus 
                                        ? "opacity-100 translate-x-0" 
                                        : "opacity-0 -translate-x-2"
                                    } transition-all duration-300 text-green-400`}
                                  >
                                    Copied!
                                  </span>
                  </button>

                                <div className="text-sm text-gray-300/90 max-w-md bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/10">
                                  {profileData.bio && profileData.bio.trim() ? (
                                    <div className="whitespace-pre-line">
                                      {profileData.bio}
                                    </div>
                                  ) : (
                                    <span className="text-gray-400">No bio provided</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Upload Status Message */}
                    {uploadStatus.message && (
                      <div className={`mb-6 p-4 rounded-lg ${
                        uploadStatus.type === 'success' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                      } transition-all duration-300`}>
                        {uploadStatus.message}
                      </div>
                    )}

                    {/* Profile Settings Form */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 transition-all duration-300">
                      {isViewingOtherProfile && (
                        <div className="mb-6 p-4 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                          <p className="flex items-center">
                            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            You are viewing {profileData.displayName}'s public profile information.
                          </p>
                        </div>
                      )}
                      <div className="grid gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Display Name</label>
                          <input
                            type="text"
                            value={profileData.displayName}
                            className="w-full p-3 border rounded-lg cursor-not-allowed
                              bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                              border-gray-200 dark:border-gray-600 transition-all duration-300"
                            placeholder="Enter your display name"
                            readOnly
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Language</label>
                          <input
                            type="text"
                            value={profileData.language}
                            className="w-full p-3 border rounded-lg cursor-not-allowed
                              bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                              border-gray-200 dark:border-gray-600 transition-all duration-300"
                            readOnly
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Bio</label>
                          <textarea
                            value={profileData.bio || ''}
                            className="w-full p-3 border rounded-lg cursor-not-allowed
                              bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                              border-gray-200 dark:border-gray-600 transition-all duration-300"
                            rows={4}
                            placeholder="No bio provided"
                            readOnly
                          />
                        </div>

                        {/* Remove reference to disabled functionality */}
                        <div className="flex justify-end mt-4">
                          <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                            Profile information
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  /* Feedback Section */
        <div className="space-y-6">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 transition-all duration-300">
                      <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Submit Feedback</h3>
            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your Feedback
                </label>
                <textarea
                  value={feedbackMessage}
                  onChange={(e) => setFeedbackMessage(e.target.value)}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 
                              bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                              border-gray-200 dark:border-gray-600 transition-all duration-300"
                  rows={4}
                  placeholder="Share your thoughts, suggestions, or report issues..."
                  required
                />
              </div>
              {feedbackStatus === 'success' && (
                          <div className="text-green-600 dark:text-green-400 text-sm">
                  Thank you for your feedback!
                </div>
              )}
              {feedbackStatus === 'error' && (
                          <div className="text-red-600 dark:text-red-400 text-sm">
                  There was an error submitting your feedback. Please try again.
                </div>
              )}
              <button
                type="submit"
                          className="w-full bg-purple-500 dark:bg-purple-600 text-white py-2.5 px-4 rounded-lg 
                            hover:bg-purple-600 dark:hover:bg-purple-700 transition-all duration-300"
              >
                Submit Feedback
                  </button>
            </form>
          </div>

                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 transition-all duration-300">
                      <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Your Feedback History</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Here are all the feedbacks you've submitted:</p>
            {isLoadingFeedbacks ? (
              <div className="flex items-center justify-center h-32">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 dark:border-purple-400"></div>
              </div>
            ) : feedbacks.length > 0 ? (
              <div className="max-h-[400px] overflow-y-auto pr-2 space-y-4">
                {feedbacks.map((feedback, index) => (
                            <div key={index} className="border-b dark:border-gray-700/50 last:border-0 pb-4 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                        Submitted on {new Date(feedback.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                              <p className="text-gray-700 dark:text-gray-300">{feedback.message}</p>
                  </div>
                ))}
              </div>
            ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-4">You haven't submitted any feedback yet.</p>
            )}
          </div>
        </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 bg-white dark:bg-gray-800 rounded-xl p-8 text-center shadow-lg">
            <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-4">Failed to load profile data</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              There was a problem loading your profile information. This might be due to a connection issue.
            </p>
                  <button
              onClick={fetchUserProfile}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
            >
              Retry
                  </button>
          </div>
        )}
      </div>
    </div>
  );
}
  