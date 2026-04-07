// workoutSummary.js

// Imports
const Workout = require('../models/workoutModel')
const Quest = require('../models/questModel')

const REP_BUFFER = 2  // Allow a small buffer for quest completion

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
            s.weight >= weight && s.reps >= reps - REP_BUFFER
        )
    },

    consistency: async (quest, exercises, workout) => {
        const { filterTag, targetCount } = quest.completion

        // If a filterTag is set, at least one exercise in the workout must match it
        if (filterTag) {
            const tag = filterTag.toLowerCase().trim()
            const matches = exercises.some(e =>
                e.muscleGroup?.toLowerCase() === tag ||
                e.name.toLowerCase().trim() === tag
            )

            if (!matches) {
                return false
            }
        }

        // Guard: don't count the same workout twice
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

        // Sum volume from matching exercises only
        let sessionVolume = 0
        for (const ex of exercises) {
            const tag = filterTag?.toLowerCase().trim()
            const nameMatches = !tag || ex.name.toLowerCase().trim() === tag
            const groupMatches = !tag || ex.muscleGroup?.toLowerCase() === tag

            if (nameMatches || groupMatches) {
                for (const set of ex.sets) {
                    sessionVolume += (Number(set.weight) || 0) * (Number(set.reps) || 0)
                }
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

        console.log('Previous vol: ', quest.completion.currentVolume)
        const newVolume = quest.progressLog.reduce((sum, p) => sum + (p.value || 0), 0)
        quest.set('completion.currentVolume', newVolume)
        console.log('New vol: ', quest.completion.currentVolume)

        await quest.save()
        return quest.completion.currentVolume >= targetVolume
    },

    progressive: (quest, exercises) => {
        const { exercise, metric, baseline } = quest.completion

        const match = exercises.find(e =>
            e.name.toLowerCase().trim() === exercise.toLowerCase().trim()
        )

        if (!match) {
            return false
        }

        if (metric === 'max_weight') {
            const best = Math.max(...match.sets.map(s => Number(s.weight) || 0))
            return best > baseline
        }
        if (metric === 'max_reps') {
            const best = Math.max(...match.sets.map(s => Number(s.reps) || 0))
            return best > baseline
        }
        if (metric === 'session_volume') {
            const vol = match.sets.reduce((sum, s) =>
                sum + (Number(s.weight) || 0) * (Number(s.reps) || 0), 0
            )
            return vol > baseline
        }
        return false
    }
}

// Detect personal bests for a user based on the new workout
const detectPersonalBests = async (userId, exercises) => {
    const existingWorkouts = await Workout.find({ user: userId })

    // Build PBs from previous workouts
    const existingPBs = {}
    existingWorkouts.forEach(workout => {
        workout.exercises.forEach(exercise => {
            const name = exercise.name.trim().toLowerCase()
            exercise.sets.forEach(set => {
                const weight = Number(set.weight) || 0
                if (!existingPBs[name] || weight > existingPBs[name].weight) {
                    existingPBs[name] = { weight }
                }
            })
        })
    })

    // Compare with new workout
    const newPBs = []
    exercises.forEach(exercise => {
        const name = exercise.name.trim().toLowerCase()
        const maxWeightInWorkout = Math.max(...exercise.sets.map(set => Number(set.weight) || 0))

        const existingPB = existingPBs[name]
        if (!existingPB || maxWeightInWorkout > existingPB.weight) {
            newPBs.push({
                exercise: exercise.name,
                metric: 'weight',
                previousValue: existingPB ? existingPB.weight : 0,
                newValue: maxWeightInWorkout
            })
        }
    })

    return newPBs
}

// Check for quest completion
const detectQuestCompletion = async (userId, exercises, workout) => {
    const activeQuests = await Quest.find({ user: userId, status: 'active' })
    const questsCompleted = []
    let totalQuestSP = 0

    for (const quest of activeQuests) {
        const checker = questCheckers[quest.questType ?? 'strength']

        if (!checker) {
            continue
        }

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

// Calculate full workout summary, including PBs and total SP
const calculateWorkoutSummary = async (userId, exercises, workout) => {
    let totalWeight = 0
    let totalReps = 0
    let totalSets = 0

    exercises.forEach(exercise => {
        exercise.sets.forEach(set => {
            totalWeight += set.weight * set.reps
            totalReps += set.reps
            totalSets += 1
        })
    })

    const totalExercises = exercises.length

    const personalBests = await detectPersonalBests(userId, exercises)
    const { questsCompleted, totalQuestSP } = await detectQuestCompletion(userId, exercises, workout)

    const totalStrivePoints = 200 + totalQuestSP + personalBests.length * 500

    return {
        totalWeight,
        totalReps,
        totalSets,
        totalExercises,
        totalStrivePoints,
        questsCompleted,
        personalBests
    }
}

module.exports = {
    calculateWorkoutSummary
}