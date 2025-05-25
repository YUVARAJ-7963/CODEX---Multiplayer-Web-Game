import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";

import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  LineElement, 
  PointElement, 
  ArcElement, 
  RadialLinearScale,
  Title, 
  Tooltip, 
  Legend 
} from "chart.js";
import { FiRefreshCw, FiAlertCircle, FiUsers, FiAward, FiActivity, FiServer, FiHardDrive, FiClock } from "react-icons/fi";
import axios from "axios";
import DashboardCharts from '../components/DashboardCharts';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  LineElement, 
  PointElement, 
  ArcElement, 
  RadialLinearScale,
  Title, 
  Tooltip, 
  Legend
);

const AdminDashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [error, setError] = useState(null);
  const refreshTimeoutRef = useRef(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Wrap defaultStats in useMemo
  const defaultStats = useMemo(() => ({
    totalUsers: "0",
    activeChallenges: "0",
    completionRate: "0%",
    systemStatus: "Unknown"
  }), []);

  const [dashboardData, setDashboardData] = useState({
    activeUsers: {
      labels: [],
      datasets: [{
        label: 'Active Users',
        data: [],
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      }]
    },
    challengesStatus: {
      labels: ['Completed', 'In Progress', 'Not Started'],
      datasets: [{
        data: [0, 0, 0],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(255, 99, 132, 0.6)',
        ],
      }]
    },
    newUsers: {
      labels: [],
      datasets: [{
        label: 'New Users',
        data: [],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }]
    },
    userRoles: {
      labels: ['Admin', 'SuperAdmin', 'User'],
      datasets: [{
        data: [0, 0, 0],
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',  // Admin - Red
          'rgba(153, 102, 255, 0.8)', // SuperAdmin - Purple
          'rgba(54, 162, 235, 0.8)'   // User - Blue
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(54, 162, 235, 1)'
        ],
        borderWidth: 2,
        hoverOffset: 4
      }]
    },
    adminActions: [],
    performanceMetrics: [],
    userEngagement: [],
    systemHealth: {
      cpu: 0,
      memory: 0,
      storage: 0,
      uptime: "0%"
    },
    quickStats: defaultStats
  });

  // Add stats definition using dashboardData
  const stats = dashboardData.quickStats || defaultStats;

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('Please login to view dashboard data');
        return;
      }

      const response = await axios.get(`http://localhost:5000/api/admin/dashboard?timeRange=${timeRange}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const newData = response.data;
      
      // Transform user roles data for the chart
      const transformedUserRoles = {
        labels: ['Admin', 'SuperAdmin', 'User'],
        datasets: [{
          data: [
            newData.userStats.userRoles.Admin || 0,
            newData.userStats.userRoles.SuperAdmin || 0,
            newData.userStats.userRoles.User || 0
          ],
          backgroundColor: [
            'rgba(255, 99, 132, 0.8)',
            'rgba(153, 102, 255, 0.8)',
            'rgba(54, 162, 235, 0.8)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(54, 162, 235, 1)'
          ],
          borderWidth: 2,
          hoverOffset: 4
        }]
      };

      setDashboardData(prevData => ({
        ...prevData,
        ...newData,
        userRoles: transformedUserRoles,
        quickStats: {
          ...defaultStats,
          ...(newData.quickStats || {})
        }
      }));
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      if (error.response?.status === 401) {
        setError('Session expired. Please login again.');
      } else {
        setError('Failed to fetch dashboard data');
      }
    } finally {
      setLoading(false);
    }
  }, [timeRange, defaultStats]);

  // Debounced refresh handler
  const handleRefresh = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    
    refreshTimeoutRef.current = setTimeout(() => {
      setRefreshKey(prev => prev + 1);
      fetchDashboardData();
    }, 500); // 500ms debounce
  }, [fetchDashboardData]);

  useEffect(() => {
    // Initial fetch
    fetchDashboardData();
    
    // Set up interval for background updates (every 15 minutes instead of 5)
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 15 * 60 * 1000);
    
    return () => {
      clearInterval(interval);
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [fetchDashboardData]);

  // Memoize QuickStatCard components
  const MemoizedQuickStatCards = useMemo(() => (
    <>
      <QuickStatCard 
        icon={<FiUsers className="animate-bounce-soft" />}
        title="Total Users"
        value={stats.totalUsers}
        change="+12%"
        isPositive={true}
        className="transition-transform duration-300 hover:scale-105"
      />
      <QuickStatCard 
        icon={<FiAward />}
        title="Active Challenges"
        value={stats.activeChallenges}
        change="+5"
        isPositive={true}
      />
      <QuickStatCard 
        icon={<FiAlertCircle />}
        title="System Status"
        value={stats.systemStatus}
        change="Stable"
        isPositive={true}
      />
    </>
  ), [stats]);

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Dashboard Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Admin Dashboard
          </h2>
          <p className="text-gray-600 mt-1">Welcome back, Administrator</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-full shadow-sm">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
          
          <button 
            onClick={handleRefresh}
            className="p-3 rounded-full bg-white hover:bg-gray-50 shadow-sm transition-all duration-300 hover:scale-105"
            title="Refresh Data"
            disabled={loading}
          >
            <FiRefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md animate-fade-in">
          {error}
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {MemoizedQuickStatCards}
      </div>

      {/* Dashboard Charts */}
      <DashboardCharts 
        key={refreshKey} 
        timeRange={timeRange}
        loading={loading}
      />

      {/* System Health */}
      <div className="bg-white p-8 rounded-xl shadow-lg mb-6 transform hover:scale-[1.01] transition-all duration-300">
        <h3 className="text-2xl font-semibold mb-6 text-gray-800">System Health</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <HealthMetric 
            icon={<FiActivity className="w-6 h-6 text-blue-500" />}
            label="CPU Usage"
            value={dashboardData.systemHealth.cpu}
            max={100}
          />
          <HealthMetric 
            icon={<FiServer className="w-6 h-6 text-green-500" />}
            label="Memory Usage"
            value={dashboardData.systemHealth.memory}
            max={100}
          />
          <HealthMetric 
            icon={<FiHardDrive className="w-6 h-6 text-purple-500" />}
            label="Storage"
            value={dashboardData.systemHealth.storage}
            max={100}
          />
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <FiClock className="w-6 h-6 text-orange-500 mx-auto mb-2" />
            <div className="text-sm text-gray-500">Uptime</div>
            <div className="text-2xl font-bold text-green-500">
              {dashboardData.systemHealth.uptime}
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && <Modal closeModal={() => setIsModalOpen(false)} />}
    </div>
  );
};

const QuickStatCard = ({ icon, title, value, change, isPositive, className }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 bg-blue-50 rounded-lg text-blue-600">{icon}</div>
      <div className={`text-sm font-medium px-3 py-1 rounded-full ${
        isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
      }`}>
        {change}
      </div>
    </div>
    <div className="text-3xl font-bold text-gray-800 mb-2">{value}</div>
    <div className="text-sm text-gray-500">{title}</div>
  </div>
);



const HealthMetric = ({ icon, label, value, max }) => (
  <div className="text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-300">
    <div className="mb-3">{icon}</div>
    <div className="text-sm text-gray-600 mb-2">{label}</div>
    <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
      <div 
        className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ${
          value > 80 ? 'bg-red-500' : value > 60 ? 'bg-yellow-500' : 'bg-green-500'
        }`}
        style={{ width: `${(value / max) * 100}%` }}
      ></div>
    </div>
    <div className="mt-2 text-lg font-semibold text-gray-800">{value}%</div>
  </div>
);

const Modal = ({ closeModal }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
    <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300">
      <h3 className="text-2xl font-bold mb-6 text-gray-800">Modal Title</h3>
      <div className="mb-6 text-gray-600">Modal content goes here...</div>
      <div className="flex justify-end">
        <button
          onClick={closeModal}
          className="px-6 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors duration-300"
        >
          Close
        </button>
      </div>
    </div>
  </div>
);

export default AdminDashboard;
