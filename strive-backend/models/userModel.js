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
    useImperial: {
        type: Boolean,
        default: false
    },
    isGuest: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);