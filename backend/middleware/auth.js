const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const User = require("../models/User");

const authenticateAdmin = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    console.log("Auth header:", authHeader); // Debug log

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("No token or invalid format"); // Debug log
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    console.log("Token:", token); // Debug log

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded token:", decoded); // Debug log
    } catch (jwtError) {
      console.error("JWT verification error:", jwtError); // Debug log
      if (jwtError.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expired" });
      }
      return res.status(401).json({ message: "Invalid token" });
    }

    // Get admin from database
    const admin = await Admin.findById(decoded.id).select("-password");
    console.log("Found admin:", admin ? "Yes" : "No"); // Debug log

    if (!admin) {
      console.log("Admin not found"); // Debug log
      return res.status(401).json({ message: "Admin not found" });
    }

    // Check if account is locked
    if (admin.isLocked) {
      console.log("Account is locked"); // Debug log
      return res.status(423).json({ message: "Account is locked" });
    }

    // Attach admin to request object
    req.admin = admin;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    if (error.name === "JsonWebTokenError") {
      console.log("Invalid token error"); // Debug log
      return res.status(401).json({ message: "Invalid token" });
    }
    if (error.name === "TokenExpiredError") {
      console.log("Token expired error"); // Debug log
      return res.status(401).json({ message: "Token expired" });
    }
    console.log("Server error during authentication"); // Debug log
    return res.status(500).json({ message: "Server error during authentication" });
  }
};

const authenticateUser = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add user from payload
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = {
  authenticateAdmin,
  authenticateUser
}; 