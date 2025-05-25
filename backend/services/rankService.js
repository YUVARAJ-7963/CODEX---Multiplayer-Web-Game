const User = require('../models/User');

class RankService {
  constructor() {
    this.updateInterval = 5 * 60 * 1000; // Update every 5 minutes
    this.isInitialized = false;
  }

  async calculateHonorScore(user) {
    return (user.TotalScore || 0) + (user.BattleScore || 0);
  }

  async updateUserRanks() {
    try {
      console.log('Starting rank update...');
      
      // Get all users
      const users = await User.find({});
      console.log(`Found ${users.length} users to update`);
      
      // Calculate honor scores for all users
      const usersWithHonor = await Promise.all(users.map(async (user) => {
        const honorScore = await this.calculateHonorScore(user);
        return {
          ...user.toObject(),
          calculatedHonorScore: honorScore
        };
      }));

      // Sort users by calculated honor score in descending order
      usersWithHonor.sort((a, b) => b.calculatedHonorScore - a.calculatedHonorScore);

      // Update ranks and honor scores in batches to improve performance
      const batchSize = 50;
      const batches = Math.ceil(usersWithHonor.length / batchSize);

      for (let i = 0; i < batches; i++) {
        const start = i * batchSize;
        const end = Math.min(start + batchSize, usersWithHonor.length);
        const batch = usersWithHonor.slice(start, end);

        await Promise.all(batch.map(async (user, batchIndex) => {
          const globalRank = start + batchIndex + 1;
          await User.findByIdAndUpdate(user._id, {
            HonorScore: user.calculatedHonorScore,
            GlobalRank: globalRank
          });
        }));
      }

      console.log('User ranks updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating user ranks:', error);
      return false;
    }
  }

  startRankUpdate() {
    if (this.isInitialized) {
      console.log('Rank service already initialized');
      return;
    }

    console.log('Starting rank service...');
    
    // Initial update
    this.updateUserRanks();

    // Set up interval for continuous updates
    this.updateIntervalId = setInterval(() => {
      this.updateUserRanks();
    }, this.updateInterval);

    this.isInitialized = true;
    console.log('Rank service started successfully');
  }

  stopRankUpdate() {
    if (this.updateIntervalId) {
      clearInterval(this.updateIntervalId);
      this.isInitialized = false;
      console.log('Rank service stopped');
    }
  }
}

// Create and export a singleton instance
const rankService = new RankService();
module.exports = rankService; 