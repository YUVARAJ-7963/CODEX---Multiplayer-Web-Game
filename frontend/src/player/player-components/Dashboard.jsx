import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy, Target, 
   Flame, Star
} from "lucide-react";
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, RadialLinearScale, PointElement, LineElement } from 'chart.js';
import { Bar, Doughnut, Radar } from 'react-chartjs-2';
import Overview from "./overview";
import PlayerNameBar from "./Player_name_bar";

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, RadialLinearScale, PointElement, LineElement);

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json'
  }
});

export default function Layout() {
  const [selectedCard] = useState(null);
  const [playerStats, setPlayerStats] = useState({
    honorScore: 0,
    globalRank: 0,
    challenges: {
      total: 0,
      contest: 0,
      debugging: 0,
      flashcode: 0
    },
    battleScore: 0,
    contest: {
      completed: 0,
      score: 0
    },
    debugging: {
      completed: 0,
      score: 0
    },
    flashcode: {
      completed: 0,
      score: 0
    },
    totalScore: 0,
    completedLevels: {
      contest: [],
      debugging: [],
      flashcode: []
    },
    recentActivity: []
  });

  useEffect(() => {
    const fetchPlayerStates = async () => {
      try {
        const token = localStorage.getItem('userToken');
        const uid = localStorage.getItem('userUID');
        
        if (!token || !uid) return;

        const response = await api.get(`/api/player/${uid}/states`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setPlayerStats(response.data);
      } catch (error) {
        console.error('Error fetching player states:', error);
      }
    };

    fetchPlayerStates();
  }, []);

  // Chart data for game scores
  const gameScoresData = {
    labels: ['Software Contest', 'Debugging', 'FlashCode'],
    datasets: [
      {
        label: 'Scores by Game Type',
        data: [
          playerStats.contest.score,
          playerStats.debugging.score,
          playerStats.flashcode.score
        ],
        backgroundColor: [
          'rgba(147, 51, 234, 0.8)', // Purple
          'rgba(236, 72, 153, 0.8)', // Pink
          'rgba(59, 130, 246, 0.8)', // Blue
        ],
        borderColor: [
          'rgba(147, 51, 234, 1)',
          'rgba(236, 72, 153, 1)',
          'rgba(59, 130, 246, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart data for completed challenges
  const challengesData = {
    labels: ['Software Contest', 'Debugging', 'FlashCode'],
    datasets: [
      {
        data: [
          playerStats.contest.completed,
          playerStats.debugging.completed,
          playerStats.flashcode.completed
        ],
        backgroundColor: [
          'rgba(147, 51, 234, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(59, 130, 246, 0.8)',
        ],
        borderColor: [
          'rgba(147, 51, 234, 1)',
          'rgba(236, 72, 153, 1)',
          'rgba(59, 130, 246, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Enhanced chart options with neon effect
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#6B7280',
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text: 'Game Statistics',
        color: '#6B7280',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: '#6B7280',
        },
      },
      x: {
        ticks: {
          color: '#6B7280',
        },
      },
    },
  };

  // Enhanced doughnut chart options
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#6B7280',
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text: 'Completed Levels',
        color: '#6B7280',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
    },
  };

  // Radar chart data for overall performance
  const radarData = {
    labels: ['Software Contest', 'Debugging', 'FlashCode', 'Battle', 'Honor', 'Rank'],
    datasets: [
      {
        label: 'Overall Performance',
        data: [
          playerStats.contest.score / 100,
          playerStats.debugging.score / 100,
          playerStats.flashcode.score / 100,
          playerStats.battleScore / 100,
          playerStats.honorScore / 100,
          (1000 - playerStats.globalRank) / 10
        ],
        backgroundColor: 'rgba(147, 51, 234, 0.2)',
        borderColor: 'rgba(147, 51, 234, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(147, 51, 234, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(147, 51, 234, 1)',
      },
    ],
  };

  // Replace lineData with challengeCompletionData
  const challengeCompletionData = {
    labels: ['Software Contest', 'Debugging', 'FlashCode'],
    datasets: [
      {
        label: 'Completed Challenges',
        data: [
          playerStats.challenges.contest,
          playerStats.challenges.debugging,
          playerStats.challenges.flashcode
        ],
        backgroundColor: [
          'rgba(147, 51, 234, 0.8)', // Purple
          'rgba(236, 72, 153, 0.8)', // Pink
          'rgba(59, 130, 246, 0.8)', // Blue
        ],
        borderColor: [
          'rgba(147, 51, 234, 1)',
          'rgba(236, 72, 153, 1)',
          'rgba(59, 130, 246, 1)',
        ],
        borderWidth: 1,
        borderRadius: 8,
      },
    ],
  };

  // Replace lineOptions with challengeCompletionOptions
  const challengeCompletionOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#6B7280',
          font: { size: 12 },
        },
      },
      title: {
        display: true,
        text: 'Challenge Completion Statistics',
        color: '#6B7280',
        font: { size: 16, weight: 'bold' },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: '#6B7280',
          stepSize: 1,
        },
        grid: {
          color: 'rgba(107, 114, 128, 0.2)',
        },
      },
      x: {
        ticks: {
          color: '#6B7280',
        },
      },
    },
  };

  // Radar chart options
  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#6B7280',
          font: { size: 12 },
        },
      },
      title: {
        display: true,
        text: 'Overall Performance',
        color: '#6B7280',
        font: { size: 16, weight: 'bold' },
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        ticks: {
          color: '#6B7280',
        },
        grid: {
          color: 'rgba(107, 114, 128, 0.2)',
        },
      },
    },
  };

  return (
    <div className="min-h-screen relative bg-gray-50 dark:bg-gray-900 transition-all duration-300">
      {/* Simple accent overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-transparent dark:bg-gray-900 pointer-events-none" />
      
      <div className="relative px-4 md:px-6 lg:px-8 max-w-full">
        <PlayerNameBar Pagename="Dashboard" Search={true} />
        
        {/* Stats Overview Cards with Neon Effect */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8"
        >
          {[
            { 
              title: 'Practice Score', 
              value: playerStats.totalScore, 
              icon: <Star className="text-yellow-400 dark:text-yellow-300" />,
              gradient: 'from-yellow-500/20 to-yellow-600/20 dark:from-yellow-500/30 dark:to-yellow-600/30',
              border: 'border-yellow-500/50 dark:border-yellow-500/30',
              glow: 'shadow-[0_0_15px_rgba(234,179,8,0.5)] dark:shadow-[0_0_15px_rgba(234,179,8,0.3)]'
            },
            { 
              title: 'Global Rank', 
              value: `#${playerStats.globalRank}`, 
              icon: <Trophy className="text-purple-400 dark:text-purple-300" />,
              gradient: 'from-purple-500/20 to-purple-600/20 dark:from-purple-500/30 dark:to-purple-600/30',
              border: 'border-purple-500/50 dark:border-purple-500/30',
              glow: 'shadow-[0_0_15px_rgba(168,85,247,0.5)] dark:shadow-[0_0_15px_rgba(168,85,247,0.3)]'
            },
            { 
              title: 'Challenges', 
              value: playerStats.challenges.total, 
              icon: <Target className="text-green-400 dark:text-green-300" />,
              gradient: 'from-green-500/20 to-green-600/20 dark:from-green-500/30 dark:to-green-600/30',
              border: 'border-green-500/50 dark:border-green-500/30',
              glow: 'shadow-[0_0_15px_rgba(34,197,94,0.5)] dark:shadow-[0_0_15px_rgba(34,197,94,0.3)]'
            },
            { 
              title: 'Battle Score', 
              value: playerStats.battleScore, 
              icon: <Flame className="text-orange-400 dark:text-orange-300" />,
              gradient: 'from-orange-500/20 to-orange-600/20 dark:from-orange-500/30 dark:to-orange-600/30',
              border: 'border-orange-500/50 dark:border-orange-500/30',
              glow: 'shadow-[0_0_15px_rgba(249,115,22,0.5)] dark:shadow-[0_0_15px_rgba(249,115,22,0.3)]'
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              className={`bg-gradient-to-br ${stat.gradient} p-6 rounded-2xl border ${stat.border} 
                backdrop-blur-sm ${stat.glow} transition-all duration-300 hover:shadow-lg dark:bg-gray-800/50`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1 text-gray-800 dark:text-white">{stat.value}</p>
                </div>
                <div className="w-12 h-12 bg-white/30 dark:bg-black/30 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  {stat.icon}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 gap-4 md:gap-8">
          {/* Main Content Area */}
          <div className="space-y-12">
            {/* Charts Section with Neon Effect */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20 dark:border-purple-500/30 shadow-lg shadow-purple-500/10 dark:shadow-purple-500/5 h-[400px]">
                <Bar data={gameScoresData} options={chartOptions} />
              </div>
              <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20 dark:border-purple-500/30 shadow-lg shadow-purple-500/10 dark:shadow-purple-500/5 h-[400px]">
                <Doughnut data={challengesData} options={doughnutOptions} />
              </div>
              <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20 dark:border-purple-500/30 shadow-lg shadow-purple-500/10 dark:shadow-purple-500/5 h-[400px]">
                <Radar data={radarData} options={radarOptions} />
              </div>
              <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20 dark:border-purple-500/30 shadow-lg shadow-purple-500/10 dark:shadow-purple-500/5 h-[400px]">
                <Bar data={challengeCompletionData} options={challengeCompletionOptions} />
              </div>
            </div>

            <Overview playerStats={playerStats} />
          </div>
        </div>
      </div>

      {/* Modal for detailed stats */}
      <AnimatePresence>
        {selectedCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 dark:bg-black/90 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white/30 dark:bg-black/30 rounded-2xl p-8 w-[480px] border border-purple-500/30 dark:border-purple-500/20 
                backdrop-blur-sm shadow-[0_0_25px_rgba(168,85,247,0.5)] dark:shadow-[0_0_25px_rgba(168,85,247,0.3)]"
            >
              {/* Modal content here */}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}




  
