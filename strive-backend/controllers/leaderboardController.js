// leaderboardController.js

// Model Imports
const LeaderboardEntry = require('../models/leaderboardEntryModel')
const { getStartOfWeek } = require('../utils/dateFormat')

/**
 * @desc    Get all leaderboard entries
 * @route   GET /api/leaderboard
 * @access  Private 
 */
const getLeaderboard = async (req, res) => {
    const { metric = "totalSP" } = req.query

    const weekStart = getStartOfWeek(new Date())

    const leaderboard = await LeaderboardEntry.find({ weekStart })
        .sort({ [metric]: -1 })
        .limit(15)
        .populate("user", "username")

    res.json(leaderboard)
}

module.exports = { getLeaderboard }