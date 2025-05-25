import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiHome,
  FiUsers,
  FiAward,
  FiUserPlus,
  FiSettings,
  FiActivity,
  FiMessageSquare,
  FiBell,
  FiLogOut,
} from "react-icons/fi";

const Sidebar = ({ onContentChange }) => {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState("dashboard");

  const menuItems = [
    { id: "dashboard", icon: FiHome, label: "Dashboard" },
    { id: "users", icon: FiUsers, label: "Users" },
    { id: "challenges", icon: FiAward, label: "Challenges" },
    { id: "admin-management", icon: FiUserPlus, label: "Admin Management" },
    { id: "settings", icon: FiSettings, label: "Settings" },

    { id: "feedback", icon: FiMessageSquare, label: "User Feedback" },
    { id: "announcements", icon: FiBell, label: "Announcements" },
  ];

  const handleItemClick = (itemId) => {
    setActiveItem(itemId);
    onContentChange(itemId);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");
    navigate("/admin/login");
  };

  // Animation variants
  const sidebarVariants = {
    hidden: { x: -300, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20
      }
    }
  };

  const menuItemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: (i) => ({
      x: 0,
      opacity: 1,
      transition: {
        delay: i * 0.05,
        type: "spring",
        stiffness: 100,
        damping: 20
      }
    })
  };

  const activeItemVariants = {
    active: {
      scale: 1.02,
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      color: "#fff",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    },
    inactive: {
      scale: 1,
      backgroundColor: "rgba(255, 255, 255, 0)",
      color: "rgba(255, 255, 255, 0.7)",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };

  return (
    <motion.div
      className="w-64 bg-gradient-to-b from-purple-900/80 to-purple-800/80 backdrop-blur-lg shadow-xl"
      initial="hidden"
      animate="visible"
      variants={sidebarVariants}
    >
      <motion.div 
        className="p-4 border-b border-purple-700/30"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-xl font-bold text-white">Admin Panel</h2>
      </motion.div>
      
      <nav className="mt-4">
        <AnimatePresence>
          {menuItems.map((item, index) => (
            <motion.button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              custom={index}
              variants={menuItemVariants}
              initial="hidden"
              animate="visible"
              className="flex items-center w-full px-4 py-3 text-purple-200 hover:text-white hover:bg-purple-700/30 transition-colors"
            >
              <motion.div
                variants={activeItemVariants}
                animate={activeItem === item.id ? "active" : "inactive"}
                className="flex items-center w-full"
              >
                <item.icon className="w-5 h-5 mr-3" />
                <span>{item.label}</span>
              </motion.div>
            </motion.button>
          ))}
        </AnimatePresence>
      </nav>

      <motion.div 
        className="absolute bottom-0 w-64 p-4 border-t border-purple-700/30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <motion.button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FiLogOut className="w-5 h-5 mr-3" />
          <span>Logout</span>
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default Sidebar;