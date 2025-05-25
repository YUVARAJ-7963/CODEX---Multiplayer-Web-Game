import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const AdminManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const navigate = useNavigate();
  const [newAdmin, setNewAdmin] = useState({
    username: '',
    email: '',
    password: '',
    role: 'admin',
    isDefault: false
  });

  const fetchAdmins = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:5000/api/admin/list', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 403) {
          setError('You do not have permission to view the admin list');
          setLoading(false);
          return;
        }
        throw new Error('Failed to fetch admins');
      }
      
      const data = await response.json();
      setAdmins(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCurrentAdmin = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin/login');
        return;
      }

      const response = await fetch('http://localhost:5000/api/admin/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('adminToken');
          navigate('/admin/login');
          return;
        }
        throw new Error('Failed to fetch current admin');
      }
      
      const data = await response.json();
      console.log('Current admin data:', data);
      console.log('Admin role:', data.role);
      setCurrentAdmin(data);
      
      // Only fetch admins list if current user is superadmin
      if (data.role === 'superadmin') {
        console.log('User is superadmin, fetching admin list');
        fetchAdmins();
      } else {
        console.log('User is not superadmin, role:', data.role);
        setLoading(false);
      }
    } catch (err) {
      console.error('Error fetching current admin:', err);
      setError('Failed to fetch admin data');
      setLoading(false);
    }
  }, [navigate, fetchAdmins]);

  useEffect(() => {
    fetchCurrentAdmin();
  }, [fetchCurrentAdmin]);

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    
    // Check if current user is super admin
    if (!currentAdmin || currentAdmin.role !== 'superadmin') {
      setError('Only super admin can create new admins');
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:5000/api/admin/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newAdmin)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create admin');
      }

      await fetchAdmins();
      setNewAdmin({ username: '', email: '', password: '', role: 'admin', isDefault: false });
      setSuccess('Admin created successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    // Check if current user is super admin
    if (!currentAdmin || currentAdmin.role !== 'superadmin') {
      setError('Only super admin can delete admins');
      setTimeout(() => setError(null), 3000);
      return;
    }

    // Check if trying to delete default admin
    const adminToDelete = admins.find(admin => admin._id === adminId);
    if (adminToDelete?.isDefault) {
      setError('Cannot delete default admin account');
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (!window.confirm('Are you sure you want to delete this admin?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5000/api/admin/${adminId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete admin');
      }

      await fetchAdmins();
      setSuccess('Admin deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!currentAdmin) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500">Please log in to access this page</div>
      </div>
    );
  }

  if (currentAdmin.role !== 'superadmin') {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-yellow-500">Only super admin can access this page</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-800/50 p-6 rounded-lg">
        <h2 className="text-2xl font-bold text-white mb-4">Add New Admin</h2>
        <form onSubmit={handleAddAdmin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
            <input
              type="text"
              value={newAdmin.username}
              onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={newAdmin.email}
              onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <input
              type="password"
              value={newAdmin.password}
              onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Role</label>
            <select
              value={newAdmin.role}
              onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="admin">Admin</option>
              <option value="superadmin">Super Admin</option>
            </select>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isDefault"
              checked={newAdmin.isDefault}
              onChange={(e) => setNewAdmin({ ...newAdmin, isDefault: e.target.checked })}
              className="w-4 h-4 text-purple-600 bg-gray-700/50 border-gray-600 rounded focus:ring-purple-500"
            />
            <label htmlFor="isDefault" className="ml-2 text-sm font-medium text-gray-300">
              Set as Default Admin
            </label>
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Add Admin
          </button>
        </form>
      </div>

      <div className="bg-gray-800/50 p-6 rounded-lg">
        <h2 className="text-2xl font-bold text-white mb-4">Admin List</h2>
        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-300">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-500/20 border border-green-500 rounded-lg text-green-300">
            {success}
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-300 border-b border-gray-700">
                <th className="pb-3">Username</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <motion.tr
                  key={admin._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-gray-300 border-b border-gray-700"
                >
                  <td className="py-3">{admin.username}</td>
                  <td className="py-3">{admin.email}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      admin.role === 'superadmin' 
                        ? 'bg-purple-500/20 text-purple-300' 
                        : 'bg-blue-500/20 text-blue-300'
                    }`}>
                      {admin.role}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      admin.isDefault 
                        ? 'bg-green-500/20 text-green-300' 
                        : 'bg-gray-500/20 text-gray-300'
                    }`}>
                      {admin.isDefault ? 'Default Admin' : 'Custom Admin'}
                    </span>
                  </td>
                  <td className="py-3">
                    <button
                      onClick={() => handleDeleteAdmin(admin._id)}
                      disabled={admin.isDefault}
                      className={`transition-colors ${
                        admin.isDefault 
                          ? 'text-gray-500 cursor-not-allowed' 
                          : 'text-red-400 hover:text-red-300'
                      }`}
                    >
                      Delete
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminManagement; 