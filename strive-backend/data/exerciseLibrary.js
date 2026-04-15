// exerciseLibrary.js

const exercises = [
    // Chest - 4
    {
        name: 'Bench Press',
        muscleGroup: 'Chest',
        subMuscleGroup: 'Mid chest',
        equipment: ['Barbell', 'Smith Machine', 'Dumbbell'],
        trackingMode: 'weight_reps'
    },
    {
        name: 'Incline Bench Press',
        muscleGroup: 'Chest',
        subMuscleGroup: 'Upper chest',
        equipment: ['Barbell', 'Dumbbell', 'Smith Machine'],
        trackingMode: 'weight_reps'
    },
    {
        name: 'Chest Fly',
        muscleGroup: 'Chest',
        subMuscleGroup: 'Mid chest',
        equipment: ['Cable', 'Machine'],
        trackingMode: 'weight_reps'
    },
    {
        name: 'Chest Press',
        muscleGroup: 'Chest',
        subMuscleGroup: 'Mid chest',
        equipment: ['Machine'],
        trackingMode: 'weight_reps'
    },
    {
        name: 'Push Up',
        muscleGroup: 'Chest',
        subMuscleGroup: 'Mid chest',
        equipment: ['Bodyweight'],
        trackingMode: 'bodyweight_reps'
    },
    // Back - 3
    {
        name: 'T-Bar Row',
        muscleGroup: 'Back',
        subMuscleGroup: 'Mid back',
        equipment: ['Machine', 'Barbell'],
        trackingMode: 'weight_reps'
    },
    {
        name: 'Seated Cable Row',
        muscleGroup: 'Back',
        subMuscleGroup: 'Mid back',
        equipment: ['Cable', 'Machine'],
        trackingMode: 'weight_reps'
    },
    {
        name: 'Kneeling Cable Row',
        muscleGroup: 'Back',
        subMuscleGroup: 'Mid back',
        equipment: ['Cable'],
        trackingMode: 'weight_reps'
    },
    {
        name: 'Lat Pulldown',
        muscleGroup: 'Back',
        subMuscleGroup: 'Lats',
        equipment: ['Cable', 'Machine'],
        trackingMode: 'weight_reps'
    },
    {
        name: 'Pull Up',
        muscleGroup: 'Back',
        subMuscleGroup: 'Lats',
        equipment: ['Bodyweight'],
        trackingMode: 'bodyweight_reps'
    },
    // Shoulders - 3
    {
        name: 'Rear Delt Fly',
        muscleGroup: 'Shoulders',
        subMuscleGroup: 'Rear delts',
        equipment: ['Machine', 'Cable'],
        trackingMode: 'weight_reps'
    },
    {
        name: 'Lateral Raise',
        muscleGroup: 'Shoulders',
        subMuscleGroup: 'Side delts',
        equipment: ['Dumbbell', 'Cable'],
        trackingMode: 'weight_reps'

    },
    {
        name: 'Shoulder Press',
        muscleGroup: 'Shoulders',
        subMuscleGroup: 'Front delts',
        equipment: ['Dumbbell', 'Barbell', 'Machine', 'Smith Machine'],
        trackingMode: 'weight_reps'
    },
    // Arms - 8
    {
        name: 'Jm Press',
        muscleGroup: 'Arms',
        subMuscleGroup: 'Triceps',
        equipment: ['Smith Machine'],
        trackingMode: 'weight_reps'
    },
    {
        name: 'Tricep Pushdown',
        muscleGroup: 'Arms',
        subMuscleGroup: 'Triceps',
        equipment: ['Cable', 'Machine'],
        trackingMode: 'weight_reps'
    },
    {
        name: 'Single-Arm Tricep Pushdown',
        muscleGroup: 'Arms',
        subMuscleGroup: 'Triceps',
        equipment: ['Cable'],
        trackingMode: 'weight_reps'
    },
    {
        name: 'Skull Crushers',
        muscleGroup: 'Arms',
        subMuscleGroup: 'Triceps',
        equipment: ['Cable', 'Barbell'],
        trackingMode: 'weight_reps'
    },
    {
        name: 'Bicep Curl',
        muscleGroup: 'Arms',
        subMuscleGroup: 'Biceps',
        equipment: ['Dumbbell', 'Barbell', 'Cable'],
        trackingMode: 'weight_reps'
    },
    {
        name: 'Hammer Curl',
        muscleGroup: 'Arms',
        subMuscleGroup: 'Biceps',
        equipment: ['Dumbbell', 'Cable'],
        trackingMode: 'weight_reps'
    },
    {
        name: 'Forearm Curl',
        muscleGroup: 'Arms',
        subMuscleGroup: 'Forearms',
        equipment: ['Dumbbell', 'Barbell', 'Cable'],
        trackingMode: 'weight_reps'
    },
    // Legs - 8
    {
        name: 'Squat',
        muscleGroup: 'Legs',
        subMuscleGroup: 'Quads',
        equipment: ['Barbell', 'Smith Machine'],
        trackingMode: 'weight_reps'
    },
    {
        name: 'Romanian Deadlift',
        muscleGroup: 'Legs',
        subMuscleGroup: 'Hamstrings',
        equipment: ['Barbell', 'Dumbbell'],
        trackingMode: 'weight_reps'
    },
    {
        name: 'Adductor',
        muscleGroup: 'Legs',
        subMuscleGroup: 'Adductors',
        equipment: ['Machine'],
        trackingMode: 'weight_reps'
    },
    {
        name: 'Abductor',
        muscleGroup: 'Legs',
        subMuscleGroup: 'Abductors',
        equipment: ['Machine'],
        trackingMode: 'weight_reps'
    },
    {
        name: 'Calf Raise',
        muscleGroup: 'Legs',
        subMuscleGroup: 'Calves',
        equipment: ['Machine', 'Smith Machine', 'Barbell'],
        trackingMode: 'weight_reps'
    },
    {
        name: 'Leg Extension',
        muscleGroup: 'Legs',
        subMuscleGroup: 'Quads',
        equipment: ['Machine'],
        trackingMode: 'weight_reps'
    },
    {
        name: 'Hamstring Curl',
        muscleGroup: 'Legs',
        subMuscleGroup: 'Hamstrings',
        equipment: ['Machine'],
        trackingMode: 'weight_reps'
    },
    // Core - 2
    {
        name: 'Crunch',
        muscleGroup: 'Core',
        subMuscleGroup: 'Abs',
        equipment: ['Cable', 'Machine', 'Bodyweight'],
        trackingMode: 'weight_reps'
    },
    {
        name: 'Plank',
        muscleGroup: 'Core',
        subMuscleGroup: 'Abs',
        equipment: ['Bodyweight'],
        trackingMode: 'duration'
    },
    // Full body
    {
        name: 'Deadlift',
        muscleGroup: 'Full body',
        subMuscleGroup: 'Lower back',
        equipment: ['Barbell'],
        trackingMode: 'weight_reps'
    },
    // Other
    {
        name: 'Stretching',
        muscleGroup: 'Other',
        subMuscleGroup: 'Mobility',
        equipment: ['Bodyweight'],
        trackingMode: 'duration'
    },
    // Cardio
    {
        name: 'Running',
        muscleGroup: 'Cardio',
        subMuscleGroup: 'Cardio',
        equipment: ['Bodyweight', 'Treadmill'],
        trackingMode: 'distance_duration'
    }
]

module.exports = exercises