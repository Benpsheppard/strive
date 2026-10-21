// leaderboard.js

const LeaderboardEntry = require('../models/leaderboardEntryModel')
const Workout = require('../models/workoutModel')
const { getStartOfWeek } = require('./dateFormat')

const updateLeaderboardEntry = async (userId, workout) => {
    const weekStart = getStartOfWeek(workout.createdAt)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 7)
    const workouts = await Workout.find({
        user: userId,
        createdAt: { $gte: weekStart, $lt: weekEnd }
    })
        .select('summary.totalStrivePoints')
        .lean()

    if (workouts.length === 0) {
        await LeaderboardEntry.deleteMany({ user: userId, weekStart })
        return
    }

    const totals = workouts.reduce((sum, currentWorkout) => {
        const points = currentWorkout.summary?.totalStrivePoints || {}
        sum.totalSP += Number(points.total) || 0
        sum.totalVolumeSP += Number(points.volume?.reward) || 0
        sum.totalStrengthSP += Number(points.strength?.reward) || 0
        sum.totalProgressionSP += Number(points.progression?.reward) || 0
        return sum
    }, {
        totalSP: 0,
        totalVolumeSP: 0,
        totalStrengthSP: 0,
        totalProgressionSP: 0
    })

    await LeaderboardEntry.findOneAndUpdate(
        { user: userId, weekStart },
        { $set: { ...totals, workoutCount: workouts.length } },
        {
            upsert: true,
            returnDocument: 'after',
            setDefaultsOnInsert: false
        }
    )
}

module.exports = { updateLeaderboardEntry }
