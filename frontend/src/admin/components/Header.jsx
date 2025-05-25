import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiBell, FiUser } from "react-icons/fi";

const Header = ({ title }) => {
  const [adminData, setAdminData] = useState({
    name: "Admin User",
    email: "admin@example.com"
  });

  useEffect(() => {
    // Get admin data from localStorage
    const storedData = localStorage.getItem("adminData");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setAdminData({
          name: parsedData.name || "Admin User",
          email: parsedData.email || "admin@example.com"
        });
      } catch (error) {
        console.error("Error parsing admin data:", error);
      }
    }
  }, []);

  return (
    <motion.header 
      className="bg-gradient-to-r from-gray-900/80 via-gray-800/80 to-gray-900/80 backdrop-blur-lg border-b border-gray-700/30"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Title */}
          <motion.div
            key={title}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex items-center"
          >
            <motion.h1 
              className="text-2xl font-semibold text-white"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {title}
            </motion.h1>
            <motion.div
              className="ml-2 w-2 h-2 rounded-full bg-blue-400"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [1, 0.8, 1]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>

          {/* Right side - Admin Info and Notifications */}
          <div className="flex items-center space-x-6">
            {/* Admin Info */}
            <motion.div 
              className="flex items-center space-x-3 bg-gray-800/30 px-4 py-2 rounded-lg backdrop-blur-sm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-indigo-600 flex items-center justify-center ring-2 ring-blue-500/30">
                <FiUser className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white">{adminData.name}</span>
                <span className="text-xs text-gray-300">{adminData.email}</span>
              </div>
            </motion.div>

            {/* Notifications */}
            <motion.button 
              className="p-2 rounded-full text-gray-300 hover:text-white hover:bg-gray-700/30 transition-colors relative"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiBell className="h-5 w-5" />
              <motion.span 
                className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-blue-400 ring-2 ring-gray-900"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.8, 1]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;