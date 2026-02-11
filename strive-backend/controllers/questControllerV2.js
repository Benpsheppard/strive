// questControllerV2.js

// Imports
const asyncHandler = require('express-async-handler')
const Anthropic = require('@anthropic-ai/sdk')

// Model Imports
const Quest = require('../models/questModel')
const User = require('../models/userModel')
const Workout = require('../models/workoutModel')

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const QUEST_CONFIG = {
    daily: { count: 3, expiryDays: 1, reward: 100},
    weekly: { count: 2, expiryDays: 7, reward: 500},
    monthly: { count: 1, expiryDays: 30, reward: 1000}
}

const getExpiryDate = (expiryDays) => {
    const expiry = new Date()

    expiry.setHours(0, 0, 0, 0) // Set to start of the day
    expiry.setDate(expiry.getDate() + expiryDays) // Add the appropriate number of days
    return expiry
}

const genQuests = async (user, duration) => {
    if (!QUEST_CONFIG[duration]) {
        throw new Error(`Invalid quest duration: ${duration}`)
    }
    const { count, expiryDays } = QUEST_CONFIG[duration]

    const recentWorkouts = await Workout.find({ user: user._id })
        .sort({ date: -1 })
        .limit(10)

    if (recentWorkouts.length === 0) {
        throw new Error('No workouts found for this user')
    }

    const summary = recentWorkouts.map(w => ({
        date: w.date,
        exercises: w.exercises.map(e => ({
            name: e.name,
            sets: e.sets
        }))
    }))

    const existingQuests = await Quest.find({ 
        user: user._id, 
        status: 'active', 
        expiry: { $gt: new Date() } 
    })
    const existingExercises = existingQuests.map(q => q.completion.exercise)

    const unitSystem = user.useImperial ? "imperial (lbs)" : "metric (kg)"

    const difficultyGuidelines = {
        daily: "These are short-term goals achievable in one workout session. Set moderate targets - slightly above their recent average.",
        weekly: "These should be more challenging than daily quests. Set targets that require consistent effort over multiple sessions - significantly above their recent average.",
        monthly: "These should be their most ambitious goals. Set targets that push their limits and require progressive training throughout the month - well above their current max."
    }

    const prompt = `You are an AI fitness coach. 
        The user tracks their workouts using the ${unitSystem} system, so anything you generate should reflect that.
        Based on the user's recent workouts, generate EXACTLY ${count} unique, creative ${duration} fitness quest(s).
        The quests should be CHALLENGING but POSSIBLE to complete within the duration of the quest. 
        Do NOT generate multi-day or progressive goals.

        DIFFICULTY LEVEL FOR ${duration.toUpperCase()} QUESTS:
        ${difficultyGuidelines[duration]}

        CRITICAL UNIQUENESS RULES:
        - Each quest MUST target a DIFFERENT exercise
        - Do NOT use any of these exercises that already have active quests: ${existingExercises.join(', ')}
        - All ${count} quests you generate must have different exercises from each other
        - Choose exercises from different muscle groups when possible
        
        CHALLENGE SCALING:
        - Daily: Set reps/weight close to their current performance (5-15% increase)
        - Weekly: Set reps/weight notably higher (20-40% increase from current max)
        - Monthly: Set ambitious targets (50-100% increase from current max)
        
        The quests should be in valid JSON format with these fields:
        {
            "quests": [
                {
                    "title": "string",
                    "duration": "${duration}",
                    "description": "string",
                    "completion": {
                        "exercise": "String",
                        "weight": "Number",
                        "reps": "Number"
                    }
                }
            ]
        }
        
        The "title" should be short (1 - 6 words), creative and inspiring.
        The "description" should be 1 - 2 sentences with a clear objective, follow the same theme to the title and encourage the user to complete the quest. 
        The "description" should outline what the user needs to complete in order to complete the quest.
        The "completion" object must include the exact exercise name.
        The "reps" field within the "completion" object should be between 1 and 12 reps.
        The first letter of each word in the exercise name must be capitalised (e.g. "Bicep Curls", "Leg Press").
        If an exercise contains a hyphen, treat the entire hyphenated term as one word — only the first letter before the hyphen should be capitalised, and the rest remain lowercase (e.g. "T-bar Row", not "T-Bar Row" or "T-Bar row").
        Do not alter or invent exercise names — always use the same capitalization and spelling as shown in the user's workout history.
        Respond ONLY with a valid JSON object (not an array), no extra text. Do NOT include anything other than the outlined fields above. Do NOT include explanations, quotes or notes.

        User workouts: ${JSON.stringify(summary)}

        Remember: 
        1. Each quest must use a DIFFERENT exercise
        2. Exercise names in quests must match exactly with those in the user's workouts
        3. Scale difficulty appropriately for ${duration} duration
        4. Avoid exercises already in active quests: ${existingExercises.join(', ')}    `

    const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 1024,
        temperature: 1.0,
        messages: [
            {
                role: 'user',
                content: prompt
            }
        ]
    })

    let text = response.content[0].text
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/gi, '')
        .replace(/^\s*Here are.*?:/i, '')
        .trim()

    const parsed = JSON.parse(text)

    if (parsed.quests.length !== count  || !Array.isArray(parsed.quests)) {
        throw new Error('AI response missing quests array')
    }

    const questData = parsed.quests.map(q => ({
        user: user._id,
        title: q.title,
        duration: q.duration,
        description: q.description,
        expiry: getExpiryDate(expiryDays),
        completion: {
            exercise: q.completion.exercise,
            weight: q.completion.weight,
            reps: q.completion.reps
        }
    }))

    const savedQuests = await Quest.insertMany(questData)

    return savedQuests
}

/**
 * Generate user's quests
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

    const quests = await genQuests(user, duration)

    res.status(200).json({
        message: `${duration} quests generated!`,
        quests
    })
})

/**
 * Retrieve all the user's quests (with auto-expiry and full refresh)
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

    // Check if we have the right number of active quests for each duration
    const activeDaily = await Quest.countDocuments({ 
        user: userId, 
        duration: 'daily', 
        status: { $in: ['active', 'completed'] },
        expiry: { $gte: now }
    })
    const activeWeekly = await Quest.countDocuments({ 
        user: userId, 
        duration: 'weekly', 
        status: { $in: ['active', 'completed'] },
        expiry: { $gte: now }
    })
    const activeMonthly = await Quest.countDocuments({ 
        user: userId, 
        duration: 'monthly', 
        status: { $in: ['active', 'completed'] },
        expiry: { $gte: now }
    })

    // Generate full set of new quests if we have none (or less than expected) that are not expired
    if (activeDaily === 0) {
        await genQuests(user, 'daily')
    }
    if (activeWeekly === 0) {
        await genQuests(user, 'weekly')
    }
    if (activeMonthly === 0) {
        await genQuests(user, 'monthly')
    }

    // Fetch all non-expired quests
    const quests = await Quest.find({
        user: userId,
        status: { $in: ['active', 'completed'] },
        expiry: { $gte: now }
    }).sort({ expiry: 1 })

    const groupedQuests = {
        daily: quests.filter(q => q.duration === 'daily'),
        weekly: quests.filter(q => q.duration === 'weekly'),
        monthly: quests.filter(q => q.duration === 'monthly')
    }

    res.status(200).json({ quests: groupedQuests })
})

/**
 * Check if quests are completed
 * @route   POST /api/quests/check-completion
 * @access  Private
 */
const checkQuestCompletion = asyncHandler(async (req, res) => {
    const { newWorkout } = req.body // the workout just submitted
    const userId = req.user.id

    const quests = await Quest.find({ user: userId, status: 'active' })
    if (!quests.length) return res.status(200).json({ updatedQuests: [] })

    const updatedQuests = []

    for (const quest of quests) {
        const { exercise, weight, reps } = quest.completion

        const normalizedQuestExercise = exercise.toLowerCase().trim()
        
        const match = newWorkout.exercises.find(e => 
            e.name.toLowerCase().trim() === normalizedQuestExercise
        )
        
        if (!match) continue

        const completed = match.sets.some(s => 
            s.weight >= weight && s.reps >= reps
        )
        
        if (completed) {
            quest.status = 'completed'
            await quest.save()

            updatedQuests.push({ 
                questId: quest._id,
                questName: quest.title,
                completed: true, 
                reward: quest.reward 
            })
        }
    }

    res.status(200).json({ updatedQuests })
})

module.exports = {
    getQuests,
    generateQuests,
    checkQuestCompletion
}