// volume.js
// Lift a cumulative amount of weight across sessions, optionally for one muscle group or exercise

const { getVolume } = require('../../workoutMetrics')
const { isPositiveNumber } = require('../helpers')

const prompt = {
    description: `A total volume goal. The user must lift a cumulative amount of weight (kg or lbs) across one or more sessions, optionally for a specific muscle group OR specific exercise.`,
    completionSchema: `{
        "targetVolume": number (total kg/lbs to lift),
        "currentVolume": 0,
        "filterTag": "string or null (must exactly match one exercise name OR one muscleGroup from workout history, e.g. 'Bench Press', 'Chest', 'Back', 'Legs', or null)"
    }`,
    extraRules: `
        Calculate a realistic targetVolume by looking at their recent session volumes for that muscle group / exercise. 
        Weekly targets should be achievable across 2-3 sessions.
        Use only exact tags already present in workout history.
        Allowed filterTag values are:
        - exact exercise names from workout history
        - exact muscleGroup values from workout history
        - Reflect the task exactly:
            - e.g. if volume for Triceps, filterTag should be 'Triceps'; if volume for Bench Press, filterTag should be 'Bench Press'
            - Do NOT mix muscleGroup filterTag with exercise task and vice-versa

        Never invent broader categories like:
        "upper body", "lower body", "push", "pull", "arms", "full body"

        If unsure, use null.`
}

const validate = (completion, context) =>
    isPositiveNumber(completion.targetVolume) &&
    (completion.currentVolume === undefined || completion.currentVolume === 0) &&
    (completion.filterTag === undefined ||
        completion.filterTag === null ||
        context.volumeExerciseNames.has(completion.filterTag) ||
        context.volumeMuscleGroups.has(completion.filterTag))

const normalise = (completion) => ({
    targetVolume: completion.targetVolume,
    currentVolume: 0,
    filterTag: completion.filterTag ?? null
})

const check = (quest, exercises, workout) => {
    const { filterTag, targetVolume } = quest.completion
    const tag = filterTag?.toLowerCase().trim()

    let sessionVolume = 0
    for (const ex of exercises) {
        const nameMatches = ex.name.toLowerCase().trim() === tag
        const groupMatches = ex.muscleGroup?.toLowerCase() === tag || ex.subMuscleGroup?.toLowerCase() === tag

        if (!tag || nameMatches || groupMatches) {
            sessionVolume += getVolume(ex.sets)
        }
    }

    if (sessionVolume === 0) {
        return { completed: false }
    }

    const alreadyCounted = quest.progressLog.some(p =>
        p.workoutId.toString() === workout._id.toString()
    )
    if (alreadyCounted) {
        return { completed: false }
    }

    const currentVolume = quest.progressLog.reduce((sum, p) => sum + (p.value || 0), sessionVolume)

    return {
        completed: currentVolume >= targetVolume,
        progress: {
            logEntry: { workoutId: workout._id, loggedAt: new Date(), value: sessionVolume },
            completion: { currentVolume }
        }
    }
}

module.exports = { prompt, validate, normalise, check }
