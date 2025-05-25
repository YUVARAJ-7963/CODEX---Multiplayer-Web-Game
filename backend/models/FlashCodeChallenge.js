const mongoose = require("mongoose");

const flashCodeChallengeSchema = new mongoose.Schema({
  level: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], required: true },
  points: { type: Number, required: true },
  timeLimit: { type: Number, required: true }, // in seconds
  codeFile: { type: String, required: true }, // Path to the uploaded code file
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Auto-increment level
flashCodeChallengeSchema.pre('save', async function(next) {
  if (this.isNew) {
    const lastChallenge = await this.constructor.findOne().sort({ level: -1 });
    this.level = lastChallenge ? lastChallenge.level + 1 : 1;
  }
  next();
});

module.exports = mongoose.model("FlashCodeChallenge", flashCodeChallengeSchema); 