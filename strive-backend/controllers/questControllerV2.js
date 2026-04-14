// questControllerV2.js

// Imports
const asyncHandler = require('express-async-handler')
const Anthropic = require('@anthropic-ai/sdk')

// Model Imports
const Quest = require('../models/questModel')
const User = require('../models/userModel')
const Workout = require('../models/workoutModel')

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const QUEST_TYPE_DISTRIBUTION = {
    daily: ['strength', 'consistency', 'strength'],
    weekly: ['progressive', 'volume'],
    monthly: ['consistency']
}

const QUEST_CONFIG = {
    daily: { count: 3, expiryDays: 1, reward: 100},
    weekly: { count: 2, expiryDays: 7, reward: 500},
    monthly: { count: 1, expiryDays: 30, reward: 1000}
}

const QUEST_TYPE_PROMPTS = {
    strength: {
        description: `A single-session strength goal. The user must hit a specific weight x reps in one workout.`,
        completionSchema: `{
            "exercise": "string (exact name from workout history)",
            "weight": number,
            "reps": number (1-12)
        }`,
        extraRules: `Follow the progressive overload rules strictly. Pick an exercise from their history.`
    },
    consistency: {
        description: `A consistency goal. The user must complete a certain number of workouts within the quest window, optionally filtered to a muscle group or exercise.`,
        completionSchema: `{
            "targetCount": number (how many workouts, e.g. 3),
            "currentCount": 0,
            "filterTag": "string or null (must exactly match one exercise name OR one muscleGroup from workout history, or null)"
        }`,
        extraRules: `
            targetCount should be realistic for the duration: daily=1, weekly=2-4, monthly=8-12. 
            If you use a filterTag, it must match an exercise name or muscle group from their history.
            Use only exact tags already present in workout history.
            Allowed filterTag values are:
            - exact exercise names from workout history
            - exact muscleGroup values from workout history

            Never invent broader categories like:
            "upper body", "lower body", "push", "pull", "arms", "full body"

            If unsure, use null.`
    },
    volume: {
        description: `A total volume goal. The user must lift a cumulative amount of weight (kg or lbs) across one or more sessions, optionally for a specific muscle group.`,
        completionSchema: `{
            "targetVolume": number (total kg/lbs to lift),
            "currentVolume": 0,
            "filterTag": "string or null (must exactly match one exercise name OR one muscleGroup from workout history, e.g. 'Bench Press', 'Chest', 'Back', 'Legs', or null)"
        }`,
        extraRules: `
        Calculate a realistic targetVolume by looking at their recent session volumes for that muscle group. 
        Weekly targets should be achievable across 2-3 sessions.
        Use only exact tags already present in workout history.
        Allowed filterTag values are:
        - exact exercise names from workout history
        - exact muscleGroup values from workout history

        Never invent broader categories like:
        "upper body", "lower body", "push", "pull", "arms", "full body"

        If unsure, use null.`
    },
    progressive: {
        description: `A personal best goal. The user must beat their current best for a specific metric on a chosen exercise.`,
        completionSchema: `{
            "exercise": "string (exact name from workout history)",
            "metric": "max_weight" | "max_reps" | "session_volume",
            "baseline": number (their current best value for this metric)
        }`,
        extraRules: `Analyse their history to determine the actual current baseline. Choose metric based on what makes sense for the exercise and their recent pattern.`
    }
}

const getExpiryDate = (expiryDays) => {
    const expiry = new Date()

    expiry.setHours(0, 0, 0, 0) // Set to start of the day
    expiry.setDate(expiry.getDate() + expiryDays) // Add the appropriate number of days
    return expiry
}

/**
 * Validate a quest completion object against actual workout history
 * Returns true if valid, false otherwise
 */
const validateQuestCompletion = (quest, validExerciseNames, validMuscleGroups) => {
    const { questType, completion } = quest

    // Strength & Progressive quests must have a valid exercise
    if (questType === 'strength' || questType === 'progressive') {
        if (!completion.exercise || typeof completion.exercise !== 'string') {
            return false
        }
        if (!validExerciseNames.has(completion.exercise)) {
            return false
        }
    }

    // Consistency & Volume quests may have a filterTag that must be valid
    if (questType === 'consistency' || questType === 'volume') {
        if (completion.filterTag) {
            const tag = completion.filterTag
            const isValidExercise = validExerciseNames.has(tag)
            const isValidMuscleGroup = validMuscleGroups.has(tag)
            if (!isValidExercise && !isValidMuscleGroup) {
                return false
            }
        }
    }

    return true
}

const genQuests = async (user, duration) => {
    if (!QUEST_CONFIG[duration]) throw new Error(`Invalid quest duration: ${duration}`)
    
    const { count, expiryDays } = QUEST_CONFIG[duration]
    const assignedTypes = QUEST_TYPE_DISTRIBUTION[duration]  // e.g. ['strength', 'consistency', 'strength']

    const recentWorkouts = await Workout.find({ user: user._id })
        .sort({ date: -1 })
        .limit(10)
        .populate('exercises.exercise')

    if (recentWorkouts.length === 0) {
        throw new Error('No workouts found for this user')
    }

    // Build a set of valid exercise names and muscle groups for validation
    const validExerciseNames = new Set()
    const validMuscleGroups = new Set()
    recentWorkouts.forEach(w => {
        w.exercises.forEach(ex => {
            const exerciseData = ex.exercise
            if (!exerciseData || typeof exerciseData !== 'object') {
                return
            }

            validExerciseNames.add(exerciseData.name)
            if (exerciseData.muscleGroup) {
                validMuscleGroups.add(exerciseData.muscleGroup)
            }
        })
    })

    const summary = recentWorkouts.map(w => ({
        date: w.date,
        exercises: w.exercises
            .filter(ex => ex.exercise && typeof ex.exercise === 'object')
            .map(ex => ({ 
                name: ex.exercise.name,
                muscleGroup: ex.exercise.muscleGroup,
                trackingMode: ex.exercise.trackingMode,
                selectedEquipment: ex.selectedEquipment,
                sets: ex.sets
            }))
    }))

    const existingQuests = await Quest.find({ user: user._id, status: 'active', expiry: { $gt: new Date() } })
    const existingExercises = existingQuests.map(q => q.completion.exercise).filter(Boolean)
    const unitSystem = user.useImperial ? 'imperial (lbs)' : 'metric (kg)'

    // Build a per-quest instruction block for Claude, one per assigned type
    const questInstructions = assignedTypes.map((type, i) => {
        const typeConfig = QUEST_TYPE_PROMPTS[type]
        return `
            QUEST ${i + 1} — Type: "${type}"
            Goal: ${typeConfig.description}
            Completion schema for this quest:
            ${typeConfig.completionSchema}
            Rules: ${typeConfig.extraRules}
        `.trim()
    }).join('\n\n')

    const prompt = `You are an AI fitness coach.
        The user tracks workouts using the ${unitSystem} system.
        Generate EXACTLY ${count} fitness quest(s) for the "${duration}" duration.
        Each quest has a PRE-ASSIGNED type — you must follow each type's schema exactly.

        VALID EXERCISE NAMES (use these EXACTLY):
        ${Array.from(validExerciseNames).map(e => `- ${e}`).join('\n')}

        VALID MUSCLE GROUPS (use these EXACTLY if needed):
        ${Array.from(validMuscleGroups).map(m => `- ${m}`).join('\n')}

        USER WORKOUT HISTORY:
        ${JSON.stringify(summary)}

        ACTIVE QUEST EXERCISES TO AVOID: ${existingExercises.join(', ') || 'none'}

        QUEST ASSIGNMENTS:
        ${questInstructions}

        GENERAL RULES:
        - Quests must be CHALLENGING but achievable within the ${duration} window
        - Exercise names MUST be chosen from the VALID EXERCISE NAMES list above
        - Muscle groups MUST be chosen from the VALID MUSCLE GROUPS list above
        - Each strength/progressive quest must target a DIFFERENT exercise
        - Do not reuse exercises already in active quests
        - NEVER use "Unknown Exercise" or invent exercise names

        Return ONLY a valid JSON object in this exact shape, no extra text:
        {
            "quests": [
                {
                    "title": "string (1-6 words, creative)",
                    "questType": "string (the assigned type)",
                    "duration": "${duration}",
                    "description": "string (1-2 sentences, clear objective, encouraging)",
                    "completion": { ...fields matching the type's schema above... }
                }
            ]
        }
    `

    const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        temperature: 1.0,
        messages: [{ role: 'user', content: prompt }]
    })

    let text = response.content[0].text
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/gi, '')
        .trim()

    const parsed = JSON.parse(text)

    if (!Array.isArray(parsed.quests) || parsed.quests.length !== count) {
        throw new Error('AI response has wrong quest count')
    }

    // Validate all quests before saving
    const invalidQuests = parsed.quests.filter(q => !validateQuestCompletion(q, validExerciseNames, validMuscleGroups))
    if (invalidQuests.length > 0) {
        throw new Error(
            `Invalid quest completion data: ${invalidQuests.map(q => 
                `"${q.title}" (${q.questType} - ${q.duration}): ${JSON.stringify(q.completion)}`
            ).join('; ')}`
        )
    }

    const questData = parsed.quests.map(q => ({
        user: user._id,
        title: q.title,
        questType: q.questType,
        duration: q.duration,
        description: q.description,
        expiry: getExpiryDate(expiryDays),
        reward: QUEST_CONFIG[duration].reward,
        completion: q.completion,
        progressLog: []
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

module.exports = {
    getQuests,
    generateQuests
}