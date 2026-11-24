// integrationController.js
// Gives my other apps (Life) a read-only summary of my workouts

// Imports
const asyncHandler = require('express-async-handler')
const User = require('../models/userModel.js')
const Workout = require('../models/workoutModel.js')

// Most workouts sent in one go (the caller asks again for the rest)
const PAGE_SIZE = 50

// Turns a saved workout into the few details the other app needs
const toSummary = (workout) => ({
    id: String(workout._id),
    title: workout.title,
    // When the workout was done
    finishedAt: workout.date,
    // When Strive saved it. Never goes backwards, so the other app uses it to pick up where it left off.
    savedAt: workout.createdAt,
    // False when the workout was too small to earn Strive points
    countsAsWorkout: !workout.summary?.noSPReason,
    personalBests: workout.summary?.personalBests?.length || 0,
    questsCompleted: workout.summary?.questsCompleted?.length || 0,
    strivePoints: workout.summary?.totalStrivePoints?.total || 0
})

/**
 * @desc Get summaries of my workouts saved after a moment in time, oldest first
 * @route GET /api/integrations/life/workouts?since=2026-01-01T00:00:00.000Z
 * @access Private (integration key)
 */
const getWorkoutSummaries = asyncHandler(async (req, res) => {
    // Always asked for explicitly, so the whole history is never sent by accident
    const since = new Date(req.query.since)

    if (!req.query.since || Number.isNaN(since.getTime())) {
        res.status(400)
        throw new Error('since must be a valid date')
    }

    const owner = await User.findOne({ email: String(process.env.LIFE_USER_EMAIL).trim().toLowerCase() }).select('_id')

    if (!owner) {
        res.status(404)
        throw new Error('No Strive account for that email')
    }

    // One extra, to know whether there are more
    const workouts = await Workout.find({ user: owner._id, createdAt: { $gt: since } })
        .sort({ createdAt: 1 })
        .limit(PAGE_SIZE + 1)
        .lean()

    res.status(200).json({
        workouts: workouts.slice(0, PAGE_SIZE).map(toSummary),
        hasMore: workouts.length > PAGE_SIZE
    })
})

module.exports = { getWorkoutSummaries, toSummary }
