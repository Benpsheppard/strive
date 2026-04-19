// workoutSummary.js

// Imports
const Workout = require('../models/workoutModel')
const Quest = require('../models/questModel')

const REP_BUFFER = 2
const WORKOUT_COMPLETE_REWARD = 200

// ─── Helpers ────────────────────────────────────────────────────────────────

// Get the best "weight" from a set of sets (for weight-based exercises)
const getMaxWeight = (sets) =>
    Math.max(0, ...sets.map(s => Number(s.weight) || 0))

// Get total volume (weight × reps) from a set of sets
const getVolume = (sets) =>
    sets.reduce((sum, s) => sum + (Number(s.weight) || 0) * (Number(s.reps) || 0), 0)

// Get total distance from a set of sets
const getTotalDistance = (sets) =>
    sets.reduce((sum, s) => sum + (Number(s.distance) || 0), 0)

// Get total duration from a set of sets
const getTotalDuration = (sets) =>
    sets.reduce((sum, s) => sum + (Number(s.duration) || 0), 0)

const getMultiplier = (momentum) => {
    if (momentum === 100) return 2
    if (momentum > 80)    return 1.8
    if (momentum > 60)    return 1.6
    if (momentum > 40)    return 1.4
    if (momentum > 20)    return 1.2
    return 1
}

// ─── Quest Checkers ──────────────────────────────────────────────────────────

const questCheckers = {
    strength: (quest, exercises) => {
        const { exercise, weight, reps } = quest.completion

        const match = exercises.find(e =>
            e.name.toLowerCase().trim() === exercise.toLowerCase().trim()
        )

        if (!match) {
            return false
        }

        return match.sets.some(s =>
            (Number(s.weight) || 0) >= weight &&
            (Number(s.reps) || 0) >= reps - REP_BUFFER
        )
    },

    consistency: async (quest, exercises, workout) => {
        const { filterTag, targetCount } = quest.completion

        if (filterTag) {
            const tag = filterTag.toLowerCase().trim()
            const matches = exercises.some(e =>
                e.muscleGroup?.toLowerCase() === tag ||
                e.subMuscleGroup?.toLowerCase() === tag ||
                e.name.toLowerCase().trim() === tag
            )
            if (!matches) {
                return false
            }
        }

        const alreadyCounted = quest.progressLog.some(p =>
            p.workoutId.toString() === workout._id.toString()
        )
        
        if (alreadyCounted) {
            return false
        }

        quest.progressLog.push({ workoutId: workout._id, loggedAt: new Date() })
        quest.set('completion.currentCount', quest.progressLog.length)
        await quest.save()

        return quest.completion.currentCount >= targetCount
    },

    volume: async (quest, exercises, workout) => {
        const { filterTag, targetVolume } = quest.completion

        let sessionVolume = 0
        for (const ex of exercises) {
            const tag = filterTag?.toLowerCase().trim()
            const nameMatches = !tag || ex.name.toLowerCase().trim() === tag
            const groupMatches = !tag || ex.muscleGroup?.toLowerCase() === tag || ex.subMuscleGroup?.toLowerCase() === tag

            if (!tag || nameMatches || groupMatches) {
                sessionVolume += getVolume(ex.sets)
            }
        }

        if (sessionVolume === 0) {
            return false
        }

        const alreadyCounted = quest.progressLog.some(p =>
            p.workoutId.toString() === workout._id.toString()
        )

        if (alreadyCounted) {
            return false
        }

        quest.progressLog.push({ workoutId: workout._id, loggedAt: new Date(), value: sessionVolume })
        const newVolume = quest.progressLog.reduce((sum, p) => sum + (p.value || 0), 0)
        quest.set('completion.currentVolume', newVolume)
        await quest.save()

        return quest.completion.currentVolume >= targetVolume
    },

    progressive: (quest, exercises) => {
        const { exercise, metric, baseline } = quest.completion

        const match = exercises.find(e =>
            e.name.toLowerCase().trim() === exercise.toLowerCase().trim()
        )
        if (!match) return false

        switch (metric) {
            case 'max_weight':
                return getMaxWeight(match.sets) > baseline
            case 'max_reps':
                return Math.max(0, ...match.sets.map(s => Number(s.reps) || 0)) > baseline
            case 'session_volume':
                return getVolume(match.sets) > baseline
            case 'total_distance':
                return getTotalDistance(match.sets) > baseline
            case 'total_duration':
                return getTotalDuration(match.sets) > baseline
            default:
                return false
        }
    }
}

// ─── Personal Bests ──────────────────────────────────────────────────────────

// Per tracking mode, define what metric counts as a "personal best"
const getPBMetric = (trackingMode, sets) => {
    switch (trackingMode) {
        case 'weight_reps':
            return { metric: 'max_weight', value: getMaxWeight(sets) }
        case 'bodyweight_reps':
        case 'assisted_reps':
        case 'reps':
            return { metric: 'max_reps', value: Math.max(0, ...sets.map(s => Number(s.reps) || 0)) }
        case 'duration':
            return { metric: 'best_duration', value: Math.max(0, ...sets.map(s => Number(s.duration) || 0)) }
        case 'distance_duration':
            return { metric: 'total_distance', value: getTotalDistance(sets) }
        default:
            return null
    }
}

const detectPersonalBests = async (userId, exercises) => {
    const existingWorkouts = await Workout.find({ user: userId }).populate('exercises.exercise')

    // Build existing PBs from previous workouts per exercise name + metric
    const existingPBs = {}
    existingWorkouts.forEach(workout => {
        workout.exercises.forEach(ex => {
            const name = ex.exercise?.name?.trim().toLowerCase()
            const trackingMode = ex.exercise?.trackingMode

            if (!name || !trackingMode) {
                return
            }

            const pb = getPBMetric(trackingMode, ex.sets)
            if (!pb || pb.value === 0) {
                return
            }

            if (!existingPBs[name] || pb.value > existingPBs[name].value) {
                existingPBs[name] = { metric: pb.metric, value: pb.value }
            }
        })
    })

    // Compare new workout exercises against existing PBs
    const newPBs = []
    exercises.forEach(exercise => {
        const name = exercise.name.trim().toLowerCase()
        const pb = getPBMetric(exercise.trackingMode, exercise.sets)
        if (!pb || pb.value === 0) return

        const existingPB = existingPBs[name]
        if (!existingPB || pb.value > existingPB.value) {
            newPBs.push({
                exercise: exercise.name,
                metric: pb.metric,
                previousValue: existingPB ? existingPB.value : 0,
                newValue: pb.value
            })
        }
    })

    return newPBs
}

// ─── Quest Completion ────────────────────────────────────────────────────────
const detectQuestCompletion = async (userId, exercises, workout) => {
    const activeQuests = await Quest.find({ user: userId, status: 'active' })
    const questsCompleted = []
    let totalQuestSP = 0

    for (const quest of activeQuests) {
        const checker = questCheckers[quest.questType ?? 'strength']
        if (!checker) continue

        const completed = await checker(quest, exercises, workout)
        if (completed) {
            quest.status = 'completed'
            await quest.save()

            questsCompleted.push({
                questId: quest._id,
                title: quest.title,
                reward: quest.reward
            })
            totalQuestSP += quest.reward
        }
    }

    return { questsCompleted, totalQuestSP }
}

// ─── Main Summary ────────────────────────────────────────────────────────────

const calculateWorkoutSummary = async (user, exercises, workout) => {
    let totalWeight = 0
    let totalReps = 0
    let totalSets = 0
    let totalDistance = 0
    let totalDuration = 0

    exercises.forEach(exercise => {
        exercise.sets.forEach(set => {
            totalWeight += (Number(set.weight) || 0) * (Number(set.reps) || 0)
            totalReps += Number(set.reps) || 0
            totalDistance += Number(set.distance) || 0
            totalDuration += Number(set.duration) || 0
            totalSets += 1
        })
    })

    const totalExercises = exercises.length

    const multiplier = getMultiplier(user.momentum.current)
    console.log(`MULTIPLIER: ${multiplier}`)
    
    const personalBests = await detectPersonalBests(user._id, exercises)
    const { questsCompleted, totalQuestSP } = await detectQuestCompletion(user._id, exercises, workout)
    
    const totalStrivePoints = (WORKOUT_COMPLETE_REWARD + totalQuestSP + (personalBests.length * 500)) * multiplier

    return {
        totalWeight,
        totalReps,
        totalSets,
        totalExercises,
        totalDistance,
        totalDuration,
        totalStrivePoints,
        questsCompleted,
        personalBests
    }
}

module.exports = { calculateWorkoutSummary }