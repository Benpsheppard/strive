// evaluate.js
// Works out which achievements a user has newly earned and records them.

const mongoose = require('mongoose')
const { ACHIEVEMENTS, BY_ID, EVENTS, toPublic } = require('./definitions.js')

// Time-of-day checks should use the user's clock, not the server's. The app sends its
// timezone offset (minutes, as from Date.getTimezoneOffset()); without one we fall back to UTC.
const toLocal = (date, tzOffset = 0) => {
    const shifted = new Date(date.getTime() - tzOffset * 60 * 1000)
    return {
        hour: shifted.getUTCHours(),
        minute: shifted.getUTCMinutes(),
        month: shifted.getUTCMonth(),
        day: shifted.getUTCDate()
    }
}

// Lifetime totals across all of the user's saved workouts (the current one included)
const loadStats = async (userId) => {
    const Workout = mongoose.model('Workout')
    const [row] = await Workout.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(String(userId)) } },
        {
            $group: {
                _id: null,
                workouts: { $sum: 1 },
                volume: { $sum: { $ifNull: ['$summary.totalWeight', 0] } },
                personalBests: { $sum: { $size: { $ifNull: ['$summary.personalBests', []] } } },
                questsCompleted: { $sum: { $size: { $ifNull: ['$summary.questsCompleted', []] } } }
            }
        }
    ])

    return row || { workouts: 0, volume: 0, personalBests: 0, questsCompleted: 0 }
}

// Records unlocks. $addToSet-style guard in the filter means two racing saves can't add the
// same achievement twice. Returns the ids that were actually added by this call.
const recordUnlocks = async (userId, ids, now = new Date()) => {
    const User = mongoose.model('User')
    const added = []

    for (const id of ids) {
        const res = await User.updateOne(
            { _id: userId, 'achievements.id': { $ne: id } },
            { $push: { achievements: { id, unlockedAt: now } } }
        )
        if (res.modifiedCount > 0) added.push(id)
    }

    return added
}

/**
 * Evaluate workout-based achievements after a workout has been saved and paid out.
 * @returns {Promise<object[]>} public view of the achievements unlocked by this workout
 */
const evaluateWorkoutAchievements = async ({ user, workout, summary, exercises, flags, previousWorkoutAt, tzOffset }) => {
    const unlocked = new Set((user.achievements || []).map(a => a.id))
    const pending = ACHIEVEMENTS.filter(a => a.check && !unlocked.has(a.id))
    if (pending.length === 0) return []

    const ctx = {
        user,
        workout,
        summary,
        exercises,
        flags,
        previousWorkoutAt,
        stats: await loadStats(user._id),
        local: toLocal(workout.createdAt, tzOffset)
    }

    const earned = pending.filter(a => {
        try {
            return a.check(ctx)
        } catch (e) {
            // A broken definition must never block the others
            console.error(`Achievement check failed (${a.id}):`, e.message)
            return false
        }
    })

    const added = await recordUnlocks(user._id, earned.map(a => a.id))
    return added.map(id => toPublic(BY_ID.get(id), new Date()))
}

/**
 * Catch a user up on milestone achievements from their existing history. Only milestones are
 * checked: they depend on lifetime totals, not on a single workout.
 * @returns {Promise<string[]>} ids newly unlocked
 */
const evaluateBackfill = async (user) => {
    const unlocked = new Set((user.achievements || []).map(a => a.id))
    const pending = ACHIEVEMENTS.filter(a => a.category === 'milestone' && !unlocked.has(a.id))
    if (pending.length === 0) return []

    const ctx = { user, stats: await loadStats(user._id) }
    const earned = pending.filter(a => {
        try {
            return a.check(ctx)
        } catch (e) {
            console.error(`Achievement check failed (${a.id}):`, e.message)
            return false
        }
    })

    return recordUnlocks(user._id, earned.map(a => a.id))
}

/**
 * Unlock the achievement tied to an app-reported event.
 * @returns {Promise<object|null>} the unlocked achievement, or null if unknown / already unlocked
 */
const unlockForEvent = async (userId, event) => {
    const id = EVENTS.get(event)
    if (!id) return null

    const [added] = await recordUnlocks(userId, [id])
    return added ? toPublic(BY_ID.get(added), new Date()) : null
}

module.exports = { evaluateWorkoutAchievements, evaluateBackfill, unlockForEvent, loadStats, recordUnlocks, toLocal }
