const mongoose = require("mongoose");

const debuggingChallengeSchema = new mongoose.Schema({
  level: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], required: true },
  points: { type: Number, required: true },
  buggyCode: { type: String, required: true },
  correctCode: { type: String, required: true },
  testCases: [{
    input: { type: String, required: true },
    output: { type: String, required: true },
  }],

  bugDescription: { type: String, required: true },
  solutionExplanation: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Auto-increment level
debuggingChallengeSchema.pre('save', async function(next) {
  if (this.isNew) {
    const lastChallenge = await this.constructor.findOne().sort({ level: -1 });
    this.level = lastChallenge ? lastChallenge.level + 1 : 1;
  }
  next();
});

module.exports = mongoose.model("DebuggingChallenge", debuggingChallengeSchema); 