// leaderboardController.js

// Imports
const asyncHandler = require('express-async-handler')

// Model Imports
const LeaderboardEntry = require('../models/leaderboardEntryModel')
const { getStartOfWeek } = require('../utils/dateFormat')

// Fields the leaderboard can be ranked by
const ALLOWED_METRICS = ['totalSP', 'totalVolumeSP', 'totalStrengthSP', 'totalProgressionSP', 'workoutCount']

/**
 * @desc    Get all leaderboard entries
 * @route   GET /api/leaderboard
 * @access  Private 
 */
const getLeaderboard = asyncHandler(async (req, res) => {
    const { metric = 'totalSP' } = req.query

    if (typeof metric !== 'string' || !ALLOWED_METRICS.includes(metric)) {
        res.status(400)
        throw new Error(`Invalid metric. Must be one of: ${ALLOWED_METRICS.join(', ')}`)
    }

    const weekStart = getStartOfWeek(new Date())

    const leaderboard = await LeaderboardEntry.find({ weekStart })
        .sort({ [metric]: -1 })
        .limit(15)
        .populate('user', 'username')

    res.json(leaderboard)
})

module.exports = { getLeaderboard }
