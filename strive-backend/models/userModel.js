// userModel.js

// Imports
const mongoose = require('mongoose')

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
        minlength: 8
    },
    // Email confirmed by clicking the emailed link (a nudge, not a requirement to use the app)
    emailVerified: {
        type: Boolean,
        default: false
    },
    // Bumped on password change or reset; older sessions stop working
    tokenVersion: {
        type: Number,
        default: 0
    },
    // Terms of use consent
    acceptedTermsAt: {
        type: Date,
        default: null
    },
    termsVersion: {
        type: String,
        default: null
    },
    // Hashed single-use tokens (never returned by default)
    passwordResetTokenHash: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    emailVerifyTokenHash: { type: String, select: false },
    emailVerifyExpires: { type: Date, select: false },
    // Workouts
    workouts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Workout"
        }
    ],
    // Most recent workout date
    lastWorkout: {
        type: Date,
        default: null
    },
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
    // Momentum
    momentum: {
        current: {
            type: Number,
            default: 30,
            min: 0,
            max: 100
        },
        lastCalculated: {
            type: Date,
            default: null
        }
    },
    // Streak
    streak: {
        current: {
            type: Number,
            default: 0
        },
        shield: {
            type: Boolean,
            default: false
        },
        lastEvaluatedWeek: {
            type: String,
            default: null
        },
        lastIncrementedWeek: {
            type: String,
            default: null
        },
        best: {
            type: Number,
            default: 0
        }
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
    },
    // Consistency Target
    target: {
        type: Number,
        default: 3
    },
    // Height
    height: {
        feet: {
            type: Number,
            default: 5,
            min: 4,
            max: 7
        },
        inches: {
            type: Number,
            default: 8,
            max: 12
        }
    },
    // Weight
    weight: {
        type: Number,
        default: 0,
        min: 0
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('User', userSchema)