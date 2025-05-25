const User = require('../models/User');

const getPlayerStats = async (req, res) => {
  try {
    const userId = req.params.uid;
    
    const user = await User.findOne({ UID: userId });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Format the response data
    const playerStats = {
      honorScore: user.HonorScore,
      globalRank: user.GlobalRank,
      challenges: {
        total: user.Challenges.completedChallenges,
        contest: user.Challenges.completedContestChallenges,
        debugging: user.Challenges.completedDebuggingChallenges,
        flashcode: user.Challenges.completedFlashCodeChallenges
      },
      battleScore: user.BattleScore,
      contest: {
        completed: user.ContestCompleted,
        score: user.ContestScore
      },
      debugging: {
        completed: user.DebuggingCompleted,
        score: user.DebuggingScore
      },
      flashcode: {
        completed: user.FlashCodeCompleted,
        score: user.FlashCodeScore
      },
      totalScore: user.TotalScore,
      completedLevels: user.completedLevels,
      recentActivity: user.RecentActivity
    };

    res.json(playerStats);
  } catch (error) {
    console.error('Error fetching player stats:', error);
    res.status(500).json({ message: 'Error fetching player statistics' });
  }
};

module.exports = {
  getPlayerStats
}; 