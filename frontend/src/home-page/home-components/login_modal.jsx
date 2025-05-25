import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import "../home-css/Modal.css";
import { useNavigate } from "react-router-dom";
import {InputOtp} from "@heroui/react";

const SignupForm = ({ switchForm }) => {
  const [showOtp, setShowOtp] = useState(false);
  const [message, setMessage] = useState("");
  const [errormessage, seterrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    otp: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthColors = ['red', 'orange', 'yellow', 'green'];
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];

  const sendOtp = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      seterrorMessage("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:5000/api/send-otp",
        { email: formData.email },
        { withCredentials: true }
      );

      if (res.data.message === "Account already exists...Wait!") {
        seterrorMessage(res.data.message);
        setTimeout(() => {seterrorMessage(""); switchForm();}, 3000);
      } else {
        setMessage(res.data.message);
        seterrorMessage("");

        setTimeout(() => {
          setShowOtp(true);
          setMessage("");
          setFormData((prev) => ({ ...prev, otp: "" })); // Reset OTP field
        }, 3000);
      }
    } catch (error) {
      seterrorMessage("Error sending OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e) => { 
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5000/api/verify-otp",
        {
          username: formData.username, 
          email: formData.email,
          otp: formData.otp,
          password: formData.password,
        },
        { withCredentials: true }
      );

      if (res.data.message === "Invalid OTP or OTP expired") {
        seterrorMessage(res.data.message);
      } else {
        setMessage(res.data.message);
        seterrorMessage("");
        
        // Store user token and UID in localStorage
        if (res.data.token) {
          localStorage.setItem("userToken", res.data.token);
          
          // Store UID if provided by the backend
          if (res.data.UID) {
            localStorage.setItem("userUID", res.data.UID);
            console.log('Stored UID:', res.data.UID);
          }
          
          // Store username for the UIDPopup
          if (formData.username) {
            localStorage.setItem("tempUsername", formData.username);
            console.log('Stored temp username:', formData.username);
          }
          
          // Set isNewSignup flag for new users
          localStorage.setItem("isNewSignup", "true");
          localStorage.setItem("profileCompleted", "false"); // Explicitly set profile as not completed
          console.log('Set isNewSignup flag and profileCompleted flag');
        }

        setTimeout(() => {
          setMessage("");
          setFormData((prev) => ({ ...prev, otp: "" }));
          navigate("/lobby");
        }, 3000);
      }
    } catch (error) {
      seterrorMessage("Server Error");
      setTimeout(() => {
        seterrorMessage("");
      }, 3000);
    }
  };

  const handleBack = () => {
    setShowOtp(false);
    setFormData((prev) => ({ ...prev, otp: "" })); // Clear OTP when going back
  };

  return (
    <div>
      {!showOtp ? (
        <form onSubmit={sendOtp}>
          <input
            required
            type="text"
            name="username"
            placeholder="Username"
            className="w-full border rounded px-3 py-2 mb-2"
            onChange={handleChange}
          />
          <input
            required
            type="email"
            name="email"
            placeholder="Email"
            className="w-full border rounded px-3 py-2 mb-2"
            onChange={handleChange}
          />
          <div className="relative">
            <input
              required
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              className="w-full border rounded px-3 py-2 mb-2"
              onChange={handleChange}
            />
            <button
              type="button"
              className="absolute right-2 top-2 text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          {formData.password && (
            <div className="mb-2">
              <div className="h-2 w-full bg-gray-200 rounded">
                <div
                  className={`h-full rounded transition-all bg-${strengthColors[passwordStrength-1]}-500`}
                  style={{ width: `${passwordStrength * 25}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">
                Password strength: {strengthLabels[passwordStrength-1]}
              </p>
            </div>
          )}
          <input
            required
            type={showPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="Confirm Password"
            className="w-full border rounded px-3 py-2 mb-2"
            onChange={handleChange}
          />
          {message && <p className="text-green-500">{message}</p>}
          {errormessage && <p className="text-red-500">{errormessage}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>
          <button
            type="button"
            className="w-full mt-2 text-blue-500 hover:underline"
            onClick={switchForm}
          >
            Already have an account? Login
          </button>
        </form>
      ) : (
        <form onSubmit={verifyOtp}>
          <center><InputOtp length={4} variant={"bordered"}
            required
          className="text-black"
            name="otp"
            value={formData.otp}
            onChange={handleChange}
          /></center>
          <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
            Verify OTP
          </button>
          {message && <p className="text-green-500">{message}</p>}
          {errormessage && <p className="text-red-500">{errormessage}</p>}
          <center>
            <button
              onClick={sendOtp}
              className="text-blue-500 hover:underline py-1 px-5 mt-3"
            >
              Resend OTP
            </button>
          </center>
          <div className="flex justify-between mt-4">
            <button
              className="text-blue-500 hover:text-white rounded-lg border-black font-bold px-3 py-1 transition-all duration-700 hover:bg-red-400"
              onClick={handleBack}
            >
              Back
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

const LoginForm = ({ switchForm }) => {
  const [message, setMessage] = useState("");
  const [errormessage, seterrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const loginrequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:5000/api/login",
        { email: formData.email, password: formData.password },
        { withCredentials: true }
      );

      if (res.data.message === "Incorrect Password" ) {
        seterrorMessage(res.data.message);
        setTimeout(() => seterrorMessage(""), 3000);
      } 
      else if (res.data.message === "Player not found...Wait!") {
        seterrorMessage(res.data.message);
        setTimeout(() => {seterrorMessage(""); switchForm();}, 3000);
      } 
      else {
        setMessage(res.data.message);
        seterrorMessage("");
        
        // Store user token and UID in localStorage
        if (res.data.token) {
          localStorage.setItem("userToken", res.data.token);
          
          // Store UID if provided by the backend
          if (res.data.UID) {
            localStorage.setItem("userUID", res.data.UID);
            console.log('Stored UID:', res.data.UID);
          }
        }
        
        setTimeout(() => {
          setMessage("");
          navigate("/lobby");
        }, 3000);
      }

      if (rememberMe) {
        localStorage.setItem('rememberedEmail', formData.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
    } catch (error) {
      seterrorMessage("Server Error: " + error.message);
      setTimeout(() => seterrorMessage(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setFormData(prev => ({ ...prev, email: rememberedEmail }));
      setRememberMe(true);
    }
  }, []);

  return (
    <div className="">
      <form onSubmit={loginrequest}>
        <input
          required
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          value={formData.email}
          className="w-full border rounded px-3 py-2 mb-2"
        />
        <div className="relative">
          <input
            required
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            onChange={handleChange}
            value={formData.password}
            className="w-full border rounded px-3 py-2 mb-2 bg-white"
          />
          <button
            type="button"
            className="absolute right-2 top-2 text-gray-500"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        <div className="flex items-center mb-2">
          <input
            type="checkbox"
            id="rememberMe"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="rememberMe" className="text-sm text-gray-600">
            Remember me
          </label>
        </div>
        {message && <p className="text-green-500">{message}</p>}
        {errormessage && <p className="text-red-500">{errormessage}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-[#9d50bb] to-[#6e48aa] hover:brightness-110 text-white font-bold py-2 px-4 rounded"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        <button
          type="button"
          className="w-full mt-2 text-blue-500 hover:underline"
          onClick={switchForm}
        >
          Create an account?
        </button>
      </form>
    </div>
  );
};

const Modal = ({ isOpen, toggleModal }) => {
  const [isSignup, setIsSignup] = useState(true);

  if (!isOpen) return null;

  return createPortal(
    <div className="overlay" onClick={toggleModal}>
      <div className="dialog relative" onClick={(e) => e.stopPropagation()}>
        <button 
          className="absolute top-3 right-3 bg-gray-600 hover:bg-gray-700 text-white font-bold py-1 px-3 rounded"
          onClick={toggleModal}
        >
          ✕
        </button>
        <header className="text-center">
          <h2>{isSignup ? "Signup" : "Login"}</h2>
        </header>
        {isSignup ? (
          <SignupForm switchForm={() => setIsSignup(false)} />
        ) : (
          <LoginForm switchForm={() => setIsSignup(true)} />
        )}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
