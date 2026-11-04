// workoutSummary.js

// Imports
const Workout = require('../models/workoutModel')
const { getStartOfWeek, getEndOfWeek } = require('./dateFormat')
const { getWorkoutsThisWeek } = require('./workoutServices')
const { detectQuestCompletion } = require('./quests/progress')
const { buildExerciseKey } = require('./exerciseKey')
const { getMaxWeight, getMaxReps, getMaxDuration, getTotalDistance } = require('./workoutMetrics')
const {
    MAX_FIRST_LIFTS_REWARDED,
    NO_SP_REASON,
    isWorkoutEligibleForSP,
    getMinPBIncrease,
    getStartOfDay,
    getRemainingDailySP
} = require('./spRules')

// ─── Helpers ────────────────────────────────────────────────────────────────

const getReward = (score) => {
    const clamped = Math.max(0.7, Math.min(score, 1.3))
    return Math.round(25 + ((clamped - 0.7) / 0.6) * 125)
}

const getMomentumMultiplier = (momentum) => {
    if (momentum === 100) return 2
    if (momentum > 80)    return 1.8
    if (momentum > 60)    return 1.6
    if (momentum > 40)    return 1.4
    if (momentum > 20)    return 1.2
    return 1
}

const getWeeklyFrequency = (workoutHistory) => {
    if (workoutHistory.length < 2) return 3

    const first = workoutHistory[workoutHistory.length - 1].createdAt
    const last = workoutHistory[0].createdAt

    const totalWeeks = (last - first) / (1000 * 60 * 60 * 24 * 7)
    if (totalWeeks < 1) return 3

    const calculated = workoutHistory.length / totalWeeks

    const confidence = Math.min(totalWeeks / 8, 1)

    return (calculated * confidence) + (3 * (1 - confidence))
}

// ─── Calculate Strive Points ─────────────────────────────────────────────────
const getWeeklyBonus = (target) => {
    switch (target) {
        case 1:
            return 100
        case 2:
            return 200
        case 3:
            return 500
        case 4:
            return 750
        case 5:
        case 6:
        case 7:
            return 1000
        default: 
            return 0
    }
}

const calculateVolumePoints = async (workoutHistory, totalWeight) => {
    const recentWorkouts = workoutHistory
        .filter(w => w.summary)
        .slice(0, 5)

    if (recentWorkouts.length < 5) {
        return { volumeReward: 40, volumeScore: 1 }
    }

    // Calculate total Volume across those 5 workouts
    let runningTotal = 0
    recentWorkouts.forEach(w => {
        const volume = w.summary.totalWeight || 0
        runningTotal += volume
    })

    // Calculate average
    const averageTotalWeight = runningTotal / 5

    // Calculate score (no recent volume to compare against counts as an average session)
    const score = averageTotalWeight > 0 ? totalWeight / averageTotalWeight : 1

    // Calculate reward
    const reward = getReward(score)

    return {
        volumeReward: reward,
        volumeScore: score
    }
}

// Get the exercise id as a string, whether the exercise is populated (lean history) or a raw ObjectId
const getExerciseId = (exerciseRef) => (exerciseRef?._id ?? exerciseRef)?.toString()

const calculateStrengthPoints = async (workoutHistory, exercises) => {
    const exerciseIds = exercises.map(e => e.exerciseId.toString())
    const recentWorkouts = workoutHistory
        .filter(w => w.exercises.some(ex => exerciseIds.includes(getExerciseId(ex.exercise))))
        .slice(0, 15)

    if (recentWorkouts.length < 5) {
        return { strengthReward: 40, strengthScore: 1 }
    }

    let runningTotal = 0
    let matchedExerciseCount = 0

    exercises.forEach(exercise => {
        const currentMax = getMaxWeight(exercise.sets)
        if (currentMax === 0) {
            return
        }

        let exerciseHistoryTotal = 0
        let exerciseHistoryCount = 0

        recentWorkouts.forEach(recentWorkout => {
            const match = recentWorkout.exercises.find(e => getExerciseId(e.exercise) === exercise.exerciseId.toString())

            if (match) {
                const recentMax = getMaxWeight(match.sets)

                if (recentMax > 0) {
                    exerciseHistoryTotal += recentMax
                    exerciseHistoryCount++
                }
            }
        })

        if (exerciseHistoryCount === 0) {
            return
        }

        const averageMax = exerciseHistoryTotal / exerciseHistoryCount
        const exerciseScore = currentMax / averageMax

        runningTotal += exerciseScore
        matchedExerciseCount++
    })

    if (matchedExerciseCount === 0) {
        return { strengthReward: 40, strengthScore: 1 }
    }

    const score = runningTotal / matchedExerciseCount
    
    const reward = getReward(score)
    return {
        strengthReward: reward,
        strengthScore: score
    }
}

const calculateProgressionPoints = (existingPBs, exercises, personalBests) => {
    if (Object.keys(existingPBs).length === 0) {
        return { progressionReward: 40, progressionScore: 1 }
    }

    let runningScore = 0
    let matchedExerciseCount = 0

    exercises.forEach(exercise => {
        const name = exercise.name.trim().toLowerCase()
        const key = buildPBKey(name, exercise.selectedEquipment)

        const pb = getPBMetric(exercise.trackingMode, exercise.sets)
        if (!pb || pb.value === 0) return

        const existingPB = existingPBs[key]
        if (!existingPB) return

        const exerciseScore = 0.7 + 0.3 * (pb.value / existingPB.value)
        runningScore += exerciseScore
        matchedExerciseCount++
    })

    if (matchedExerciseCount === 0) {
        return { progressionReward: 40, progressionScore: 1 }
    }

    let score = runningScore / matchedExerciseCount

    // Bonus for each PB hit this session
    const pbBonus = personalBests.length * 0.08
    score += pbBonus

    const reward = getReward(score)
    return {
        progressionReward: reward,
        progressionScore: score
    }
}

const calculateConsistencyMultiplier = async (workoutHistory) => {
    const WEEKS_TO_CHECK = 6
    const now = new Date()
    const cutoff = new Date(now - WEEKS_TO_CHECK * 7 * 24 * 60 * 60 * 1000)

    const recentWorkouts = workoutHistory.filter(w => w.createdAt >= cutoff)
    if (recentWorkouts.length <= 1) {
        return 1.0
    }

    const workoutsPerWeek = recentWorkouts.length / WEEKS_TO_CHECK

    const typicalWeeklyFrequency = getWeeklyFrequency(workoutHistory)

    const frequencyScore = Math.min(workoutsPerWeek / typicalWeeklyFrequency, 1.0)

    const gaps = []
    for (let i = 0; i < recentWorkouts.length - 1; i++) {
        const diff = recentWorkouts[i].createdAt - recentWorkouts[i + 1].createdAt
        gaps.push(diff / (1000 * 60 * 60 * 24))
    }

    const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length
    const variance = gaps.reduce((sum, g) => sum + Math.pow(g - avgGap, 2), 0) / gaps.length
    const stdDev = Math.sqrt(variance)

    const regularityScore = Math.max(0, 1 - (stdDev / (avgGap + 1)))
    const consistencyScore = (frequencyScore * 0.6) + (regularityScore * 0.4)
    const multiplier = 0.8 + (consistencyScore * 0.7)

    return Math.round(multiplier * 100) / 100
}

// First time logging an exercise/equipment pair isn't a PB, it earns a smaller flat reward
const FIRST_LIFT_REWARD = 50

const calculateTotalStrivePoints = async (workoutHistory, existingPBs, user, workout, exercises, personalBests, firstLifts, totalWeight, totalQuestSP) => {
    const momentumMultiplier = getMomentumMultiplier(user.momentum.current)
    const { progressionReward, progressionScore } = calculateProgressionPoints(existingPBs, exercises, personalBests)
    const [{ volumeReward, volumeScore }, { strengthReward, strengthScore }, consistencyMultiplier] = await Promise.all([
        calculateVolumePoints(workoutHistory, totalWeight),
        calculateStrengthPoints(workoutHistory, exercises),
        calculateConsistencyMultiplier(workoutHistory)
    ])

    const personalBestsReward = personalBests.length * 500
    const firstLiftsReward = Math.min(firstLifts.length, MAX_FIRST_LIFTS_REWARDED) * FIRST_LIFT_REWARD

    // The workout isn't saved yet, so add it to the count already in the database
    const workoutsThisWeek = await getWorkoutsThisWeek(user._id, workout.createdAt) + 1

    const target = user.target
    const targetReached = workoutsThisWeek === target
    const targetBonus = targetReached ? getWeeklyBonus(target) : 0

    const completeReward = Math.ceil((volumeReward + strengthReward + progressionReward) * consistencyMultiplier)
    const uncappedTotal = Math.ceil((completeReward + totalQuestSP + personalBestsReward + firstLiftsReward + targetBonus) * momentumMultiplier)

    // Cap what can be earned in one day
    const dayStart = getStartOfDay(workout.createdAt)
    const dayEnd = new Date(dayStart)
    dayEnd.setDate(dayEnd.getDate() + 1)
    const earnedToday = workoutHistory
        .filter(w => w.createdAt >= dayStart && w.createdAt < dayEnd)
        .reduce((sum, w) => sum + (Number(w.summary?.totalStrivePoints?.total) || 0), 0)
    const total = Math.min(uncappedTotal, getRemainingDailySP(earnedToday))
    const dailyCapReached = total < uncappedTotal

    return {
        total,
        dailyCapReached,
        volume: { reward: volumeReward, score: volumeScore },
        strength: { reward: strengthReward, score: strengthScore },
        progression: { reward: progressionReward, score: progressionScore },
        consistencyMultiplier,
        momentumMultiplier,
        totalQuestSP,
        personalBestsReward,
        firstLiftsReward,
        bonus: targetBonus
    }
}

// ─── Personal Bests ──────────────────────────────────────────────────────────
const getPBMetric = (trackingMode, sets) => {
    switch (trackingMode) {
        case 'weight_reps':
            return { metric: 'max_weight', value: getMaxWeight(sets) }
        case 'bodyweight_reps':
        case 'assisted_reps':
        case 'reps':
            return { metric: 'max_reps', value: getMaxReps(sets) }
        case 'duration':
            return { metric: 'best_duration', value: getMaxDuration(sets) }
        case 'distance':
        case 'distance_duration':
            return { metric: 'total_distance', value: getTotalDistance(sets) }
        default:
            return null
    }
}

const buildPBKey = (name, equipment) => buildExerciseKey(name, equipment || 'unspecified')

const getExistingPBs = (workoutHistory) => {
    const existingPBs = {}

    workoutHistory.forEach(workout => {
        workout.exercises.forEach(ex => {
            const name = ex.exercise?.name?.trim().toLowerCase()
            const trackingMode = ex.exercise?.trackingMode

            if (!name || !trackingMode) return

            const key = buildPBKey(name, ex.selectedEquipment)

            const pb = getPBMetric(trackingMode, ex.sets)

            if (!pb || pb.value === 0) return

            if (!existingPBs[key] || pb.value > existingPBs[key].value) {
                existingPBs[key] = {
                    metric: pb.metric,
                    value: pb.value,
                    equipment: ex.selectedEquipment
                }
            }
        })
    })

    return existingPBs
}

const detectPersonalBests = (exercises, existingPBs) => {
    const newPBs = []
    const firstLifts = []
    // Best values so far, including earlier entries in this same workout
    const bestSoFar = { ...existingPBs }
    const pbIndexByKey = {}
    const firstLiftKeys = new Set()

    exercises.forEach(exercise => {
        const name = exercise.name.trim().toLowerCase()
        const key = buildPBKey(name, exercise.selectedEquipment)

        const pb = getPBMetric(exercise.trackingMode, exercise.sets)
        if (!pb || pb.value === 0) return

        // Already counted as a first lift in this workout
        if (firstLiftKeys.has(key)) return

        const existingPB = bestSoFar[key]

        if (!existingPB) {
            firstLiftKeys.add(key)
            firstLifts.push({ exercise: exercise.name, equipment: exercise.selectedEquipment })
            bestSoFar[key] = { metric: pb.metric, value: pb.value }
            return
        }

        if (pb.value >= existingPB.value + getMinPBIncrease(pb.metric, existingPB.value)) {
            if (pbIndexByKey[key] !== undefined) {
                // Same exercise logged twice: keep a single PB with the best value
                newPBs[pbIndexByKey[key]].newValue = pb.value
            } else {
                pbIndexByKey[key] = newPBs.length
                newPBs.push({
                    exercise: exercise.name,
                    equipment: exercise.selectedEquipment,
                    metric: pb.metric,
                    previousValue: existingPB.value,
                    newValue: pb.value
                })
            }
            bestSoFar[key] = { metric: pb.metric, value: pb.value }
        }
    })

    return { personalBests: newPBs, firstLifts }
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

    const workoutHistory = await Workout.find(
        {
            user: user._id,
            _id: { $ne: workout._id }
        },
        {
            createdAt: 1,
            'summary.totalWeight': 1,
            'summary.totalStrivePoints.total': 1,
            'exercises.exercise': 1,
            'exercises.selectedEquipment': 1,
            'exercises.sets': 1
        }
    )
    .populate('exercises.exercise', 'name trackingMode')
    .sort({ createdAt: -1 })
    .lean()

    const existingPBs = getExistingPBs(workoutHistory)

    const eligible = isWorkoutEligibleForSP(totalSets, workout.duration)

    // Tiny workouts are saved but earn nothing: no SP, PBs, first lifts or quest progress
    const { questsCompleted, totalQuestSP, questUpdates } = eligible
        ? await detectQuestCompletion(user._id, exercises, workout)
        : { questsCompleted: [], totalQuestSP: 0, questUpdates: [] }

    const { personalBests, firstLifts } = eligible
        ? detectPersonalBests(exercises, existingPBs)
        : { personalBests: [], firstLifts: [] }

    const totalStrivePoints = eligible
        ? await calculateTotalStrivePoints(workoutHistory, existingPBs, user, workout, exercises, personalBests, firstLifts, totalWeight, totalQuestSP)
        : { total: 0, totalQuestSP: 0, personalBestsReward: 0, firstLiftsReward: 0, bonus: 0 }

    return {
        summary: {
            totalWeight,
            totalReps,
            totalSets,
            totalExercises,
            totalDistance,
            totalDuration,
            totalStrivePoints,
            questsCompleted,
            personalBests,
            firstLifts,
            ...(eligible ? {} : { noSPReason: NO_SP_REASON })
        },
        questUpdates
    }
}

module.exports = { calculateWorkoutSummary }