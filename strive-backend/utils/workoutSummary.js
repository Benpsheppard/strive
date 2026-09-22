// workoutSummary.js

// Imports
const Workout = require('../models/workoutModel')
const Quest = require('../models/questModel')
const { getStartOfWeek, getEndOfWeek } = require('./dateFormat')
const { getWorkoutsThisWeek } = require('./workoutServices')

const REP_BUFFER = 2

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

    // Calculate score
    const score = totalWeight / averageTotalWeight

    // Calculate reward
    const reward = getReward(score)

    return {
        volumeReward: reward,
        volumeScore: score
    }
}

const calculateStrengthPoints = async (workoutHistory, exercises) => {
    const exerciseIds = exercises.map(e => e.exerciseId)
    const recentWorkouts = workoutHistory
        .filter(w => w.exercises.some(ex => exerciseIds.includes(ex.exerciseId)))
        .slice(0, 15)

    if (recentWorkouts.length < 5) {
        return { strengthReward: 40, strengthScore: 1 }
    }

    let runningTotal = 0
    let matchedExerciseCount = 0

    exercises.forEach(exercise => {
        const currentMax = Math.max(...exercise.sets.map(s => Number(s.weight) || 0))
        if (currentMax === 0) {
            return
        }

        let exerciseHistoryTotal = 0
        let exerciseHistoryCount = 0

        recentWorkouts.forEach(recentWorkout => {
            const match = recentWorkout.exercises.find(e => e.exerciseId === exercise.exerciseId)

            if (match) {
                const recentMax = Math.max(...match.sets.map(s => Number(s.weight) || 0))

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
    if (recentWorkouts.length === 0) {
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

const calculateTotalStrivePoints = async (workoutHistory, existingPBs, user, workout, exercises, personalBests, totalWeight, totalQuestSP) => {
    const momentumMultiplier = getMomentumMultiplier(user.momentum.current)
    const { progressionReward, progressionScore } = calculateProgressionPoints(existingPBs, exercises, personalBests)
    const [{ volumeReward, volumeScore }, { strengthReward, strengthScore }, consistencyMultiplier] = await Promise.all([
        calculateVolumePoints(workoutHistory, totalWeight),
        calculateStrengthPoints(workoutHistory, exercises),
        calculateConsistencyMultiplier(workoutHistory)
    ])

    const personalBestsReward = personalBests.length * 500

    const workoutsThisWeek = await getWorkoutsThisWeek(user, workout.createdAt)

    const target = user.target
    const targetReached = workoutsThisWeek === target
    const targetBonus = targetReached ? getWeeklyBonus(target) : 0

    const completeReward = Math.ceil((volumeReward + strengthReward + progressionReward) * consistencyMultiplier)
    const total = Math.ceil((completeReward + totalQuestSP + personalBestsReward + targetBonus) * momentumMultiplier)
    
    return {
        total,
        volume: { reward: volumeReward, score: volumeScore },
        strength: { reward: strengthReward, score: strengthScore },
        progression: { reward: progressionReward, score: progressionScore },
        consistencyMultiplier,
        momentumMultiplier,
        totalQuestSP,
        personalBestsReward,
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
            return { metric: 'max_reps', value: Math.max(0, ...sets.map(s => Number(s.reps) || 0)) }
        case 'duration':
            return { metric: 'best_duration', value: Math.max(0, ...sets.map(s => Number(s.duration) || 0)) }
        case 'distance_duration':
            return { metric: 'total_distance', value: getTotalDistance(sets) }
        default:
            return null
    }
}

const buildPBKey = (name, equipment) => {
    const normalizedEquipment = (equipment || 'unspecified').trim().toLowerCase()
    return `${name}||${normalizedEquipment}`
}

// const getExistingPBs = async (userId, workout) => {
//     const existingWorkouts = await Workout.find({ 
//         user: userId,
//         _id: { $ne: workout._id }
//     },
//     {
//         'exercises.exercise': 1,
//         'exercises.selectedEquipment': 1,
//         'exercises.sets': 1
//     })
//     .populate('exercises.exercise', 'name trackingMode')
//     .lean()

//     const existingPBs = {}
//     existingWorkouts.forEach(workout => {
//         workout.exercises.forEach(ex => {
//             const name = ex.exercise?.name?.trim().toLowerCase()
//             const trackingMode = ex.exercise?.trackingMode
//             if (!name || !trackingMode) return

//             const key = buildPBKey(name, ex.selectedEquipment)

//             const pb = getPBMetric(trackingMode, ex.sets)
//             if (!pb || pb.value === 0) return

//             if (!existingPBs[key] || pb.value > existingPBs[key].value) {
//                 existingPBs[key] = { metric: pb.metric, value: pb.value, equipment: ex.selectedEquipment }
//             }
//         })
//     })

//     return existingPBs
// }

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
    
    exercises.forEach(exercise => {
        const name = exercise.name.trim().toLowerCase()
        const key = buildPBKey(name, exercise.selectedEquipment)

        const pb = getPBMetric(exercise.trackingMode, exercise.sets)
        if (!pb || pb.value === 0) return

        const existingPB = existingPBs[key]

        if (!existingPB || pb.value > existingPB.value) {
            newPBs.push({
                exercise: exercise.name,
                equipment: exercise.selectedEquipment,
                metric: pb.metric,
                previousValue: existingPB ? existingPB.value : 0,
                newValue: pb.value
            })
        }
    })

    return newPBs
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
                reward: quest.reward,
                duration: quest.duration
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

    const workoutHistory = await Workout.find(
        {
            user: user._id,
            _id: { $ne: workout._id }
        },
        {
            createdAt: 1,
            'summary.totalWeight': 1,
            'exercises.exercise': 1,
            'exercises.selectedEquipment': 1,
            'exercises.sets': 1
        }
    )
    .populate('exercises.exercise', 'name trackingMode')
    .sort({ createdAt: -1 })
    .lean()

    const existingPBs = getExistingPBs(workoutHistory)

    const { questsCompleted, totalQuestSP } = await detectQuestCompletion(user._id, exercises, workout)

    const personalBests = detectPersonalBests(exercises, existingPBs)

    const totalStrivePoints = await calculateTotalStrivePoints(workoutHistory, existingPBs, user, workout, exercises, personalBests, totalWeight, totalQuestSP)

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