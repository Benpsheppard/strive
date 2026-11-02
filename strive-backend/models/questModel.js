// questModel.js

// Imports
const mongoose = require('mongoose')
const { QUEST_CONFIG } = require('../utils/quests/config')

const questCompletionSchema = new mongoose.Schema({
    selectedEquipment: {
        type: String
    }
}, {
    _id: false,
    strict: false
})

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
            return QUEST_CONFIG[this.duration]?.reward || 10
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
        type: questCompletionSchema,
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

// Looked up on every workout (active quests) and every quest fetch (non-expired quests)
questSchema.index({ user: 1, status: 1, expiry: 1 })

module.exports = mongoose.model('Quest', questSchema)

// Type-specific completion fields are documented in utils/quests/types/
