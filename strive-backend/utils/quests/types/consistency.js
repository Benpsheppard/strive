// consistency.js
// Complete a number of workouts in the quest window, optionally filtered to a muscle group or exercise

const prompt = {
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
}

const TARGET_COUNT_BOUNDS = {
    daily: [1, 1],
    weekly: [2, 4],
    monthly: [8, 12]
}

const isValidFilterTag = (tag, context) =>
    tag === null ||
    (typeof tag === 'string' &&
        (context.exerciseNames.has(tag) || context.muscleGroups.has(tag)))

const validate = (completion, context) => {
    const bounds = TARGET_COUNT_BOUNDS[context.duration]

    return Boolean(bounds) &&
        Number.isInteger(completion.targetCount) &&
        completion.targetCount >= bounds[0] &&
        completion.targetCount <= bounds[1] &&
        (completion.currentCount === undefined || completion.currentCount === 0) &&
        isValidFilterTag(completion.filterTag ?? null, context)
}

const normalise = (completion) => ({
    targetCount: completion.targetCount,
    currentCount: 0,
    filterTag: completion.filterTag ?? null
})

const check = (quest, exercises, workout) => {
    const { filterTag, targetCount } = quest.completion

    if (filterTag) {
        const tag = filterTag.toLowerCase().trim()
        const matches = exercises.some(e =>
            e.muscleGroup?.toLowerCase() === tag ||
            e.subMuscleGroup?.toLowerCase() === tag ||
            e.name.toLowerCase().trim() === tag
        )
        if (!matches) {
            return { completed: false }
        }
    }

    const alreadyCounted = quest.progressLog.some(p =>
        p.workoutId.toString() === workout._id.toString()
    )
    if (alreadyCounted) {
        return { completed: false }
    }

    const currentCount = quest.progressLog.length + 1

    return {
        completed: currentCount >= targetCount,
        progress: {
            logEntry: { workoutId: workout._id, loggedAt: new Date() },
            completion: { currentCount }
        }
    }
}

module.exports = { prompt, validate, normalise, check }
