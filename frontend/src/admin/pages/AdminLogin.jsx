import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowLeft } from "react-feather";

// Configure API base URL
const API_BASE_URL = 'http://localhost:5000';

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTimer, setLockoutTimer] = useState(null);
  const navigate = useNavigate();

  // Check for admin token on component mount
  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");
    if (adminToken) {
      navigate("/admin");
      console.log(localStorage.getItem("adminData"));
    }
  }, [navigate]);

  // Background animation configuration
  const stars = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    size: Math.random() * 3 + 1,
    opacity: Math.random() * 0.7 + 0.3,
    duration: Math.random() * 3 + 2,
    delay: Math.random() * 2,
    initialX: Math.random() * window.innerWidth,
    initialY: Math.random() * window.innerHeight,
  }));

  const nebulas = Array.from({ length: 4 }, (_, i) => ({
    id: i + 'nebula',
    size: Math.random() * 500 + 400,
    rotation: Math.random() * 360,
    duration: Math.random() * 30 + 20,
    delay: Math.random() * 4,
    initialX: Math.random() * window.innerWidth,
    initialY: Math.random() * window.innerHeight,
    hue: Math.random() * 60 + 200,
  }));

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const formControls = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: { staggerChildren: 0.2 }
  };

  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Store the token and admin data
      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminData", JSON.stringify(data.admin));
      
      // Store remember me preference
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      // Reset login attempts
      setLoginAttempts(0);
      

      navigate("/admin");
    } catch (err) {
      setError(err.message || "An error occurred during login");
      setLoginAttempts(prev => prev + 1);
      
      if (loginAttempts >= 4) {
        setIsLocked(true);
        const timer = setTimeout(() => {
          setIsLocked(false);
          setLoginAttempts(0);
        }, 300000); // 5 minutes lockout
        setLockoutTimer(timer);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (lockoutTimer) clearTimeout(lockoutTimer);
    };
  }, [lockoutTimer]);

  return (
    <div className="relative flex justify-center items-center h-screen bg-[#0a0a2a] overflow-hidden">
      {/* Animated nebulas */}
      {nebulas.map(nebula => (
        <motion.div
          key={nebula.id}
          className="absolute rounded-full opacity-30"
          style={{
            width: nebula.size,
            height: nebula.size,
            background: `radial-gradient(circle, hsla(${nebula.hue}, 70%, 50%, 0.2) 0%, transparent 70%)`,
          }}
          initial={{ 
            x: nebula.initialX,
            y: nebula.initialY,
            rotate: nebula.rotation,
          }}
          animate={{
            rotate: nebula.rotation + 360,
            scale: [1, 1.3, 1],
            x: [nebula.initialX, nebula.initialX + 200, nebula.initialX],
            y: [nebula.initialY, nebula.initialY + 200, nebula.initialY],
          }}
          transition={{
            duration: nebula.duration,
            repeat: Infinity,
            repeatType: "reverse",
            delay: nebula.delay,
            ease: "easeInOut"
          }}
        />
      ))}

      {/* Animated stars */}
      {stars.map(star => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            width: star.size,
            height: star.size,
            opacity: star.opacity,
          }}
          initial={{ 
            x: star.initialX,
            y: star.initialY,
            scale: 1,
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [star.opacity, star.opacity + 0.3, star.opacity],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            repeatType: "reverse",
            delay: star.delay,
            ease: "easeInOut"
          }}
        />
      ))}

      {/* Back to main site link */}
      <Link
        to="/"
        className="absolute top-4 left-4 text-white flex items-center hover:text-blue-300 transition-colors"
      >
        <ArrowLeft className="mr-2" size={20} />
        Back to Main Site
      </Link>

      {/* Login form container */}
      <motion.div
        className="relative bg-white/80 backdrop-blur-md p-8 rounded-lg shadow-xl w-96"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h2 
          className="text-2xl font-bold text-center mb-6 text-gray-800"
          {...fadeInUp}
        >
          Admin Login
        </motion.h2>

        {error && (
          <motion.p
            className="text-red-500 text-center mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {error}
          </motion.p>
        )}

        <motion.form
          onSubmit={handleLogin}
          variants={formControls}
          initial="initial"
          animate="animate"
        >
          <motion.div variants={fadeInUp}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              required
              disabled={isLoading || isLocked}
            />
          </motion.div>

          <motion.div variants={fadeInUp} className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              required
              disabled={isLoading || isLocked}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-500"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </motion.div>

          <motion.div variants={fadeInUp} className="flex items-center mb-4">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => {
                setRememberMe(e.target.checked);
                if (!e.target.checked) {
                  localStorage.removeItem("rememberedEmail");
                }
              }}
              className="mr-2"
            />
            <label htmlFor="rememberMe" className="text-sm text-gray-600">
              Remember me
            </label>
          </motion.div>

          <motion.button
            type="submit"
            disabled={isLoading || isLocked}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Logging in...
              </span>
            ) : isLocked ? (
              "Account locked. Please try again later."
            ) : (
              "Login"
            )}
          </motion.button>
        </motion.form>

        <motion.div
          variants={fadeInUp}
          className="mt-4 text-center"
        >
          <Link
            to="/admin/forgot-password"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Forgot password?
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
