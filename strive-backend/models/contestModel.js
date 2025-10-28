// contestModel.js

// Imports 
const mongoose = require('mongoose');

// Contest Schema
const contestSchema = mongoose.Schema({
    // Name
    name: {
        type: String
    },
    // Description
    description: {
        type: String
    },
    // Muscle Groups involved in contest
    musclegroups: [
        {
            type: String
        }
    ],
    // Reward
    reward: {
        first: {
            type: Number,
            default: 2000
        },
        second: {
            type: Number,
            default: 1500
        },
        third: {
            type: Number,
            default: 1000
        }
    },
    // Month of the year
    month: {
        type: String,
        enum: [
            'jan', 'feb', 'mar', 
            'apr', 'may', 'jun',
            'jul', 'aug', 'sep', 
            'oct', 'nov', 'dec'
        ]
    },
    // Active
    active: {
        type: Boolean
    }
})

// Export
module.exports = mongoose.model('Contest', contestSchema);