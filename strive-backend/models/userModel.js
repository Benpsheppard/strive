// userModel.js
// File to create user schema

// Imports
const mongoose = require('mongoose');      // import mongoose

// User schema
const userSchema = mongoose.Schema ({
    // Username
    username: {
        type: String,
        required: [true, 'Please add a username'],
        unique: [true, 'Username already exists']
    },
    // Email
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: [true, 'Email already linked to an account'],
    },
    // Password
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6
    },
    // Workouts
    workouts: [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Workout"
        }
    ],
    // User level
    level: {
        type: Number,
        default: 1
    },
    // User SP points
    strivepoints: {
        type: Number,
        default: 0
    },
    // User unit preference
    useImperial: {
        type: Boolean,
        default: false
    },
    // Guest account flag
    isGuest: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);