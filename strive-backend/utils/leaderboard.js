// leaderboard.js

// Imports
const LeaderboardEntry = require('../models/leaderboardEntryModel')
const { getStartOfWeek } = require('./dateFormat')

const updateLeaderboardEntry = async (user, workout) => {
    const startOfWeek = getStartOfWeek(workout.createdAt)
    const { total, volume, strength, progression } = workout.summary.totalStrivePoints

    await LeaderboardEntry.findOneAndUpdate(
        {user, weekStart: startOfWeek },
        {
            $inc: {
                totalSP: total,
                totalVolumeSP: volume.reward,
                totalStrengthSP: strength.reward,
                totalProgressionSP: progression.reward
            }
        },
        {
            upsert: true,
            new: true
        }
    )
}

module.exports = { updateLeaderboardEntry }