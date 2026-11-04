// helpers.js
// Shared by the quest type modules

const { buildExerciseKey } = require('../exerciseKey')

const isPositiveNumber = value => Number.isFinite(value) && value > 0

const hasTarget = completion =>
    typeof completion.exercise === 'string' && typeof completion.selectedEquipment === 'string'

const targetKey = completion => buildExerciseKey(completion.exercise, completion.selectedEquipment)

// A target is valid when it names an allowed exercise/equipment pair
const isValidTarget = (completion, context) =>
    hasTarget(completion) && context.allowedPairs.has(targetKey(completion))

// Match a quest target against an exercise from the workout (equipment is optional on the quest)
const matchesQuestExercise = (candidate, exercise, selectedEquipment) => {
    if (candidate.name.toLowerCase().trim() !== exercise.toLowerCase().trim()) {
        return false
    }

    if (selectedEquipment == null || selectedEquipment === '') {
        return true
    }

    return typeof selectedEquipment === 'string' &&
        typeof candidate.selectedEquipment === 'string' &&
        candidate.selectedEquipment.toLowerCase().trim() === selectedEquipment.toLowerCase().trim()
}

// Swap an AI-supplied target for the exact exercise/equipment pair from the user's history
const resolveTarget = (completion, context) => {
    const target = hasTarget(completion) ? context.allowedPairs.get(targetKey(completion)) : null
    if (!target) {
        throw new Error('Quest target must match an exercise/equipment pair from workout history')
    }

    return { exercise: target.exercise, selectedEquipment: target.selectedEquipment }
}

// Best value of a metric for an exercise/equipment pair across the user's recent workouts.
// Baselines come from this rather than from the AI, which can misreport them.
const getHistoricalBest = (context, completion, readMetric) => {
    let best = 0

    ;(context.recentWorkouts || []).forEach(workout => {
        workout.exercises.forEach(ex => {
            const data = ex.exercise
            if (!data || typeof data !== 'object') return

            const candidate = { name: data.name, selectedEquipment: ex.selectedEquipment }
            if (!matchesQuestExercise(candidate, completion.exercise, completion.selectedEquipment)) return

            best = Math.max(best, readMetric(ex.sets || []))
        })
    })

    return best
}

module.exports = {
    getHistoricalBest,
    isPositiveNumber,
    hasTarget,
    targetKey,
    isValidTarget,
    matchesQuestExercise,
    resolveTarget
}
