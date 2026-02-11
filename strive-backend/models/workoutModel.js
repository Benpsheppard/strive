// workoutModel.js
// File to create workout schema

// Imports
const mongoose = require('mongoose')   // import mongoose

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
            'Arms', 'Legs', 'Core', 
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
    exercises: [exerciseSchema]
}, {
    timestamps: true
})

module.exports = mongoose.model('Workout', workoutSchema)