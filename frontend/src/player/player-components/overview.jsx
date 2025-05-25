import React from 'react';
import { motion } from 'framer-motion';
import { Target, Code, Bug, Zap, CodeXml, Play, Activity, Inbox, Sparkles } from 'lucide-react';

const Overview = ({ playerStats }) => {
  const gameStats = [
    {
      title: 'Software Contest',
      icon: <Target className="text-blue-500" />,
      completed: playerStats.contest.completed,
      score: playerStats.contest.score,
      levels: playerStats.completedLevels.contest.length,
      gradient: 'from-blue-500/20 to-blue-600/20',
      border: 'border-blue-500/30',
      glow: 'shadow-[0_0_15px_rgba(59,130,246,0.3)]'
    },
    {
      title: 'Debugging',
      icon: <Bug className="text-red-500" />,
      completed: playerStats.debugging.completed,
      score: playerStats.debugging.score,
      levels: playerStats.completedLevels.debugging.length,
      gradient: 'from-red-500/20 to-red-600/20',
      border: 'border-red-500/30',
      glow: 'shadow-[0_0_15px_rgba(239,68,68,0.3)]'
    },
    {
      title: 'Flash Code',
      icon: <Zap className="text-yellow-500" />,
      completed: playerStats.flashcode.completed,
      score: playerStats.flashcode.score,
      levels: playerStats.completedLevels.flashcode.length,
      gradient: 'from-yellow-500/20 to-yellow-600/20',
      border: 'border-yellow-500/30',
      glow: 'shadow-[0_0_15px_rgba(234,179,8,0.3)]'
    }
  ];

  return (
    <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/30 dark:border-purple-500/20 
      shadow-[0_0_25px_rgba(168,85,247,0.3)] dark:shadow-[0_0_25px_rgba(168,85,247,0.2)] transition-all duration-300">
      <h3 className="text-xl font-bold mb-8 flex items-center gap-3 text-gray-800 dark:text-white">
        <div className="w-12 h-12 rounded-xl bg-purple-500/20 dark:bg-purple-500/10 flex items-center justify-center 
          border border-purple-500/30 dark:border-purple-500/20">
          <Code className="text-purple-400 dark:text-purple-300" />
        </div>
        Game Overview
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {gameStats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className={`bg-gradient-to-br ${stat.gradient} rounded-xl p-6 border ${stat.border} 
              backdrop-blur-sm ${stat.glow} transition-all duration-300 hover:shadow-lg dark:bg-gray-800/50`}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-white/30 dark:bg-black/30 flex items-center justify-center 
                border border-white/10 dark:border-white/5">
                {stat.icon}
              </div>
              <h4 className="font-bold text-lg text-gray-800 dark:text-white">{stat.title}</h4>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Completed</span>
                <span className="font-bold text-gray-800 dark:text-white text-lg">{stat.completed}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Score</span>
                <span className="font-bold text-gray-800 dark:text-white text-lg">{stat.score}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Levels</span>
                <span className="font-bold text-gray-800 dark:text-white text-lg">{stat.levels}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity Section */}
      <div className="mt-12">
        <h4 className="font-bold text-lg mb-6 text-gray-800 dark:text-white flex items-center gap-2">
          <Activity className="text-purple-400 dark:text-purple-300" />
          Recent Activity
        </h4>
        {playerStats.recentActivity && playerStats.recentActivity.length > 0 ? (
          <div className="space-y-4">
            {playerStats.recentActivity.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-white/30 dark:bg-black/20 rounded-xl 
                  border border-purple-500/20 dark:border-purple-500/10 backdrop-blur-sm hover:border-purple-500/40 
                  dark:hover:border-purple-500/20 transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 dark:bg-purple-500/10 flex items-center justify-center 
                    border border-purple-500/30 dark:border-purple-500/20">
                    <Code className="text-purple-400 dark:text-purple-300" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">{activity.activity}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(activity.time).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-purple-400 dark:text-purple-300">
                  <Sparkles size={16} />
                  <span>+{activity.activity.match(/\d+/)?.[0] || 0} XP</span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center p-8 bg-white/30 dark:bg-black/20 rounded-xl 
              border border-purple-500/20 dark:border-purple-500/10 backdrop-blur-sm"
          >
            <div className="w-16 h-16 rounded-full bg-purple-500/10 dark:bg-purple-500/5 flex items-center justify-center 
              border border-purple-500/20 dark:border-purple-500/10 mb-4">
              <Inbox className="w-8 h-8 text-purple-400 dark:text-purple-300" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">No Recent Activity</h3>
            <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm">
              Start coding to see your activity history here. Complete challenges, 
              participate in contests, and track your progress!
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Overview;

export function JoggingCards() {
    return (
      <div className="flex flex-col space-y-4 p-6">
        {/* Daily Jogging Card */}
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="w-60 h-28 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl 
            shadow-lg flex flex-col justify-center items-center text-white border border-purple-400/30"
        >
          <h3 className="text-lg font-semibold flex items-center gap-2">
            Daily Code <CodeXml size={32} />
          </h3>
          <Play size={35} className="bg-white p-1 transition-all rounded-full hover:scale-110 
            text-purple-600 shadow-lg" />
        </motion.div>
        
        {/* My Jogging Card */}
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="w-60 h-60 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl 
            shadow-lg flex flex-col justify-center items-center text-white border border-pink-400/30"
        >
          <h3 className="text-3xl font-semibold">Challenges</h3>
          <span className="text-4xl font-bold my-2">748</span>
          <motion.h1 
            whileHover={{ scale: 1.1 }}
            className="flex font-bold text-2xl hover:scale-110 border border-white/30 p-3 
              rounded-2xl transition-all items-center gap-2"
          >
            More
            <Play size={40} className="bg-white p-1 transition-all rounded-full hover:scale-110 
              text-pink-600 shadow-lg" />
          </motion.h1>
        </motion.div>
      </div>
    );
}