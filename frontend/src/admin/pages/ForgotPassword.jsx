import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "react-feather";
import { motion } from "framer-motion";
import axios from "axios";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await axios.post("http://localhost:5000/api/admin/forgot-password", { email });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset email");
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
        <h2 className="text-2xl font-bold mb-6 text-center">Reset Password</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success ? (
          <div className="text-center">
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              Password reset instructions have been sent to your email.
            </div>
            <Link
              to="/admin/login"
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              {isLoading ? "Sending..." : "Reset Password"}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword; 