// exerciseModel.js

const mongoose = require('mongoose')

const muscleGroups = [
    'Chest', 'Back', 'Shoulders', 
    'Arms', 'Legs', 'Core', 
    'Cardio', 'Full body', 'Other'
]
const subMuscleGroups = [
    'Upper chest', 'Mid chest','Lower chest',
    'Lats', 'Traps', 'Rear delts', 'Upper back', 'Mid back', 'Lower back',
    'Front delts', 'Side delts',
    'Biceps', 'Triceps', 'Forearms',
    'Quads', 'Hamstrings', 'Glutes', 'Calves', 'Adductors', 'Abductors',
    'Abs', 'Lower abs', 'Obliques',
    'Mobility', 'Cardio', 'Rehab', 'Other'
]
const equipment = [
    'Barbell', 'Dumbbell', 'Machine', 'Smith Machine',
    'Bodyweight', 'Kettlebell', 'Cable', 
    'Bike', 'Treadmill', 'Stepper', 'Rowing machine', 
    'Other'
]
const trackingModes = [
    'weight_reps', 'bodyweight_reps', 
    'assisted_reps', 'reps', 
    'duration', 'distance', 'distance_duration', 
    'distance_weight', 'other'
]

const generateSlug = (name) => {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
}

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
        this.slug = generateSlug(this.name)
    }
})

module.exports = mongoose.model('Exercise', exerciseSchema)