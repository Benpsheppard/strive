// workoutModel.js

// Imports
const mongoose = require('mongoose')

// Exercise Schema
const exerciseSchema = mongoose.Schema({
    // Name
    name: {
        type: String,
        required: [true, 'Please add an exercise name']
    },
    // Muscle Group
    musclegroup: {
        type: String,
        enum: [
            'Chest', 'Back', 'Shoulders',
            'Biceps', 'Triceps', 'Legs', 'Core', 
            'Full body', 'Other'
        ],
        default: 'Other',
        required: [true, 'Please add a muscle group e.g. Chest']
    },
    // Description
    description: {
        type: String
    },
    sets: [
        {
            weight: { type: Number, required: [true, 'Please add a weight value'] },
            reps: { type: Number, required: [true, 'Please add a reps value'] }
        }
    ] 
}, {
    timestamps: true
})

// Summary Schema
const summarySchema = mongoose.Schema({
    // Total weight
    totalWeight: {
        type: Number,
        required: [true, 'Please add a total weight value']
    },
    // Total reps    
    totalReps: {
        type: Number,
        required: [true, 'Please add a total reps value']
    },
    // Total sets
    totalSets: {
        type: Number,
        required: [true, 'Please add a total sets value']
    },
    // Total exercises
    totalExercises: {
        type: Number,
        required: [true, 'Please add a total exercises value']
    },
    // Total SP earned 
    totalStrivePoints: {
        type: Number,
        required: [true, 'Please add a total SP value']
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
    exercises: [exerciseSchema],
    // Summary
    summary: summarySchema
}, {
    timestamps: true
})

module.exports = mongoose.model('Workout', workoutSchema)