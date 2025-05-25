import React, { useState, useEffect } from "react";
import PlayerNameBar from "./Player_name_bar";
import axios from 'axios';

const App = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/announcements/getall');
        setAnnouncements(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching announcements:', error);
        setError('Failed to fetch announcements');
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case 'normal':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
    }
  };

  const filteredAnnouncements = announcements.filter(announcement => {
    if (filter === 'all') return true;
    return announcement.priority === filter;
  });

  if (loading) {
    return (
      <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-all duration-300">
        <PlayerNameBar Pagename={"Announcements"} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500 dark:text-gray-400">Loading announcements...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-all duration-300">
        <PlayerNameBar Pagename={"Announcements"} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-red-500 dark:text-red-400">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-all duration-300">
      <PlayerNameBar Pagename={"Announcements"} />
      
      <div className="flex-1 max-w-7xl mx-auto w-full p-6">
        {/* Filters */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${filter === 'all' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('high')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${filter === 'high' 
                  ? 'bg-red-500 text-white' 
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
            >
              High Priority
            </button>
            <button
              onClick={() => setFilter('medium')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${filter === 'medium' 
                  ? 'bg-yellow-500 text-white' 
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
            >
              Medium Priority
            </button>
            <button
              onClick={() => setFilter('normal')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${filter === 'normal' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
            >
              Normal Priority
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Announcements List */}
          <div className="bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700/50 transition-all duration-300">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700/50">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Announcements</h2>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {filteredAnnouncements.map((announcement) => (
                <div
                  key={announcement._id}
                  className={`p-6 cursor-pointer transition-colors
                    ${selectedAnnouncement?._id === announcement._id 
                      ? 'bg-blue-50 dark:bg-blue-900/20' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
                  onClick={() => setSelectedAnnouncement(announcement)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{announcement.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(announcement.priority)}`}>
                      {announcement.priority.charAt(0).toUpperCase() + announcement.priority.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{announcement.message}</p>
                  <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
                    <span>Posted by: {announcement.createdBy?.username || 'Admin'}</span>
                    <span>{new Date(announcement.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Announcement Detail */}
          <div className="bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700/50 transition-all duration-300">
            {selectedAnnouncement ? (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{selectedAnnouncement.title}</h2>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedAnnouncement.priority)}`}>
                    {selectedAnnouncement.priority.charAt(0).toUpperCase() + selectedAnnouncement.priority.slice(1)}
                  </span>
                </div>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <p className="text-gray-600 dark:text-gray-300 mb-6">{selectedAnnouncement.message}</p>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mt-8 pt-6 border-t dark:border-gray-700/50">
                  <div>
                    <p>Posted by: <span className="font-medium">{selectedAnnouncement.createdBy?.username || 'Admin'}</span></p>
                  </div>
                  <div className="text-right">
                    <p>Posted on:</p>
                    <p className="font-medium">{new Date(selectedAnnouncement.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
                <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
                <p className="text-lg font-medium">Select an announcement to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
