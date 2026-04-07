// questModel.js

// Imports
const mongoose = require('mongoose')

// Quest Schema
const questSchema = mongoose.Schema({
    // User
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    // Title
    title: {
        type: String,
        required: [true, 'Missing title']
    },
    //Duration
    duration: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
        required: [true, 'Missing duration e.g. daily']
    },
    // Reward: dependant on duration
    reward: {
        type: Number,
        default: function() {
            const scale = { daily: 100, weekly: 500, monthly: 1000 }
            return scale[this.duration] || 10
        },
    },
    // Description
    description: {
        type: String,
        required: [true, 'Missing description']
    },
    // Status
    status: {
        type: String,
        enum: [
            'completed',
            'expired',
            'active',
            'claimed'
        ],
        default: 'active'
    },
    // Expiry date
    expiry: {
        type: Date,
        required: [true, 'Missing end date']
    },
    // Quest type
    questType: {
        type: String,
        enum: ['strength', 'consistency', 'volume', 'progressive'],
        required: [true, 'Missing quest type'],
        default: 'strength'
    },
    // Completion data
    completion: {
        type: mongoose.Schema.Types.Mixed,
        required: [true, 'Missing completion data']
    },
    // Progress log
    progressLog: [
        {
            workoutId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Workout",
            },
            loggedAt: {
                type: Date,
            },
            value: {
                type: Number
            }
        }
    ]
}, {
    timestamps: true
})

module.exports = mongoose.model('Quest', questSchema)

// Strength - exercise, weight, reps
// Consistency - targetCount, currentCount, filterTag
// Volume - targetVolume, currentVolume, filterTag
// Progressive - exercise, metric, baseline