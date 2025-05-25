const express = require("express");
const Admin = require("../models/Admin");
const authMiddleware = require("../middleware/authMiddleware");
const adminController = require('../controllers/adminController');
const auth = require("../middleware/auth");

const router = express.Router();

// Admin Signup (Optional)
router.post("/signup", async (req, res) => { 
  try {
    const { username, email, password } = req.body;

    // Check if admin exists
    let existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) return res.status(400).json({ error: "Admin already exists" });

    // Create admin
    const newAdmin = new Admin({ username, email, password });
    await newAdmin.save();

    // Create audit log for admin creation
    await createAuditLog(
      "create",
      `Created new admin account: ${username}`,
      newAdmin._id
    );

    res.status(201).json({ message: "Admin created successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

// Public routes
router.post('/login', adminController.login);
router.post('/forgot-password', adminController.forgotPassword);
router.post('/reset-password', adminController.resetPassword);

// Protected routes
router.get("/verify-token", auth.authenticateAdmin, adminController.verifyToken);

// User management routes
router.get("/list-user", auth.authenticateAdmin, adminController.getUsers);

// Admin logout
router.post('/logout', adminController.logout);

// Get current admin
router.get('/me', authMiddleware, adminController.getCurrentAdmin);

// Get all admins (protected by super admin)
router.get('/list', authMiddleware, adminController.getAllAdmins);

// Create new admin (protected by super admin)
router.post('/create', authMiddleware, adminController.createAdmin);

// Delete admin (protected by super admin)
router.delete('/:id', authMiddleware, adminController.deleteAdmin);

// Update admin (protected by super admin)
router.put('/:id', authMiddleware, adminController.updateAdmin);

// Dashboard routes
router.get('/dashboard' , adminController.getDashboardData);

// Audit logs endpoint
router.get("/audit-logs", auth.authenticateAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const filter = req.query.filter || "";
    const sortBy = req.query.sortBy || "timestamp";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    const query = filter
      ? { action: { $regex: filter, $options: "i" } }
      : {};

    const totalLogs = await AuditLog.countDocuments(query);
    const totalPages = Math.ceil(totalLogs / limit);

    const logs = await AuditLog.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("adminId", "username email");

    res.json({
      logs,
      totalPages,
      currentPage: page
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    res.status(500).json({ message: "Error fetching audit logs" });
  }
});

module.exports = router;
