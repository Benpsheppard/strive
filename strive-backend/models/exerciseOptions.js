// exerciseOptions.js
// Allowed values for exercise fields, shared by the model, controller and seed script

const MUSCLE_GROUPS = [
    'Chest', 'Back', 'Shoulders',
    'Arms', 'Legs', 'Core',
    'Cardio', 'Full body', 'Other'
]

const SUB_MUSCLE_GROUPS = [
    'Upper chest', 'Mid chest', 'Lower chest',
    'Lats', 'Traps', 'Rear delts', 'Upper back', 'Mid back', 'Lower back',
    'Front delts', 'Side delts',
    'Biceps', 'Triceps', 'Forearms',
    'Quads', 'Hamstrings', 'Glutes', 'Calves', 'Adductors', 'Abductors',
    'Abs', 'Lower abs', 'Obliques',
    'Mobility', 'Cardio', 'Rehab', 'Other'
]

const EQUIPMENT = [
    'Barbell', 'Dumbbell', 'Machine', 'Smith Machine',
    'Bodyweight', 'Kettlebell', 'Cable',
    'Bike', 'Treadmill', 'Stepper', 'Rowing machine',
    'Other'
]

const TRACKING_MODES = [
    'weight_reps', 'bodyweight_reps',
    'assisted_reps', 'reps',
    'duration', 'distance', 'distance_duration',
    'distance_weight', 'other'
]

// Modes the app can log. Custom exercises must use one of these.
const LOGGABLE_TRACKING_MODES = [
    'weight_reps', 'bodyweight_reps', 'assisted_reps', 'reps',
    'duration', 'distance', 'distance_duration'
]

const generateSlug = (name) => name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')

module.exports = {
    MUSCLE_GROUPS,
    SUB_MUSCLE_GROUPS,
    EQUIPMENT,
    TRACKING_MODES,
    LOGGABLE_TRACKING_MODES,
    generateSlug
}
