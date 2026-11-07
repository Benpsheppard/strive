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
        year: shifted.getUTCFullYear(),
        month: shifted.getUTCMonth(),
        day: shifted.getUTCDate()
    }
}

// Lifetime totals across all of the user's saved workouts (the current one included)
// Workouts focused on each muscle group (more than half of the exercises in the group), as
// { Chest: 12, Legs: 3 }. Only computed when an achievement needs it, as it joins to exercises.
const loadMuscleFocus = async (userId) => {
    const Workout = mongoose.model('Workout')
    const rows = await Workout.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(String(userId)) } },
        { $unwind: '$exercises' },
        { $lookup: { from: 'exercises', localField: 'exercises.exercise', foreignField: '_id', as: 'ex' } },
        { $unwind: '$ex' },
        { $group: { _id: { workout: '$_id', group: '$ex.muscleGroup' }, n: { $sum: 1 } } },
        {
            $group: {
                _id: '$_id.workout',
                total: { $sum: '$n' },
                groups: { $push: { group: '$_id.group', n: '$n' } }
            }
        },
        { $unwind: '$groups' },
        { $match: { $expr: { $gt: [{ $multiply: ['$groups.n', 2] }, '$total'] } } },
        { $group: { _id: '$groups.group', count: { $sum: 1 } } }
    ])

    return Object.fromEntries(rows.map(r => [r._id, r.count]))
}

const loadStats = async (userId, { muscleFocus = false } = {}) => {
    const Workout = mongoose.model('Workout')
    const [row] = await Workout.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(String(userId)) } },
        {
            $group: {
                _id: null,
                workouts: { $sum: 1 },
                volume: { $sum: { $ifNull: ['$summary.totalWeight', 0] } },
                personalBests: { $sum: { $size: { $ifNull: ['$summary.personalBests', []] } } },
                questsCompleted: { $sum: { $size: { $ifNull: ['$summary.questsCompleted', []] } } },
                // One array of equipment per workout; flattened below
                equipment: { $addToSet: '$exercises.selectedEquipment' }
            }
        }
    ])

    const { equipment = [], ...totals } = row || { workouts: 0, volume: 0, personalBests: 0, questsCompleted: 0 }
    // Distinct equipment types ever used ('Other' is not a type of equipment worth counting)
    const stats = { ...totals, equipmentTypes: new Set(equipment.flat().filter(e => e && e !== 'Other')).size }
    if (muscleFocus) stats.muscleFocus = await loadMuscleFocus(userId)
    return stats
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

    // Completionist: once everything else is unlocked it is awarded straight away, whichever
    // route (workout, event or backfill) unlocked the last one
    if (added.length > 0) {
        const completion = ACHIEVEMENTS.find(a => a.completion)
        const others = ACHIEVEMENTS.filter(a => !a.completion).map(a => a.id)
        const user = await User.findById(userId).select('achievements.id').lean()
        const have = new Set((user?.achievements || []).map(a => a.id))

        if (completion && !have.has(completion.id) && others.every(id => have.has(id))) {
            const res = await User.updateOne(
                { _id: userId, 'achievements.id': { $ne: completion.id } },
                { $push: { achievements: { id: completion.id, unlockedAt: now } } }
            )
            if (res.modifiedCount > 0) added.push(completion.id)
        }
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
        stats: await loadStats(user._id, { muscleFocus: pending.some(a => a.usesMuscleFocus) }),
        local: toLocal(workout.createdAt, tzOffset),
        // When the account was created, on the user's clock (for the account anniversary)
        accountLocal: user.createdAt ? toLocal(user.createdAt, tzOffset) : null
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
 * Catch a user up on lifetime-total (backfill) achievements from their existing history. Only those are
 * checked: they depend on lifetime totals, not on a single workout.
 * @returns {Promise<string[]>} ids newly unlocked
 */
const evaluateBackfill = async (user) => {
    const unlocked = new Set((user.achievements || []).map(a => a.id))
    const pending = ACHIEVEMENTS.filter(a => a.backfill && !unlocked.has(a.id))
    if (pending.length === 0) return []

    const ctx = { user, stats: await loadStats(user._id, { muscleFocus: pending.some(a => a.usesMuscleFocus) }) }
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
