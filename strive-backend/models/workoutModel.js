// workoutModel.js

// Imports
const mongoose = require('mongoose')

// Summary Schema
const summarySchema = mongoose.Schema({
    // Total weight
    totalWeight: {
        type: Number,
    },
    // Total reps    
    totalReps: {
        type: Number,
    },
    // Total sets
    totalSets: {
        type: Number,
    },
    // Total duration
    totalDuration: {
        type: Number,
    },
    // Total distance
    totalDistance: {
        type: Number
    },
    // Total exercises
    totalExercises: {
        type: Number,
    },
    // Total SP earned 
    totalStrivePoints: {
        total: {
            type: Number,
            default: 0
        },
        volume: {
            reward: { type: Number },
            score: { type: Number },
        },
        strength: {
            reward: { type: Number },
            score: { type: Number },
        },
        progression: {
            reward: { type: Number },
            score: { type: Number },
        },
        consistencyMultiplier: {
            type: Number,
            default: 1
        },
        momentumMultiplier: {
            type: Number,
            default: 1
        },
        totalQuestSP: {
            type: Number,
            default: 0
        },
        personalBestsReward: {
            type: Number,
            default: 0
        }
    },
    // Quests Completed
    questsCompleted: [
        {
            questId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Quest'
            },
            title: {
                type: String,
                required: true
            },
            reward: {
                type: Number,
                required: true
            }
        }
    ],
    // Personal Bests
    personalBests: [
        {
            exercise: {
                type: String
            },
            metric: {
                type: String
            },
            previousValue: {
                type: Number
            },
            newValue: {
                type: Number
            }
        }
    ]
})

// Workout Schema
const workoutSchema = mongoose.Schema({
    // User
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        // required: true
    },
    // Title
    title: {
        type: String,
        required: [true, 'Please add a title']
    },
    // Date
    date: {
        type: Date,
        default: Date.now
    },
    // Duration
    duration: {
        type: Number,
        required: [true, 'Timer error']
    },
    // Exercises
    exercises: [
        {
            exercise: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Exercise',
                required: [true, 'Please add at least one exercise']
            },
            selectedEquipment: {
                type: String,
                required: [true, 'Missing selected equipment']
            },
            sets: [
                {
                    weight: { type: Number },
                    reps: { type: Number },
                    duration: { type: Number },
                    distance: { type: Number },
                    addedWeight: { type: Number },
                    assistance: { type: Number }
                }
            ]
        }
    ],
    // Summary
    summary: summarySchema
}, {
    timestamps: true
})

module.exports = mongoose.model('Workout', workoutSchema)