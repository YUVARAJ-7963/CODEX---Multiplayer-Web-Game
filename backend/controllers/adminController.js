const Admin = require('../models/Admin');
const User = require('../models/User');


const { sendEmail } = require('../config/email');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const ContestChallenge = require('../models/ContestChallenge');
const DebuggingChallenge = require('../models/DebuggingChallenge');
const FlashCodeChallenge = require('../models/FlashCodeChallenge');
const Feedback = require('../models/Feedback');
const Announcement = require('../models/Announcement');




const adminController = {
  // Authentication methods
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find admin by email
      const admin = await Admin.findOne({ email });
      if (!admin) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check if account is locked
      if (admin.lockUntil && admin.lockUntil > Date.now()) {
        return res.status(423).json({
          message: 'Account is locked. Please try again later.',
          lockUntil: admin.lockUntil
        });
      }

      // Verify password
      const isMatch = await admin.comparePassword(password);
      if (!isMatch) {
        admin.loginAttempts += 1;
        
        if (admin.loginAttempts >= 5) {
          admin.lockUntil = Date.now() + 15 * 60 * 1000; // 15 minutes
        }
        
        await admin.save();
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Reset login attempts and update last login
      admin.loginAttempts = 0;
      admin.lastLogin = Date.now();
      await admin.save();

      // Generate token
      const token = jwt.sign(
        { id: admin._id, role: admin.role },
        process.env.JWT_SECRET,
        { expiresIn: '2h' }
      );

      res.json({ 
        token, 
        role: admin.role,
        admin: {
          id: admin._id,
          email: admin.email,
          name: admin.username || admin.email.split('@')[0],
          role: admin.role
        },
        message: 'Login successful' 
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  verifyToken: async (req, res) => {
    try {
      // The admin object is already attached by the authenticateAdmin middleware
      if (!req.admin) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Return the admin data without sensitive information
      res.json({
        success: true,
        message: "Token is valid",
        admin: {
          id: req.admin._id,
          email: req.admin.email,
          role: req.admin.role
        }
      });
    } catch (error) {
      console.error("Token verification error:", error);
      res.status(500).json({ message: "Server error during token verification" });
    }
  },

  logout: async (req, res) => {
    try {
      res.clearCookie('adminToken');
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Password reset methods
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;
      const admin = await Admin.findOne({ email });
      
      if (!admin) {
        return res.status(404).json({ message: 'Admin not found' });
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      admin.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
      admin.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

      await admin.save();

      const resetUrl = `${process.env.FRONTEND_URL}/admin/reset-password/${resetToken}`;
      await sendEmail(
        admin.email,
        'Password Reset Request',
        `Click the following link to reset your password: ${resetUrl}`
      );

      res.json({ message: 'Password reset email sent' });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ message: 'Error sending reset email' });
    }
  },

  resetPassword: async (req, res) => {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        return res.status(400).json({ message: 'Token and password are required' });
      }

      const resetPasswordToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

      const admin = await Admin.findOne({
        resetPasswordToken,
        resetPasswordExpires: { $gt: Date.now() }
      });

      if (!admin) {
        // Check if token exists but is expired
        const expiredAdmin = await Admin.findOne({ resetPasswordToken });
        if (expiredAdmin) {
          return res.status(400).json({ message: 'Reset token has expired. Please request a new password reset.' });
        }
        return res.status(400).json({ message: 'Invalid reset token' });
      }

      // Validate password strength
      if (password.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters long' });
      }

      admin.password = password;
      admin.resetPasswordToken = undefined;
      admin.resetPasswordExpires = undefined;
      await admin.save();

      res.json({ message: 'Password reset successful' });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ message: 'Error resetting password' });
    }
  },

  // Profile management methods
  getProfile: async (req, res) => {
    try {
      const admin = await Admin.findById(req.admin.id).select('-password');
      if (!admin) {
        return res.status(404).json({ message: 'Admin not found' });
      }
      res.json(admin);
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ message: 'Error fetching profile' });
    }
  },

  updateProfile: async (req, res) => {
    try {
      const { name, email } = req.body;
      const admin = await Admin.findById(req.admin.id);

      if (!admin) {
        return res.status(404).json({ message: 'Admin not found' });
      }

      admin.name = name;
      admin.email = email;
      await admin.save();

      res.json({ message: 'Profile updated successfully' });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: 'Error updating profile' });
    }
  },

  updatePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const admin = await Admin.findById(req.admin.id);

      if (!admin) {
        return res.status(404).json({ message: 'Admin not found' });
      }

      const isMatch = await admin.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }

      admin.password = newPassword;
      await admin.save();

      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error('Update password error:', error);
      res.status(500).json({ message: 'Error updating password' });
    }
  },

  // User management methods
  getUsers: async (req, res) => {
    try {
      const { role, status, page = 1, limit = 10 } = req.query;
      let query = {};

      if (role && role !== 'all') {
        query.role = role;
      }
      if (status && status !== 'all') {
        query.status = status;
      }

      const users = await User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      const total = await User.countDocuments(query);

      res.json({
        users,
        total,
        pages: Math.ceil(total / limit),
        currentPage: page
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ message: 'Error fetching users' });
    }
  },

  getUserDetails: async (req, res) => {
    try {
      const user = await User.findById(req.params.userId).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      console.error('Get user details error:', error);
      res.status(500).json({ message: 'Error fetching user details' });
    }
  },

  updateUserRole: async (req, res) => {
    try {
      const { userId } = req.params;
      const { role } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      user.role = role;
      await user.save();

      res.json({ message: 'User role updated successfully' });
    } catch (error) {
      console.error('Update user role error:', error);
      res.status(500).json({ message: 'Error updating user role' });
    }
  },

  updateUserStatus: async (req, res) => {
    try {
      const { userId } = req.params;
      const { status } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      user.status = status;
      await user.save();

      res.json({ message: 'User status updated successfully' });
    } catch (error) {
      console.error('Update user status error:', error);
      res.status(500).json({ message: 'Error updating user status' });
    }
  },

  deleteUser: async (req, res) => {
    try {
      const { userId } = req.params;
      
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      await User.findByIdAndDelete(userId);
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ message: 'Error deleting user' });
    }
  },

  // Challenge management methods
  getChallenges: async (req, res) => {
    try {
      const challenges = await Challenge.find()
        .sort({ createdAt: -1 });
      res.json(challenges);
    } catch (error) {
      console.error('Get challenges error:', error);
      res.status(500).json({ message: 'Error fetching challenges' });
    }
  },

  createChallenge: async (req, res) => {
    try {
      const challenge = new Challenge(req.body);
      await challenge.save();
      res.status(201).json(challenge);
    } catch (error) {
      console.error('Create challenge error:', error);
      res.status(500).json({ message: 'Error creating challenge' });
    }
  },

  updateChallenge: async (req, res) => {
    try {
      const challenge = await Challenge.findByIdAndUpdate(
        req.params.challengeId,
        req.body,
        { new: true }
      );
      if (!challenge) {
        return res.status(404).json({ message: 'Challenge not found' });
      }
      res.json(challenge);
    } catch (error) {
      console.error('Update challenge error:', error);
      res.status(500).json({ message: 'Error updating challenge' });
    }
  },

  deleteChallenge: async (req, res) => {
    try {
      const challenge = await Challenge.findByIdAndDelete(req.params.challengeId);
      if (!challenge) {
        return res.status(404).json({ message: 'Challenge not found' });
      }
      res.json({ message: 'Challenge deleted successfully' });
    } catch (error) {
      console.error('Delete challenge error:', error);
      res.status(500).json({ message: 'Error deleting challenge' });
    }
  },

  // Contest management methods
  getContests: async (req, res) => {
    try {
      const contests = await Contest.find()
        .sort({ createdAt: -1 });
      res.json(contests);
    } catch (error) {
      console.error('Get contests error:', error);
      res.status(500).json({ message: 'Error fetching contests' });
    }
  },

  createContest: async (req, res) => {
    try {
      const contest = new Contest(req.body);
      await contest.save();
      res.status(201).json(contest);
    } catch (error) {
      console.error('Create contest error:', error);
      res.status(500).json({ message: 'Error creating contest' });
    }
  },

  updateContest: async (req, res) => {
    try {
      const contest = await Contest.findByIdAndUpdate(
        req.params.contestId,
        req.body,
        { new: true }
      );
      if (!contest) {
        return res.status(404).json({ message: 'Contest not found' });
      }
      res.json(contest);
    } catch (error) {
      console.error('Update contest error:', error);
      res.status(500).json({ message: 'Error updating contest' });
    }
  },

  deleteContest: async (req, res) => {
    try {
      const contest = await Contest.findByIdAndDelete(req.params.contestId);
      if (!contest) {
        return res.status(404).json({ message: 'Contest not found' });
      }
      res.json({ message: 'Contest deleted successfully' });
    } catch (error) {
      console.error('Delete contest error:', error);
      res.status(500).json({ message: 'Error deleting contest' });
    }
  },

  // Get current admin
  getCurrentAdmin: async (req, res) => {
    try {
      const admin = await Admin.findById(req.admin._id).select('-password');
      if (!admin) {
        return res.status(404).json({ message: 'Admin not found' });
      }
      res.json(admin);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Get all admins
  getAllAdmins: async (req, res) => {
    try {
      const admins = await Admin.find().select('-password');
      res.json(admins);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Create new admin
  createAdmin: async (req, res) => {
    try {
      const { username, email, password, role, isDefault } = req.body;

      // Check if admin already exists
      const existingAdmin = await Admin.findOne({ 
        $or: [{ email }, { username }] 
      });

      if (existingAdmin) {
        return res.status(400).json({ 
          message: 'Admin with this email or username already exists' 
        });
      }

      // Create new admin
      const admin = new Admin({
        username,
        email,
        password,
        role,
        isDefault
      });

      await admin.save();

      // Create audit log for admin creation
      await createAuditLog(
        "create",
        `Created new admin account: ${username} with role: ${role}`,
        req.admin._id // The admin who created this new admin
      );

      // Remove password from response
      const adminResponse = admin.toObject();
      delete adminResponse.password;

      res.status(201).json(adminResponse);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Delete admin
  deleteAdmin: async (req, res) => {
    try {
      const adminId = req.params.id;
      
      // Check if admin exists
      const admin = await Admin.findById(adminId);
      if (!admin) {
        return res.status(404).json({ message: 'Admin not found' });
      }

      // Prevent deleting super admin
      if (admin.role === 'superadmin') {
        return res.status(403).json({ message: 'Cannot delete super admin' });
      }

      // Delete the admin
      await Admin.findByIdAndDelete(adminId);
      
      res.json({ message: 'Admin deleted successfully' });
    } catch (error) {
      console.error('Delete admin error:', error);
      res.status(500).json({ message: 'Error deleting admin' });
    }
  },

  // Update admin
  updateAdmin: async (req, res) => {
    try {
      const { username, email, role, isDefault } = req.body;
      const admin = await Admin.findById(req.params.id);

      if (!admin) {
        return res.status(404).json({ message: 'Admin not found' });
      }

      // Update fields
      if (username) admin.username = username;
      if (email) admin.email = email;
      if (role) admin.role = role;
      if (typeof isDefault === 'boolean') admin.isDefault = isDefault;

      await admin.save();

      // Remove password from response
      const adminResponse = admin.toObject();
      delete adminResponse.password;

      res.json(adminResponse);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  getDashboardData: async (req, res) => {
    try {
      const timeRange = req.query.timeRange || 'week';
      const now = new Date();
      let startDate;

      // Calculate start date based on time range
      switch (timeRange) {
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case 'year':
          startDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
        default:
          startDate = new Date(now.setDate(now.getDate() - 7));
      }

      // Get user statistics
      const totalUsers = await User.countDocuments();
      const activeUsers = await User.countDocuments({
        lastLogin: { $gte: startDate }
      });
      const newUsers = await User.countDocuments({
        createdAt: { $gte: startDate }
      });

      // Get user roles distribution
      const adminCount = await Admin.countDocuments({ role: 'admin' });
      const superAdminCount = await Admin.countDocuments({ role: 'superadmin' });
      const userCount = await User.countDocuments({ role: 'User' });

      // Get challenge statistics
      const challengeStats = {
        totalChallenges: await Promise.all([
          ContestChallenge.countDocuments(),
          DebuggingChallenge.countDocuments(),
          FlashCodeChallenge.countDocuments()
        ]).then(([contest, debugging, flashcode]) => contest + debugging + flashcode),
        contestChallenges: await ContestChallenge.countDocuments(),
        debuggingChallenges: await DebuggingChallenge.countDocuments(),
        flashcodeChallenges: await FlashCodeChallenge.countDocuments()
      };

      // Get score distribution
      const scoreDistribution = {
        contest: await User.aggregate([
          { $group: { _id: null, total: { $sum: '$ContestScore' } } }
        ]).then(result => result[0]?.total || 0),
        debugging: await User.aggregate([
          { $group: { _id: null, total: { $sum: '$DebuggingScore' } } }
        ]).then(result => result[0]?.total || 0),
        flashcode: await User.aggregate([
          { $group: { _id: null, total: { $sum: '$FlashCodeScore' } } }
        ]).then(result => result[0]?.total || 0)
      };

      // Get user feedback and announcements data
      const userActivity = await Promise.all([
        Feedback.aggregate([
          {
            $match: {
              createdAt: { $gte: startDate }
            }
          },
          {
            $group: {
              _id: {
                date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                type: 'feedback'
              },
              count: { $sum: 1 }
            }
          }
        ]),
        Announcement.aggregate([
          {
            $match: {
              createdAt: { $gte: startDate }
            }
          },
          {
            $group: {
              _id: {
                date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                type: 'announcements'
              },
              count: { $sum: 1 }
            }
          }
        ])
      ]);

      // Combine feedback and announcements data
      const combinedActivity = userActivity
        .flat()
        .reduce((acc, curr) => {
          const date = curr._id.date;
          if (!acc[date]) {
            acc[date] = { feedback: 0, announcements: 0 };
          }
          if (curr._id.type === 'feedback') {
            acc[date].feedback = curr.count;
          } else {
            acc[date].announcements = curr.count;
          }
          return acc;
        }, {});

      // Fill in missing dates with zeros
      const sortedActivity = [];
      const currentDate = new Date();
      for (let i = 6; i >= 0; i--) {
        const date = new Date(currentDate);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const formattedDate = date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          weekday: 'short'
        });
        sortedActivity.push({
          date: formattedDate,
          feedback: combinedActivity[dateStr]?.feedback || 0,
          announcements: combinedActivity[dateStr]?.announcements || 0
        });
      }

      // Get system health metrics - using more stable values
      const systemHealth = {
        cpu: 45, // Fixed value for CPU usage
        memory: 60, // Fixed value for memory usage
        storage: 35, // Fixed value for storage usage
        uptime: "99.9%"
      };

      res.json({
        userStats: {
          totalUsers,
          activeUsers,
          newUsers,
          userRoles: {
            Admin: adminCount,
            SuperAdmin: superAdminCount,
            User: userCount
          }
        },
        challengeStats,
        scoreDistribution,
        userActivity: sortedActivity,
        systemHealth,
        quickStats: {
          totalUsers: totalUsers.toString(),
          activeChallenges: challengeStats.totalChallenges.toString(),
          completionRate: `${((challengeStats.completedChallenges / challengeStats.totalChallenges) * 100).toFixed(1)}%`,
          systemStatus: "Stable"
        }
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      res.status(500).json({ message: 'Error fetching dashboard data' });
    }
  }
};

module.exports = adminController;