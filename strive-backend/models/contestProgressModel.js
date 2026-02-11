// contestProgressModel.js

// Imports
const mongoose = require('mongoose')

const contestProgressSchema = mongoose.Schema({
    // User reference
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please add a user']
    },
    // Contest reference
    contest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contest',
        required: [true, 'Please add a contest']
    },
    // User's starting stats
    baselineVol: {
        type: Number,
        required: [true, 'Please add a baseline volume'],
        default: 0
    },
    // User's current stats
    currentVol: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('ContestProgress', contestProgressSchema)