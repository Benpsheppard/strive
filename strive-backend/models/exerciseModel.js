// exerciseModel.js

const mongoose = require('mongoose')

const {
    MUSCLE_GROUPS: muscleGroups,
    SUB_MUSCLE_GROUPS: subMuscleGroups,
    EQUIPMENT: equipment,
    TRACKING_MODES: trackingModes,
    generateSlug
} = require('./exerciseOptions')

// Exercise Schema
const exerciseSchema = mongoose.Schema({
    // Name
    name: {
        type: String,
        required: [true, 'Missing exercise name'],
        trim: true
    },
    // Slug / Unique identifier
    slug: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true,
        required: [true, 'Missing exercise slug']
    },
    // Muscle Group
    muscleGroup: {
        type: String,
        enum: muscleGroups,
        default: 'Other',
        required: [true, 'Missing muscle group']
    },
    // Sub muscle group
    subMuscleGroup: {
        type: String,
        enum: subMuscleGroups,
        default: 'Other',
        required: [true, 'Missing sub muscle group']
    },
    // Secondary muscle group(s)
    secondaryMuscleGroups: [
        {
            type: String,
            enum: subMuscleGroups,
        }
    ],
    // Equipment
    equipment: [
        {
            type: String,
            enum: equipment,
            default: ['Other'],
            required: [true, 'Missing equipment']
        }
    ],
    // Tracking Mode
    trackingMode: {
        type: String,
        enum: trackingModes,
        default: 'other',
        required: [true, 'Missing tracking mode']
    },
    // Custom exercise flag
    isCustom: {
        type: Boolean,
        default: false
    },
    // Created by user reference
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }
}, {
    timestamps: true
})

exerciseSchema.pre('validate', async function() {
    if (this.isNew || this.isModified('name')) {
        const baseSlug = generateSlug(this.name)
        // Custom exercises are scoped to their creator so two users can use the same name
        this.slug = this.isCustom && this.createdBy ? `${this.createdBy}_${baseSlug}` : baseSlug
    }
})

module.exports = mongoose.model('Exercise', exerciseSchema)