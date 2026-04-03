// workoutSummary.js

// Imports
const Workout = require('../models/workoutModel')
const Quest = require('../models/questModel')

const REP_BUFFER = 2  // Allow a small buffer for quest completion

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
const detectQuestCompletion = async (userId, exercises) => {
    const activeQuests = await Quest.find({ user: userId, status: 'active' })
    const questsCompleted = []
    let totalQuestSP = 0

    for (const quest of activeQuests) {
        const { exercise, weight, reps } = quest.completion
        const normalizedQuestExercise = exercise.toLowerCase().trim()

        const match = exercises.find(e => e.name.toLowerCase().trim() === normalizedQuestExercise)
        if (!match) continue

        const completed = match.sets.some(s => s.weight >= weight && s.reps >= reps - REP_BUFFER)
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
const calculateWorkoutSummary = async (userId, exercises) => {
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
    const { questsCompleted, totalQuestSP } = await detectQuestCompletion(userId, exercises)

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