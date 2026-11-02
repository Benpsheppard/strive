// progressive.js
// A personal best goal: beat the current best for a metric on one exercise

const { getMaxWeight, getMaxReps, getVolume, getTotalDistance, getTotalDuration } = require('../../workoutMetrics')
const { PROGRESSIVE_METRICS_BY_TRACKING_MODE } = require('../config')
const { isValidTarget, targetKey, matchesQuestExercise, resolveTarget } = require('../helpers')

const prompt = {
    description: `A personal best goal. The user must beat their current best for a specific metric on a chosen exercise.`,
    completionSchema: `{
        "exercise": "string (exact name from workout history)",
        "selectedEquipment": "string (exact equipment used for that exercise in workout history)",
        "metric": "max_weight" | "max_reps" | "session_volume",
        "baseline": number (their current best value for this metric)
    }`,
    extraRules: `Analyse their history to determine the baseline for this exact exercise/equipment pair. Choose a metric supported by that exercise's tracking mode.`
}

const validate = (completion, context) =>
    isValidTarget(completion, context) &&
    (PROGRESSIVE_METRICS_BY_TRACKING_MODE[context.trackingModes.get(targetKey(completion))] || [])
        .includes(completion.metric) &&
    Number.isFinite(completion.baseline) &&
    completion.baseline >= 0

const normalise = (completion, context) => ({
    ...resolveTarget(completion, context),
    metric: completion.metric,
    baseline: completion.baseline
})

const METRIC_READERS = {
    max_weight: getMaxWeight,
    max_reps: getMaxReps,
    session_volume: getVolume,
    total_distance: getTotalDistance,
    total_duration: getTotalDuration
}

const check = (quest, exercises) => {
    const { exercise, selectedEquipment, metric, baseline } = quest.completion

    const match = exercises.find(e => matchesQuestExercise(e, exercise, selectedEquipment))
    const readMetric = METRIC_READERS[metric]
    if (!match || !readMetric) {
        return { completed: false }
    }

    return { completed: readMetric(match.sets) > baseline }
}

module.exports = { prompt, validate, normalise, check }
