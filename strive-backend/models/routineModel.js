// routineModel.js
// A saved list of exercises to start a workout from. It holds which exercises (and optionally
// the equipment) but never sets or weights: those are entered fresh each session.

const mongoose = require('mongoose')

const routineSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Please add a routine name'],
        trim: true,
        maxlength: 60
    },
    // The order here is the order they are queued in
    exercises: [
        {
            exercise: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Exercise',
                required: true
            },
            // A suggestion only; the user can change it when logging
            selectedEquipment: {
                type: String,
                trim: true
            }
        }
    ]
}, {
    timestamps: true
})

routineSchema.index({ user: 1, updatedAt: -1 })

module.exports = mongoose.model('Routine', routineSchema)
