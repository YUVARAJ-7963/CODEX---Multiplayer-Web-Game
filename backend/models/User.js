const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  UID: {
    type: String,
    unique: true,
    sparse: true,
    default: function() {
      // Generate a 9-digit UID
      const timestamp = Date.now().toString().slice(-4);
      const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
      return `${timestamp}${random}`;
    }
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  bio: {
    type: String,
    default: "",
    maxlength: 500
  },
  language: {
    type: String,
    default: "English",
    enum: ["English", "Spanish", "French", "German", "Chinese", "Japanese"]
  },
  avatarUrl: {
    type: String,
    default: ""
  },
  profilePrivacy: {
    type: String,
    enum: ["public", "friends", "private"],
    default: "public"
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  role: {
    type: String,
    enum: ['User', 'Admin'],
    default: 'User'
  },
  isRegistered: {
    type: Boolean,
    default: false
  },
  otp: {
    type: String,
    select: false
  },
  otpExpires: {
    type: Date,
    select: false
  },
  lastLogin: {
    type: Date
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  },
  HonorScore: { type: Number, default: 0 },
  GlobalRank: { type: Number, default: 0 },
  Challenges: { 
    completedChallenges: { type: Number, default: 0 },
    completedContestChallenges: { type: Number, default: 0 },
    completedDebuggingChallenges: { type: Number, default: 0 },
    completedFlashCodeChallenges: { type: Number, default: 0 }
  },
  BattleScore: { type: Number, default: 0 },
  ContestCompleted: { type: Number, default: 0 },
  ContestScore: { type: Number, default: 0 },
  DebuggingCompleted:{ type: Number, default: 0 },
  DebuggingScore: { type: Number, default: 0 },
  FlashCodeCompleted: { type: Number, default: 0 },
  FlashCodeScore: { type: Number, default: 0 },
  TotalScore: { type: Number, default: 0 },
  completedLevels: {
    contest: { type: [String], default: [] },
    debugging: { type: [String], default: [] },
    flashcode: { type: [String], default: [] }
  },
  RecentActivity: [{ time: { type: Date }, activity: { type: String } }],
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to generate OTP
userSchema.methods.generateOTP = function() {
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  this.otp = otp;
  this.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  return otp;
};

// Method to verify OTP
userSchema.methods.verifyOTP = function(otp) {
  return this.otp === otp && this.otpExpires > Date.now();
};

const User = mongoose.model("User", userSchema);

module.exports = User;
