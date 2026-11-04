// strength.js
// A single-session strength goal: hit a weight x reps on one exercise

const { getMaxWeight } = require('../../workoutMetrics')
const { isPositiveNumber, isValidTarget, targetKey, matchesQuestExercise, resolveTarget, getHistoricalBest } = require('../helpers')

// Reps a user can fall short by and still count
const REP_BUFFER = 2

// Most the target weight may exceed the user's best recent weight for the exercise
const MAX_WEIGHT_INCREASE = 1.25

const prompt = {
    description: `A single-session strength goal. The user must hit a specific weight x reps in one workout.`,
    completionSchema: `{
        "exercise": "string (exact name from workout history)",
        "selectedEquipment": "string (exact equipment used for that exercise in workout history)",
        "weight": number,
        "reps": number (1-12)
    }`,
    extraRules: `Follow the progressive overload rules strictly. Pick an exact exercise/equipment pair from their history.`
}

const validate = (completion, context) =>
    isValidTarget(completion, context) &&
    context.trackingModes.get(targetKey(completion)) === 'weight_reps' &&
    isPositiveNumber(completion.weight) &&
    completion.weight <= getHistoricalBest(context, completion, getMaxWeight) * MAX_WEIGHT_INCREASE &&
    Number.isInteger(completion.reps) &&
    completion.reps >= 1 &&
    completion.reps <= 12

const normalise = (completion, context) => ({
    ...resolveTarget(completion, context),
    weight: completion.weight,
    reps: completion.reps
})

const check = (quest, exercises) => {
    const { exercise, selectedEquipment, weight, reps } = quest.completion

    const match = exercises.find(e => matchesQuestExercise(e, exercise, selectedEquipment))
    if (!match) {
        return { completed: false }
    }

    const completed = match.sets.some(s =>
        (Number(s.weight) || 0) >= weight &&
        (Number(s.reps) || 0) >= Math.max(1, reps - REP_BUFFER)
    )

    return { completed }
}

module.exports = { prompt, validate, normalise, check }
