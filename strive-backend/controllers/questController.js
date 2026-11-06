// questController.js

// Imports
const asyncHandler = require('express-async-handler')
const { genQuests } = require('../utils/quests/generate')
const { QUEST_CONFIG } = require('../utils/quests/config')

// Model Imports
const Quest = require('../models/questModel')
const User = require('../models/userModel')

// Generating a set of quests is slow and costs an AI call. If a second request for the same
// user and duration arrives while one is running (e.g. two quick page loads), share the
// running one instead of creating duplicate quests. This is per server process.
const inFlightGenerations = new Map()

// Remember recent failures so a broken generation isn't retried on every page load
const FAILURE_COOLDOWN_MS = 5 * 60 * 1000
const recentFailures = new Map()

const generateOnce = (user, duration) => {
    const key = `${user._id}:${duration}`

    if (!inFlightGenerations.has(key)) {
        const generation = genQuests(user, duration)
            .finally(() => inFlightGenerations.delete(key))
        inFlightGenerations.set(key, generation)
    }

    return inFlightGenerations.get(key)
}

/**
 * @desc    Generate user's quests
 * @route   POST /api/quests/generate/:duration
 * @access  Private
 */
const generateQuests = asyncHandler(async (req, res) => {
    const { duration } = req.params
    const user = await User.findById(req.user.id)

    if (!user) {
        res.status(404)
        throw new Error('User not found')
    }

    if (!QUEST_CONFIG[duration]) {
        res.status(400)
        throw new Error(`Invalid quest duration: ${duration}`)
    }

    // Quests are rewarded with SP and cost an AI call each, so only allow a new
    // set once the current one for this duration has expired
    const existing = await Quest.countDocuments({
        user: user._id,
        duration,
        status: { $in: ['active', 'completed'] },
        expiry: { $gte: new Date() }
    })
    if (existing > 0) {
        res.status(409)
        throw new Error(`You already have ${duration} quests`)
    }

    try {
        const quests = await generateOnce(user, duration)
        res.status(200).json({ message: `${duration} quests generated!`, quests })
    } catch (error) {
        if (error.message === 'ANTHROPIC_CREDIT_EXHAUSTED') {
            return res.status(502).json({ message: 'Quest generation is currently unavailable' })
        }

        throw error
    }
})

/**
 * @desc    Retrieve all the user's quests (with auto-expiry and full refresh)
 * @route   GET /api/quests
 * @access  Private
 */
const getQuests = asyncHandler(async (req, res) => {
    const userId = req.user.id
    const user = await User.findById(userId)

    if (!user) {
        res.status(404)
        throw new Error('User not found')
    }

    const now = new Date()

    // Mark ALL expired quests (both active and completed) as expired
    await Quest.updateMany(
        { 
            user: userId, 
            status: { $in: ['active', 'completed'] },
            expiry: { $lt: now }
        },
        { status: 'expired' }
    )

    const findCurrentQuests = () => Quest.find({
        user: userId,
        status: { $in: ['active', 'completed'] },
        expiry: { $gte: now }
    }).sort({ expiry: 1 })

    let quests = await findCurrentQuests()

    // Generate a new set for any duration that has none that are not expired
    const missingDurations = Object.keys(QUEST_CONFIG).filter(duration =>
        !quests.some(q => q.duration === duration)
    )

    // Skip durations that failed recently so page loads don't re-trigger model calls
    const retryable = missingDurations.filter(duration => {
        const failedAt = recentFailures.get(`${userId}:${duration}`)
        return !failedAt || Date.now() - failedAt > FAILURE_COOLDOWN_MS
    })

    if (retryable.length > 0) {
        const results = await Promise.allSettled(retryable.map(duration => generateOnce(user, duration)))

        results.forEach((result, i) => {
            if (result.status === 'rejected') {
                recentFailures.set(`${userId}:${retryable[i]}`, Date.now())
                console.error(`Quest generation failed (${retryable[i]}):`, result.reason?.message)
            } else {
                recentFailures.delete(`${userId}:${retryable[i]}`)
            }
        })

        quests = await findCurrentQuests()
    }

    const groupedQuests = {
        daily: quests.filter(q => q.duration === 'daily'),
        weekly: quests.filter(q => q.duration === 'weekly'),
        monthly: quests.filter(q => q.duration === 'monthly')
    }

    res.status(200).json({ quests: groupedQuests })
})

module.exports = {
    getQuests,
    generateQuests
}