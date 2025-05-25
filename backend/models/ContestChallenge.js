const mongoose = require("mongoose");

const contestChallengeSchema = new mongoose.Schema({
  level: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], required: true },
  points: { type: Number, required: true },
  memoryLimit: { type: Number, required: true }, // in MB
  inputFormat: { type: String, required: true },
  outputFormat: { type: String, required: true },
  testCases: [{
    input: { type: String, required: true },
    output: { type: String, required: true },
    isHidden: { type: Boolean, default: false }
  }],
  solutionFile: { type: String }, // Path to the solution file
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Auto-increment level
contestChallengeSchema.pre('save', async function(next) {
  if (this.isNew) {
    const lastChallenge = await this.constructor.findOne().sort({ level: -1 });
    this.level = lastChallenge ? lastChallenge.level + 1 : 1;
  }
  next();
});

module.exports = mongoose.model("ContestChallenge", contestChallengeSchema); 