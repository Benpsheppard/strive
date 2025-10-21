// questModel.js

// Imports
const mongoose = require('mongoose');

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
        required: [true, 'Please add a title']
    },
    //Duration
    duration: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
        required: [true, 'Please add a duration e.g. daily']
    },
    // Difficulty
    difficulty: {
        type: String,
        enum: [
            'light', 'easy', 'medium', 'hard', 'impossible'
        ],
        required: [true, 'Please add a difficulty e.g. hard'],
        lowercase: true
    },
    // Reward: dependant on difficulty
    reward: {
        type: Number,
        default: function() {
            const scale = { light: 100, easy: 200, medium: 500, hard: 750, impossible: 1000 };
            return scale[this.difficulty] || 10;
        },
    },
    // Description
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    // Status
    status: {
        type: String,
        enum: [
            'completed',
            'expired',
            'active'
        ],
        default: 'active'
    },
    // Expiry date
    expiry: {
        type: Date,
        required: [true, 'Please add an end date']
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
            required: true 
        }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Quest', questSchema);