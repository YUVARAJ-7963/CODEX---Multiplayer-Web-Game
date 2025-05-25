import React, { useState, useEffect } from "react";
import axios from "axios";

const UserFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/feedback/all');
        setFeedbacks(response.data.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch feedbacks');
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  useEffect(() => {
    let result = [...feedbacks];
    
    if (searchTerm) {
      result = result.filter(item => 
        item.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      return sortDirection === 'asc' 
        ? new Date(aValue) - new Date(bValue)
        : new Date(bValue) - new Date(aValue);
    });
    
    setFilteredFeedbacks(result);
  }, [feedbacks, searchTerm, sortField, sortDirection]);

  if (loading) return <div className="text-center p-4">Loading...</div>;
  if (error) return <div className="text-center p-4 text-red-500">{error}</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">User Feedback</h2>
      
      {/* Controls */}
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Search feedback..."
          className="px-3 py-2 border rounded-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <select
          value={sortField}
          onChange={(e) => setSortField(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="createdAt">Date</option>
          <option value="username">Username</option>
        </select>
        
        <button
          onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
          className="px-3 py-2 border rounded-md"
        >
          {sortDirection === 'asc' ? '↑' : '↓'}
        </button>
      </div>

      {/* Feedback List */}
      <ul className="divide-y divide-gray-200">
        {filteredFeedbacks
          .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
          .map(feedback => (
            <li key={feedback._id} className="py-4">
              <div>
                <div className="font-semibold">
                  {new Date(feedback.createdAt).toLocaleString()} - {feedback.username}
                </div>
                <div className="text-gray-600">{feedback.message}</div>
                <span className="text-sm text-gray-500">UID: {feedback.uid}</span>
              </div>
            </li>
          ))}
      </ul>

      {/* Pagination */}
      <div className="mt-4 flex justify-center gap-2">
        {Array.from({ length: Math.ceil(filteredFeedbacks.length / itemsPerPage) }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-3 py-1 border rounded-md ${
              currentPage === i + 1 ? 'bg-blue-500 text-white' : ''
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default UserFeedback;