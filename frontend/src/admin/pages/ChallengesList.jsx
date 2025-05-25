import React, { useState, useEffect, useCallback } from "react";
import ChallengeForm from "./ChallengeForm";
import axios from "axios";

const ChallengesList = () => {
  const [challenges, setChallenges] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Contest");
  const [showForm, setShowForm] = useState(false);
  const [editChallenge, setEditChallenge] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("title");
  const [sortDirection, setSortDirection] = useState("asc");
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [challengeToDelete, setChallengeToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState("table"); // "table" or "grid"
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch all challenges from backend
  const fetchChallenges = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`http://localhost:5000/api/challenges/${selectedCategory}`);
      setChallenges(response.data);
    } catch (error) {
      console.error("Error fetching challenges:", error);
      showNotification("Error fetching challenges!", "error");
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  // Add notification helper
  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  };

  // Modified handleSave
  const handleSave = async (challenge) => {
    try {
      setIsLoading(true);
      if (editChallenge) {
        await axios.put(`http://localhost:5000/api/challenges/${selectedCategory}/${editChallenge._id}`, challenge);
        showNotification("Challenge updated successfully!", "success");
      } else {
        await axios.post(`http://localhost:5000/api/challenges/${selectedCategory}`, challenge);
        showNotification("Challenge created successfully!", "success");
      }
      await fetchChallenges(); 
      setShowForm(false);
      setEditChallenge(null);
    } catch (error) {
      console.error(" ving challenge:", error);
      // Only show error notification if there's an actual error response
      if (error.response) {
        showNotification(error.response.data.message || "Error saving challenge!", "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Confirm delete modal
  const DeleteModal = ({ challenge, onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-xl">
        <h3 className="text-xl font-bold mb-4">Confirm Delete</h3>
        <p>Are you sure you want to delete "{challenge.title}"?</p>
        <div className="mt-4 flex justify-end space-x-2">
          <button className="px-4 py-2 bg-gray-300 rounded" onClick={onCancel}>Cancel</button>
          <button className="px-4 py-2 bg-red-500 text-white rounded" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );

  // Modified handleDelete
  const handleDelete = async (id) => {
    try {
      setIsLoading(true);
      await axios.delete(`http://localhost:5000/api/challenges/${selectedCategory}/${id}`);
      showNotification("Challenge deleted successfully!", "success");
      fetchChallenges();
      setShowDeleteModal(false);
      setChallengeToDelete(null);
    } catch (error) {
      showNotification("Error deleting challenge!", "error");
      console.error("Error deleting challenge:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Sort function
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Filter and sort challenges with additional filters
  const filteredAndSortedChallenges = challenges
    .filter(ch => ch.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(ch => selectedDifficulty === "All" ? true : ch.difficulty === selectedDifficulty)
    .sort((a, b) => {
      const direction = sortDirection === "asc" ? 1 : -1;
      return a[sortField] > b[sortField] ? direction : -direction;
    });

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedChallenges.length / itemsPerPage);
  const paginatedChallenges = filteredAndSortedChallenges.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-6">
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 p-4 rounded ${
          notification.type === "success" ? "bg-green-500" : "bg-red-500"
        } text-white`}>
          {notification.message}
        </div>
      )}

      {/* Loading Spinner */}
      {isLoading && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-purple-500">Challenges List</h1>
        <div className="space-x-2">
          <button 
            className={`px-3 py-1 rounded ${viewMode === 'table' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setViewMode('table')}
          >
            Table View
          </button>
          <button 
            className={`px-3 py-1 rounded ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setViewMode('grid')}
          >
            Grid View
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="flex flex-wrap gap-4 mb-4">
        <input
          type="text"
          placeholder="Search challenges..."
          className="border p-2 flex-1"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        
        <select
          className="border p-2"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="Contest">Contest</option>
          <option value="Debugging">Debugging</option>
          <option value="FlashCode">FlashCode</option>
        </select>

        <select
          className="border p-2"
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
        >
          <option value="All">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>

        <select
          className="border p-2"
          value={itemsPerPage}
          onChange={(e) => setItemsPerPage(Number(e.target.value))}
        >
          <option value={5}>5 per page</option>
          <option value={10}>10 per page</option>
          <option value={20}>20 per page</option>
          <option value={50}>50 per page</option>
        </select>
      </div>

      {viewMode === 'table' ? (
        // Table View
        <div className="overflow-x-auto rounded-lg shadow-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("title")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Title</span>
                    {sortField === "title" && (
                      <span className="text-gray-400">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("points")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Points</span>
                    {sortField === "points" && (
                      <span className="text-gray-400">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("difficulty")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Difficulty</span>
                    {sortField === "difficulty" && (
                      <span className="text-gray-400">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedChallenges.map(ch => (
                <tr key={ch._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{ch.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{ch.points}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${ch.difficulty === 'Easy' ? 'bg-green-100 text-green-800' : 
                        ch.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'}`}>
                      {ch.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button 
                      className="text-indigo-600 hover:text-indigo-900 transition-colors"
                      onClick={() => { setEditChallenge(ch); setShowForm(true); }}
                    >
                      Edit
                    </button>
                    <button 
                      className="text-red-600 hover:text-red-900 transition-colors"
                      onClick={() => { setChallengeToDelete(ch); setShowDeleteModal(true); }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        // Grid View
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedChallenges.map(ch => (
            <div 
              key={ch._id} 
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-xl text-gray-800 truncate">{ch.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold
                    ${ch.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                      ch.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'}`}>
                    {ch.difficulty}
                  </span>
                </div>
                
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-gray-700 font-medium">{ch.points} points</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-blue-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                    <span className="text-gray-700 font-medium">{ch.category || selectedCategory}</span>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button 
                    className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                    onClick={() => { setEditChallenge(ch); setShowForm(true); }}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                  <button 
                    className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
                    onClick={() => { setChallengeToDelete(ch); setShowDeleteModal(true); }}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="mt-4 flex justify-between items-center text-white">
        <div>
          Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedChallenges.length)} of {filteredAndSortedChallenges.length} entries
        </div>
        <div className="space-x-2">
          <button
            className="px-3 py-1 border rounded disabled:opacity-50 text-white"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              className={`px-3 py-1 border rounded ${currentPage === i + 1 ? 'bg-blue-500 text-white' : ''}`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && challengeToDelete && (
        <DeleteModal
          challenge={challengeToDelete}
          onConfirm={() => handleDelete(challengeToDelete._id)}
          onCancel={() => {
            setShowDeleteModal(false);
            setChallengeToDelete(null);
          }}
        />
      )}

      {/* Add Challenge Button */}
      <button className="mt-4 bg-green-500 text-white px-4 py-2" onClick={() => { setShowForm(true); setEditChallenge(null); }}>
        Add Challenge
      </button>

      {/* Show Form */}
      {showForm && (
        <ChallengeForm category={selectedCategory} onSave={handleSave} editChallenge={editChallenge} onClose={() => setShowForm(false)} />
      )}
    </div>
  );
};

export default ChallengesList;
