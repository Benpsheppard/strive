// generate.js
// Generates a set of quests for a user with the AI

const Anthropic = require('@anthropic-ai/sdk')

const Quest = require('../../models/questModel')
const Workout = require('../../models/workoutModel')
const { buildExerciseKey } = require('../exerciseKey')
const { QUEST_TYPE_DISTRIBUTION, QUEST_CONFIG, PROGRESSIVE_METRICS_BY_TRACKING_MODE } = require('./config')
const questTypes = require('./types')

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const getExpiryDate = (expiryDays) => {
    const expiry = new Date()

    expiry.setHours(0, 0, 0, 0) // Set to start of the day
    expiry.setDate(expiry.getDate() + expiryDays) // Add the appropriate number of days
    return expiry
}

const pickAssignedTypes = (duration) => {
    if (duration !== 'monthly') {
        return QUEST_TYPE_DISTRIBUTION[duration]
    }

    const options = QUEST_TYPE_DISTRIBUTION.monthly
    return [options[Math.floor(Math.random() * options.length)]]
}

// ─── User history ────────────────────────────────────────────────────────────
// Everything the AI is allowed to pick from, taken from the user's recent workouts
const buildQuestContext = async (user) => {
    const recentWorkouts = await Workout.find({ user: user._id })
        .sort({ date: -1 })
        .limit(10)
        .populate('exercises.exercise')

    if (recentWorkouts.length === 0) {
        throw new Error('No workouts found for this user')
    }

    const exerciseNames = new Set()
    const muscleGroups = new Set()
    const trackingModes = new Map()
    const exercisePairs = new Map()
    const volumeExerciseNames = new Set()
    const volumeMuscleGroups = new Set()

    recentWorkouts.forEach(w => {
        w.exercises.forEach(ex => {
            const exerciseData = ex.exercise
            if (!exerciseData || typeof exerciseData !== 'object') {
                return
            }

            exerciseNames.add(exerciseData.name)

            const equipment = ex.selectedEquipment
            if (typeof equipment === 'string' && equipment.trim()) {
                const pairKey = buildExerciseKey(exerciseData.name, equipment)
                trackingModes.set(pairKey, exerciseData.trackingMode)
                exercisePairs.set(pairKey, {
                    exercise: exerciseData.name,
                    selectedEquipment: equipment
                })
            }

            const groups = [exerciseData.muscleGroup, exerciseData.subMuscleGroup].filter(Boolean)
            groups.forEach(group => muscleGroups.add(group))

            if (exerciseData.trackingMode === 'weight_reps') {
                volumeExerciseNames.add(exerciseData.name)
                groups.forEach(group => volumeMuscleGroups.add(group))
            }
        })
    })

    return {
        recentWorkouts,
        exerciseNames,
        muscleGroups,
        trackingModes,
        exercisePairs,
        volumeExerciseNames,
        volumeMuscleGroups
    }
}

const summariseWorkouts = (recentWorkouts) => recentWorkouts.map(w => ({
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

// ─── Variety ─────────────────────────────────────────────────────────────────
const toTarget = (quest) => ({
    exercise: quest.completion.exercise,
    selectedEquipment: quest.completion.selectedEquipment
})

const isTargetAvoided = ({ exercise, selectedEquipment }, avoided) =>
    avoided.some(target =>
        target.exercise.trim().toLowerCase() === exercise.trim().toLowerCase() &&
        (!target.selectedEquipment ||
            target.selectedEquipment.trim().toLowerCase() === selectedEquipment.trim().toLowerCase())
    )

// Prefer exercises and muscle groups the user hasn't had quests for recently,
// falling back to everything if that leaves nothing to choose from
const chooseTargets = async (user, context) => {
    const existingQuests = await Quest.find({ user: user._id, status: 'active', expiry: { $gt: new Date() } })
    const existingExerciseTargets = existingQuests
        .filter(q => q.completion?.exercise)
        .map(toTarget)
    const existingMuscleGroups = existingQuests
        .map(q => q.completion.filterTag || q.completion.muscleGroup)
        .filter(tag => tag && context.muscleGroups.has(tag))

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const recentQuests = await Quest.find({
        user: user._id,
        createdAt: { $gte: sevenDaysAgo }
    })
    const recentExerciseTargets = recentQuests
        .filter(q => q.completion?.exercise)
        .map(toTarget)
    const recentMuscleGroups = recentQuests
        .map(q => q.completion.filterTag || q.completion.muscleGroup)
        .filter(tag => tag && context.muscleGroups.has(tag))

    const freshPairs = [...context.exercisePairs.entries()]
        .filter(([, target]) =>
            !isTargetAvoided(target, existingExerciseTargets) &&
            !isTargetAvoided(target, recentExerciseTargets)
        )
    const allowedPairs = new Map(freshPairs.length > 0 ? freshPairs : context.exercisePairs)

    const freshMuscleGroups = new Set(
        [...context.muscleGroups].filter(mg =>
            !recentMuscleGroups.includes(mg) &&
            !existingMuscleGroups.includes(mg)
        )
    )

    return {
        allowedPairs,
        muscleGroups: freshMuscleGroups.size > 0 ? freshMuscleGroups : context.muscleGroups,
        existingExercises: existingExerciseTargets.map(target =>
            `${target.exercise}${target.selectedEquipment ? ` (${target.selectedEquipment})` : ''}`
        ),
        existingMuscleGroups
    }
}

// ─── Prompt ──────────────────────────────────────────────────────────────────
const buildPrompt = ({ user, duration, assignedTypes, context, targets }) => {
    const { allowedPairs, muscleGroups, existingExercises, existingMuscleGroups } = targets
    const unitSystem = user.useImperial ? 'imperial (lbs)' : 'metric (kg)'

    // A per-quest instruction block, one per assigned type
    const questInstructions = assignedTypes.map((type, i) => {
        const typeConfig = questTypes[type].prompt
        return `
            QUEST ${i + 1} — Type: "${type}"
            Goal: ${typeConfig.description}
            Completion schema for this quest:
            ${typeConfig.completionSchema}
            Rules: ${typeConfig.extraRules}
        `.trim()
    }).join('\n\n')

    return `You are an AI fitness coach.
        The user tracks workouts using the ${unitSystem} system.
        Generate EXACTLY ${assignedTypes.length} fitness quest(s) for the "${duration}" duration.
        Each quest has a PRE-ASSIGNED type — you must follow each type's schema exactly.

        VALID EXERCISE AND EQUIPMENT PAIRS (use both values EXACTLY; only choose one of these pairs):
        ${[...allowedPairs.values()].map(target =>
            `- exercise: "${target.exercise}", selectedEquipment: "${target.selectedEquipment}"`
        ).join('\n')}

        VALID MUSCLE GROUPS (use these EXACTLY if needed):
        ${Array.from(muscleGroups).map(m => `- ${m}`).join('\n')}

        VALID PROGRESSIVE METRICS BY EXERCISE AND EQUIPMENT:
        ${Array.from(allowedPairs, ([pairKey, target]) => {
            const mode = context.trackingModes.get(pairKey)
            return `- ${target.exercise} (${target.selectedEquipment}): ${(PROGRESSIVE_METRICS_BY_TRACKING_MODE[mode] || []).join(', ') || 'none'}`
        }
        ).join('\n')}

        VALID VOLUME FILTER TAGS:
        ${Array.from(new Set([...context.volumeExerciseNames, ...context.volumeMuscleGroups])).map(tag => `- ${tag}`).join('\n') || '- none; use null'}

        USER WORKOUT HISTORY:
        ${JSON.stringify(summariseWorkouts(context.recentWorkouts))}

        ACTIVE QUEST EXERCISES TO AVOID: ${existingExercises.join(', ') || 'none'}
        ACTIVE QUEST MUSCLE GROUPS TO AVOID: ${existingMuscleGroups.join(', ') || 'none'}

        QUEST ASSIGNMENTS:
        ${questInstructions}

        GENERAL RULES:
        - Quests must be CHALLENGING but achievable within the ${duration} window
        - Strength and progressive quests MUST use an exact exercise/equipment pair from the VALID EXERCISE AND EQUIPMENT PAIRS list above
        - Muscle groups MUST be chosen from the VALID MUSCLE GROUPS list above
        - Each strength/progressive quest must target a DIFFERENT exercise/equipment pair
        - Do not reuse an exercise/equipment pair already in active or recent quests
        - NEVER use "Unknown Exercise" or invent exercise names

        Call the ${QUEST_TOOL.name} tool to submit the quests. Do not reply with plain text. Each quest has:
        - title: string (1-6 words, creative)
        - questType: string (the assigned type)
        - duration: "${duration}"
        - description: string (1-2 sentences, clear objective, encouraging)
        - completion: fields matching the type's schema above
    `
}

// ─── AI request ──────────────────────────────────────────────────────────────
// The model is asked to answer through this tool, so the quests arrive as structured
// data instead of free text that has to be cleaned up and parsed. This model doesn't
// allow tool use to be forced, so the prompt tells it to call the tool.
const QUEST_TOOL = {
    name: 'submit_quests',
    description: 'Submit the generated quests',
    input_schema: {
        type: 'object',
        properties: {
            quests: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        title: { type: 'string' },
                        questType: { type: 'string', enum: Object.keys(questTypes) },
                        duration: { type: 'string', enum: Object.keys(QUEST_CONFIG) },
                        description: { type: 'string' },
                        completion: { type: 'object' }
                    },
                    required: ['title', 'questType', 'duration', 'description', 'completion']
                }
            }
        },
        required: ['quests']
    }
}

// Returns the submitted quests (validated separately), or undefined if the model didn't submit any
const requestQuests = async (prompt) => {
    let response
    try {
        response = await anthropic.messages.create({
            model: 'claude-sonnet-5-5',
            max_tokens: 2048,
            temperature: 1.0,
            thinking: { type: 'between_tools' },
            tools: [QUEST_TOOL],
            messages: [{ role: 'user', content: prompt }]
        })
    } catch (error) {
        // Only treat billing problems as "credits exhausted"; other 400s are real bugs and must surface
        const apiMessage = String(error.error?.error?.message || error.message || '')
        if (error.status === 400 && error.error?.error?.type === 'invalid_request_error' && /credit balance/i.test(apiMessage)) {
            throw new Error('ANTHROPIC_CREDIT_EXHAUSTED')
        }

        throw error
    }

    return response.content.find(block => block.type === 'tool_use' && block.name === QUEST_TOOL.name)?.input
}

// ─── Validation ──────────────────────────────────────────────────────────────
const validateQuest = (quest, assignedType, context) => {
    if (!quest || typeof quest !== 'object' || Array.isArray(quest)) return false

    const { title, description, questType, completion } = quest
    const wordCount = typeof title === 'string' ? title.trim().split(/\s+/).length : 0

    if (
        questType !== assignedType ||
        quest.duration !== context.duration ||
        typeof title !== 'string' ||
        !title.trim() ||
        wordCount > 6 ||
        typeof description !== 'string' ||
        !description.trim() ||
        !completion ||
        typeof completion !== 'object' ||
        Array.isArray(completion)
    ) {
        return false
    }

    return questTypes[assignedType].validate(completion, context)
}

const validateQuests = (parsed, assignedTypes, context) => {
    if (!parsed || !Array.isArray(parsed.quests) || parsed.quests.length !== assignedTypes.length) {
        throw new Error('AI response has wrong quest count')
    }

    const invalidIndex = parsed.quests.findIndex((quest, index) =>
        !validateQuest(quest, assignedTypes[index], context)
    )
    if (invalidIndex !== -1) {
        const invalidQuest = parsed.quests[invalidIndex]
        throw new Error(
            `Invalid quest response at position ${invalidIndex + 1}: ${JSON.stringify(invalidQuest)}`
        )
    }

    const targetedExercises = parsed.quests
        .filter(quest => quest.questType === 'strength' || quest.questType === 'progressive')
        .map(quest => buildExerciseKey(quest.completion.exercise, quest.completion.selectedEquipment))
    if (new Set(targetedExercises).size !== targetedExercises.length) {
        throw new Error('Strength and progressive quests must target different exercise/equipment pairs')
    }
}

// The model occasionally returns quests that break the rules, so give it one more go
// before giving up. API errors are not retried.
const MAX_ATTEMPTS = 2

const requestAndValidate = async (prompt, assignedTypes, context) => {
    for (let attempt = 1; ; attempt++) {
        const parsed = await requestQuests(prompt)

        try {
            validateQuests(parsed, assignedTypes, context)
            return parsed
        } catch (error) {
            if (attempt >= MAX_ATTEMPTS) {
                throw error
            }
        }
    }
}

// ─── Main ────────────────────────────────────────────────────────────────────
const genQuests = async (user, duration) => {
    if (!QUEST_CONFIG[duration]) {
        throw new Error(`Invalid quest duration: ${duration}`)
    }

    const { expiryDays, reward } = QUEST_CONFIG[duration]
    const assignedTypes = pickAssignedTypes(duration)
    const requiresExerciseEquipment = assignedTypes.some(type =>
        type === 'strength' || type === 'progressive'
    )

    const history = await buildQuestContext(user)
    if (requiresExerciseEquipment && history.exercisePairs.size === 0) {
        throw new Error('No exercise/equipment history found for strength or progressive quests')
    }

    const targets = await chooseTargets(user, history)

    // Validators see the same history, narrowed to the exercises the AI was offered
    const context = { ...history, duration, allowedPairs: targets.allowedPairs }

    const prompt = buildPrompt({ user, duration, assignedTypes, context, targets })
    const parsed = await requestAndValidate(prompt, assignedTypes, context)

    const questData = parsed.quests.map(q => ({
        user: user._id,
        title: q.title,
        questType: q.questType,
        duration: q.duration,
        description: q.description,
        expiry: getExpiryDate(expiryDays),
        reward,
        completion: questTypes[q.questType].normalise(q.completion, context),
        progressLog: []
    }))

    return Quest.insertMany(questData)
}

module.exports = { genQuests }
