// strength.js
// A single-session strength goal: hit a weight x reps on one exercise

const { isPositiveNumber, isValidTarget, targetKey, matchesQuestExercise, resolveTarget } = require('../helpers')

// Reps a user can fall short by and still count
const REP_BUFFER = 2

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
        (Number(s.reps) || 0) >= reps - REP_BUFFER
    )

    return { completed }
}

module.exports = { prompt, validate, normalise, check }
