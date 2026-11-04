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
        },
        firstLiftsReward: {
            type: Number,
            default: 0
        },
        bonus: {
            type: Number,
            default: 0
        },
        // True when the daily SP cap reduced this workout's SP
        dailyCapReached: {
            type: Boolean,
            default: false
        }
    },
    // Why this workout earned no SP (too small), if so
    noSPReason: {
        type: String
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
            },
            duration: {
                type: String,
                enum: ['daily', 'weekly', 'monthly'],
                required: true
            },
        }
    ],
    // First time an exercise/equipment pair was logged (rewarded, but not a PB)
    firstLifts: [
        {
            exercise: { type: String },
            equipment: { type: String }
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
            },
            equipment: {
                type: String
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
    // Id made by the app when the workout starts, used to make saving safe to retry
    clientId: {
        type: String,
        trim: true
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

// Index
workoutSchema.index({ user: 1, createdAt: -1 })
// One saved workout per client-generated id, so a retried or double-sent save can't create a second
workoutSchema.index({ user: 1, clientId: 1 }, { unique: true, partialFilterExpression: { clientId: { $type: 'string' } } })
// Finding the history of the exercises in a workout
workoutSchema.index({ user: 1, 'exercises.exercise': 1 })

module.exports = mongoose.model('Workout', workoutSchema)