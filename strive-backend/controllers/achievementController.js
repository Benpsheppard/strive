// achievementController.js

// Imports
const asyncHandler = require('express-async-handler')
const { ACHIEVEMENTS, EVENTS, toPublic } = require('../utils/achievements/definitions.js')
const { unlockForEvent, evaluateBackfill } = require('../utils/achievements/evaluate.js')

// Model Imports
const User = require('../models/userModel.js')

/**
 * @desc    List every achievement with the user's unlocks (locked secrets are masked)
 * @route   GET /api/achievements
 * @access  Private
 */
const getAchievements = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id)

    if (!user) {
        res.status(404)
        throw new Error('User not found')
    }

    // Catch up milestones earned before achievements existed (silent: no celebration)
    await evaluateBackfill(user).catch(e => console.error('Achievement backfill failed:', e.message))
    const fresh = await User.findById(req.user.id)

    const unlockedAt = new Map((fresh.achievements || []).map(a => [a.id, a.unlockedAt]))
    const achievements = ACHIEVEMENTS.map(a => toPublic(a, unlockedAt.get(a.id) || null))

    res.status(200).json({
        achievements,
        unlocked: unlockedAt.size,
        total: ACHIEVEMENTS.length
    })
})

/**
 * @desc    Report something the user did in the app (e.g. found an easter egg)
 * @route   POST /api/achievements/event
 * @access  Private
 */
const reportEvent = asyncHandler(async (req, res) => {
    const { event } = req.body || {}

    if (typeof event !== 'string' || !EVENTS.has(event)) {
        res.status(400)
        throw new Error('Unknown event')
    }

    const achievement = await unlockForEvent(req.user.id, event)

    // Already unlocked is fine: the call is safe to repeat
    res.status(200).json({ unlocked: achievement })
})

module.exports = { getAchievements, reportEvent }
