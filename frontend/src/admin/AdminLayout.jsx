import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import StarsBackground from "./components/StarsBackground";

// Import pages
import AdminDashboard from "./pages/AdminDashboard";
import UsersList from "./pages/UsersList";
import ChallengesList from "./pages/ChallengesList";

import AdminManagement from "./pages/AdminManagement";
import AdminSettings from "./pages/AdminSettings"; 

import UserFeedback from "./pages/UserFeedback";
import AdminAnnouncements from "./pages/AdminAnnouncements";
import AdminProfile from "./pages/AdminProfile";

const AdminLayout = () => {
  const [currentContent, setCurrentContent] = useState("dashboard");
  const [pageTitle, setPageTitle] = useState("Dashboard");
  const [adminData, setAdminData] = useState(null);

  useEffect(() => {
    // Get admin data from localStorage
    const storedData = localStorage.getItem("adminData");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setAdminData(parsedData);
      } catch (error) {
        console.error("Error parsing admin data:", error);
      }
    }
  }, []);

  const getPageTitle = (content) => {
    const titles = {
      dashboard: "Dashboard",
      users: "Users Management",
      challenges: "Challenges",
      contests: "Contests",
      "admin-management": "Admin Management",
      profile: "Profile",
      settings: "Settings",
      "audit-logs": "Audit Logs",
      feedback: "User Feedback",
      announcements: "Announcements"
    };
    return titles[content] || "Dashboard";
  };

  const handleContentChange = (content) => {
    setCurrentContent(content);
    setPageTitle(getPageTitle(content));
  };

  const renderContent = () => {
    switch (currentContent) {
      case "dashboard":
        return <AdminDashboard />;
      case "users":
        return <UsersList />;
      case "challenges":
        return <ChallengesList />; 

      case "admin-management":
        return <AdminManagement />;
      case "profile":
        return <AdminProfile />;
      case "settings":
        return <AdminSettings />;

      case "feedback":
        return <UserFeedback />;
      case "announcements":
        return <AdminAnnouncements />;
      default:
        return <AdminDashboard />;
    }
  };

  // Page transition variants
  const pageVariants = {
    initial: {
      opacity: 0,
      x: 20,
      scale: 0.98
    },
    animate: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20
      }
    },
    exit: {
      opacity: 0,
      x: -20,
      scale: 0.98
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative">
      {/* Stars Background */}
      <StarsBackground />
      
      {/* Static Sidebar */}
      <Sidebar onContentChange={handleContentChange} />
      
      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header with dynamic title */}
        <Header title={pageTitle} adminData={adminData} />
        
        {/* Dynamic Main Content with transitions */}
        <main className="flex-1 overflow-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentContent}
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              className="bg-gray-800/30 backdrop-blur-lg rounded-xl shadow-xl p-6 border border-gray-700/30"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;