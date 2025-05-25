import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff } from "react-feather";
import { motion } from "framer-motion";
import axios from "axios";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await axios.post("http://localhost:5000/api/admin/reset-password", {
        token,
        password
      });
      setSuccess(true);
      setTimeout(() => navigate("/admin/login"), 3000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to reset password";
      setError(errorMessage);
      
      // If token is expired, provide a link to request a new one
      if (errorMessage.includes("expired")) {
        setError(
          <div>
            {errorMessage}
            <br />
            <Link to="/admin/forgot-password" className="text-blue-500 underline mt-2 inline-block">
              Request a new password reset
            </Link>
          </div>
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex justify-center items-center h-screen bg-[#0a0a2a]">
      <Link
        to="/admin/login"
        className="absolute top-4 left-4 text-white flex items-center hover:text-blue-300 transition-colors"
      >
        <ArrowLeft className="mr-2" size={20} />
        Back to Login
      </Link>

      <motion.div
        className="bg-white/80 backdrop-blur-md p-8 rounded-lg shadow-xl w-96"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Set New Password</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success ? (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            Password successfully reset! Redirecting to login...
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="relative mb-4">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-500"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={isLoading}
            />

            <button
              type="submit"
              className={`w-full ${
                isLoading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
              } text-white p-3 rounded-lg transition-colors`}
              disabled={isLoading}
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default ResetPassword; 