// achievementController.js

// Imports
const asyncHandler = require('express-async-handler')
const { ACHIEVEMENTS, EVENTS, toPublic } = require('../utils/achievements/definitions.js')
const { unlockForEvent, evaluateBackfill, loadStats } = require('../utils/achievements/evaluate.js')

// Model Imports
const User = require('../models/userModel.js')

// Dev accounts (emails in DEV_ACCOUNT_EMAILS, comma-separated) see every achievement as unlocked
// so the UI can be checked. This only changes what GET /api/achievements returns: nothing is
// stored, and earning achievements works as normal.
const isDevAccount = (user) => {
    const emails = (process.env.DEV_ACCOUNT_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean)
    return emails.includes(String(user.email || '').toLowerCase())
}

/**
 * @desc    List every achievement with the user's unlocks (locked secrets are omitted)
 * @route   GET /api/achievements
 * @access  Private
 */
const getAchievements = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id)

    if (!user) {
        res.status(404)
        throw new Error('User not found')
    }

    // Catch up lifetime-total achievements earned before achievements existed (silent: no celebration)
    await evaluateBackfill(user).catch(e => console.error('Achievement backfill failed:', e.message))
    const fresh = await User.findById(req.user.id)

    const unlockedAt = new Map((fresh.achievements || []).map(a => [a.id, a.unlockedAt]))
    if (isDevAccount(fresh)) {
        for (const a of ACHIEVEMENTS) {
            if (!unlockedAt.has(a.id)) unlockedAt.set(a.id, new Date())
        }
    }
    // Locked secrets are left out entirely so they never reach the client
    const visible = ACHIEVEMENTS.filter(a => !a.secret || unlockedAt.has(a.id))

    // Current lifetime totals, so progress achievements can show a bar
    const ctx = { user: fresh, stats: await loadStats(fresh._id, { muscleFocus: true }) }
    const currentFor = (a) => {
        if (!a.value) return null
        try {
            return Math.round(a.value(ctx))
        } catch (e) {
            return null
        }
    }
    const achievements = visible.map(a => toPublic(a, unlockedAt.get(a.id) || null, currentFor(a)))

    // The number of secrets is itself a spoiler: only reveal it once they have all been found
    const allSecrets = ACHIEVEMENTS.filter(a => a.secret)
    const secretsUnlocked = allSecrets.filter(a => unlockedAt.has(a.id)).length

    res.status(200).json({
        achievements,
        unlocked: unlockedAt.size,
        total: visible.length,
        secrets: {
            unlocked: secretsUnlocked,
            total: secretsUnlocked === allSecrets.length ? allSecrets.length : null
        }
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
