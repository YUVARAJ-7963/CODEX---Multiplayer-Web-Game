import React, { useState, useEffect } from "react";
import axios from "axios";

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:5000';

const AdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [newPriority, setNewPriority] = useState("normal");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [editingId, setEditingId] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const MAX_TITLE_LENGTH = 100;
  const MAX_MESSAGE_LENGTH = 500;

  useEffect(() => {
    // Set up authentication header
    const token = localStorage.getItem('adminToken');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/announcements/getall');
      setAnnouncements(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch announcements');
      console.error('Error fetching announcements:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('adminToken');
        window.location.href = '/admin/login';
      }
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!newTitle.trim() || !newMessage.trim()) {
      alert("Title and message are required!");
      return false;
    }
    return true;
  };

  const addAnnouncement = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const response = await axios.post('/api/announcements/create', {
        title: newTitle.trim(),
        message: newMessage.trim(),
        priority: newPriority
      });
      setAnnouncements([...announcements, response.data]);
      setNewTitle("");
      setNewMessage("");
      setNewPriority("normal");
      setError(null);
    } catch (err) {
      setError('Failed to add announcement');
      console.error('Error adding announcement:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteAnnouncement = (id) => {
    setDeleteId(id);
    setShowConfirmation(true);
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/announcements/${deleteId}`);
      setAnnouncements(announcements.filter(a => a._id !== deleteId));
      setShowConfirmation(false);
      setDeleteId(null);
      setError(null);
    } catch (err) {
      setError('Failed to delete announcement');
      console.error('Error deleting announcement:', err);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (announcement) => {
    setEditingId(announcement._id);
    setNewTitle(announcement.title);
    setNewMessage(announcement.message);
    setNewPriority(announcement.priority);
  };

  const saveEdit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const response = await axios.put(`/api/announcements/${editingId}`, {
        title: newTitle.trim(),
        message: newMessage.trim(),
        priority: newPriority
      });
      setAnnouncements(announcements.map(a => 
        a._id === editingId ? response.data : a
      ));
      setEditingId(null);
      setNewTitle("");
      setNewMessage("");
      setNewPriority("normal");
      setError(null);
    } catch (err) {
      setError('Failed to update announcement');
      console.error('Error updating announcement:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAnnouncements = announcements
    .filter(a => 
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.message.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => 
      sortOrder === "desc" 
        ? new Date(b.createdAt) - new Date(a.createdAt)
        : new Date(a.createdAt) - new Date(b.createdAt)
    );

  if (loading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Admin Announcements</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Search and Sort Controls */}
      <div className="mb-4 flex gap-4">
        <input
          type="text"
          placeholder="Search announcements..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 rounded flex-1"
        />
        <button 
          onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
          className="bg-gray-200 px-4 py-2 rounded"
        >
          Sort {sortOrder === "desc" ? "↓" : "↑"}
        </button>
      </div>

      {/* Announcements List */}
      <ul className="divide-y divide-gray-200 mb-4">
        {filteredAnnouncements.map(announcement => (
          <li key={announcement._id} className={`py-2 ${
            announcement.priority === 'high' ? 'bg-red-50' : 
            announcement.priority === 'medium' ? 'bg-yellow-50' : ''
          }`}>
            <div className="flex justify-between">
              <h3 className="font-semibold">{announcement.title}</h3>
              <div className="space-x-2">
                <button 
                  onClick={() => startEdit(announcement)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  Edit
                </button>
                <button 
                  onClick={() => deleteAnnouncement(announcement._id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
            <p>{announcement.message}</p>
            <span className="text-sm text-gray-500">
              {new Date(announcement.createdAt).toLocaleDateString()}
            </span>
          </li>
        ))}
      </ul>

      {/* Add/Edit Form */}
      <div className="mt-4 p-4 border rounded">
        <h3 className="font-semibold mb-2">
          {editingId ? 'Edit Announcement' : 'Add New Announcement'}
        </h3>
        <input
          type="text"
          placeholder="Title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value.slice(0, MAX_TITLE_LENGTH))}
          className="border p-2 rounded w-full mb-2"
        />
        <div className="text-sm text-gray-500 mb-2">
          {newTitle.length}/{MAX_TITLE_LENGTH} characters
        </div>
        
        <textarea
          placeholder="Message"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
          className="border p-2 rounded w-full mb-2"
          rows="4"
        />
        <div className="text-sm text-gray-500 mb-2">
          {newMessage.length}/{MAX_MESSAGE_LENGTH} characters
        </div>

        <select
          value={newPriority}
          onChange={(e) => setNewPriority(e.target.value)}
          className="border p-2 rounded mb-4 w-full"
        >
          <option value="normal">Normal Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
        </select>

        <button 
          onClick={editingId ? saveEdit : addAnnouncement}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
        >
          {editingId ? 'Save Changes' : 'Add Announcement'}
        </button>
        {editingId && (
          <button 
            onClick={() => {
              setEditingId(null);
              setNewTitle("");
              setNewMessage("");
              setNewPriority("normal");
            }}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <p className="mb-4">Are you sure you want to delete this announcement?</p>
            <div className="flex justify-end space-x-2">
              <button 
                onClick={() => setShowConfirmation(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAnnouncements;