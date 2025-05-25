const User = require('../models/User');

const getLeaderboard = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    const sort = req.query.sort || 'GlobalRank';
    const order = req.query.order === 'ascending' ? 1 : -1;
    const search = req.query.search || '';

    // Build query
    const query = {};
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { UID: { $regex: search, $options: 'i' } }
      ];
    }

    // Get total count for pagination
    const total = await User.countDocuments(query);

    // Get users with sorting and pagination
    let users;
    if (sort === 'honorScore') {
      // For honor score, we need to sort by the sum of TotalScore and BattleScore
      users = await User.aggregate([
        { $match: query },
        { 
          $addFields: {
            calculatedHonorScore: { $add: ['$TotalScore', '$BattleScore'] }
          }
        },
        { $sort: { calculatedHonorScore: order } },
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            username: 1,
            UID: 1,
            TotalScore: 1,
            BattleScore: 1,
            HonorScore: '$calculatedHonorScore',
            GlobalRank: 1,
            Challenges: 1,
            ContestCompleted: 1,
            ContestScore: 1,
            DebuggingCompleted: 1,
            DebuggingScore: 1,
            FlashCodeCompleted: 1,
            FlashCodeScore: 1,
            completedLevels: 1,
            lastLogin: 1,
            createdAt: 1
          }
        }
      ]);
    } else {
      // For other fields, use regular find and sort
      users = await User.find(query)
        .sort({ [sort]: order })
        .skip(skip)
        .limit(limit)
        .select('username UID TotalScore BattleScore HonorScore GlobalRank Challenges ContestCompleted ContestScore DebuggingCompleted DebuggingScore FlashCodeCompleted FlashCodeScore completedLevels lastLogin createdAt');
    }

    // Calculate next page
    const next = skip + limit < total ? page + 1 : null;

    res.json({
      results: users,
      total,
      next,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ message: 'Error fetching leaderboard data' });
  }
};

module.exports = {
  getLeaderboard
}; 