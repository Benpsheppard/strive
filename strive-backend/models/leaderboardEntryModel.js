// leaderboardEntryModel.js

const mongoose = require('mongoose')

const leaderboardEntrySchema = mongoose.Schema({
    // User
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, 'Missing user']
    },
    // Week start
    weekStart: {
        type: Date,
        required: [true, 'Missing week start']
    },
    // Metrics to rank users
    totalSP: { type: Number, default: 0 },
    totalVolumeSP: { type: Number, default: 0 },
    totalStrengthSP: { type: Number, default: 0 },
    totalProgressionSP: { type: Number, default: 0 },
    // Number of workouts completed in the week
    workoutCount: {
        type: Number,
        required: [true, 'Missing workout count'],
        default: 0
    }
})

module.exports = mongoose.model('LeaderboardEntry', leaderboardEntrySchema)