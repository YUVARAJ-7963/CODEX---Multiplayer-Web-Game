import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';
import axios from 'axios';
import { FiUsers, FiAward, FiTrendingUp, FiAlertCircle } from 'react-icons/fi';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

const DashboardCharts = ({ timeRange }) => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('adminToken');
        const response = await axios.get(`http://localhost:5000/api/admin/dashboard?timeRange=${timeRange}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDashboardData(response.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return <div>No data available</div>;
  }

  // Common chart options
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart'
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          padding: 20,
          font: {
            size: 12,
            family: "'Inter', sans-serif"
          },
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1a1a1a',
        bodyColor: '#4a4a4a',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.raw || 0;
            return `${label}: ${value}`;
          }
        }
      }
    }
  };

  // User Role Distribution Chart
  const userRoleData = {
    labels: ['Admin', 'SuperAdmin', 'User'],
    datasets: [{
      data: [
        dashboardData.userStats.userRoles.Admin || 0,
        dashboardData.userStats.userRoles.SuperAdmin || 0,
        dashboardData.userStats.userRoles.User || 0
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
      hoverOffset: 4,
      spacing: 5
    }]
  };

  // Challenge Status Chart
  const challengeStatusData = {
    labels: ['Contest', 'Debugging', 'FlashCode'],
    datasets: [{
      data: [
        dashboardData.challengeStats.contestChallenges || 0,
        dashboardData.challengeStats.debuggingChallenges || 0,
        dashboardData.challengeStats.flashcodeChallenges || 0
      ],
      backgroundColor: [
        'rgba(33, 150, 243, 0.8)',
        'rgba(156, 39, 176, 0.8)',
        'rgba(255, 152, 0, 0.8)'
      ],
      borderColor: [
        'rgba(33, 150, 243, 1)',
        'rgba(156, 39, 176, 1)',
        'rgba(255, 152, 0, 1)'
      ],
      borderWidth: 2,
      hoverOffset: 4,
      spacing: 5
    }]
  };

  // Score Distribution Chart
  const scoreDistributionData = {
    labels: ['Contest', 'Debugging', 'FlashCode'],
    datasets: [{
      label: 'Total Scores',
      data: [
        dashboardData.scoreDistribution.contest,
        dashboardData.scoreDistribution.debugging,
        dashboardData.scoreDistribution.flashcode
      ],
      backgroundColor: [
        'rgba(33, 150, 243, 0.8)',
        'rgba(156, 39, 176, 0.8)',
        'rgba(255, 152, 0, 0.8)'
      ],
      borderColor: [
        'rgba(33, 150, 243, 1)',
        'rgba(156, 39, 176, 1)',
        'rgba(255, 152, 0, 1)'
      ],
      borderWidth: 2,
      borderRadius: 8
    }]
  };

  // User Activity Chart
  const userActivityData = {
    labels: dashboardData.userActivity.map(activity => activity.date),
    datasets: [
      {
        label: 'User Feedback',
        data: dashboardData.userActivity.map(activity => activity.feedback),
        borderColor: 'rgba(75, 192, 192, 0.8)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgba(75, 192, 192, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      },
      {
        label: 'Announcements',
        data: dashboardData.userActivity.map(activity => activity.announcements),
        borderColor: 'rgba(153, 102, 255, 0.8)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgba(153, 102, 255, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
      {/* Role Distribution Chart */}
      <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full transform translate-x-16 -translate-y-16 opacity-50"></div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FiUsers className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 ml-3">Role Distribution</h3>
          </div>
          <div className="flex space-x-2">
            {userRoleData.labels.map((label, index) => (
              <div key={label} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-1"
                  style={{ backgroundColor: userRoleData.datasets[0].backgroundColor[index] }}
                ></div>
                <span className="text-sm text-gray-600">{label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative h-64">
          <Doughnut 
            data={userRoleData} 
            options={{
              ...commonOptions,
              cutout: '70%',
              plugins: {
                ...commonOptions.plugins,
                legend: {
                  display: false
                },
                tooltip: {
                  ...commonOptions.plugins.tooltip,
                  callbacks: {
                    label: function(context) {
                      const label = context.label || '';
                      const value = context.raw || 0;
                      const total = context.dataset.data.reduce((a, b) => a + b, 0);
                      const percentage = ((value / total) * 100).toFixed(1);
                      return `${label}: ${value} (${percentage}%)`;
                    }
                  }
                }
              }
            }} 
          />
        </div>
      </div>

      {/* Challenge Status Chart */}
      <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full transform translate-x-16 -translate-y-16 opacity-50"></div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FiAward className="w-6 h-6 text-purple-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 ml-3">Challenge Status</h3>
          </div>
          <div className="flex space-x-2">
            {challengeStatusData.labels.map((label, index) => (
              <div key={label} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-1"
                  style={{ backgroundColor: challengeStatusData.datasets[0].backgroundColor[index] }}
                ></div>
                <span className="text-sm text-gray-600">{label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative h-64">
          <Pie 
            data={challengeStatusData} 
            options={{
              ...commonOptions,
              plugins: {
                ...commonOptions.plugins,
                legend: {
                  display: false
                },
                tooltip: {
                  ...commonOptions.plugins.tooltip,
                  callbacks: {
                    label: function(context) {
                      const label = context.label || '';
                      const value = context.raw || 0;
                      const total = context.dataset.data.reduce((a, b) => a + b, 0);
                      const percentage = ((value / total) * 100).toFixed(1);
                      return `${label}: ${value} (${percentage}%)`;
                    }
                  }
                }
              }
            }} 
          />
        </div>
      </div>

      {/* Score Distribution Chart */}
      <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01]">
        <div className="flex items-center mb-6">
          <FiTrendingUp className="w-6 h-6 text-green-500 mr-2" />
          <h3 className="text-xl font-semibold text-gray-800">Score Distribution</h3>
        </div>
        <div className="h-64">
          <Bar 
            data={scoreDistributionData} 
            options={{
              ...commonOptions,
              scales: {
                y: {
                  beginAtZero: true,
                  grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                  }
                },
                x: {
                  grid: {
                    display: false
                  }
                }
              }
            }} 
          />
        </div>
      </div>

      {/* User Activity Chart */}
      <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01]">
        <div className="flex items-center mb-6">
          <FiAlertCircle className="w-6 h-6 text-orange-500 mr-2" />
          <h3 className="text-xl font-semibold text-gray-800">User Engagement</h3>
        </div>
        <div className="h-64">
          <Line 
            data={userActivityData}
            options={{
              ...commonOptions,
              scales: {
                y: {
                  beginAtZero: true,
                  grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                  }
                },
                x: {
                  grid: {
                    display: false
                  }
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, change, isPositive }) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <div className="flex items-center justify-between mb-2">
      <div className="text-gray-500">{icon}</div>
      <div className={`text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
        {change}
      </div>
    </div>
    <div className="text-2xl font-bold">{value}</div>
    <div className="text-sm text-gray-500">{title}</div>
  </div>
);

export default DashboardCharts; 