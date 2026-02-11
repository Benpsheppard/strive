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
    // Completion data
    completion: {
        exercise: { 
            type: String, 
            required: true 
        },
        weight: { 
            type: Number, 
            required: true 
        },
        reps: { 
            type: Number,
            enum: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
            required: true 
        }
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Quest', questSchema)