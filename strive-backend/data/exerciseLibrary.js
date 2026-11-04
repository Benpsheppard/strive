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

// Compact helper for the entries below
const e = (name, muscleGroup, subMuscleGroup, equipment, trackingMode = 'weight_reps') =>
    ({ name, muscleGroup, subMuscleGroup, equipment, trackingMode })

const WR = 'weight_reps'
const BW = 'bodyweight_reps'
const AS = 'assisted_reps'
const DU = 'duration'
const DD = 'distance_duration'

const moreExercises = [
    // Chest
    e('Decline Bench Press', 'Chest', 'Lower chest', ['Barbell', 'Dumbbell', 'Smith Machine'], WR),
    e('Incline Chest Press', 'Chest', 'Upper chest', ['Machine'], WR),
    e('Incline Chest Fly', 'Chest', 'Upper chest', ['Dumbbell', 'Cable'], WR),
    e('Cable Crossover', 'Chest', 'Lower chest', ['Cable'], WR),
    e('Pec Deck', 'Chest', 'Mid chest', ['Machine'], WR),
    e('Dips', 'Chest', 'Lower chest', ['Bodyweight'], BW),
    e('Assisted Dips', 'Chest', 'Lower chest', ['Machine'], AS),
    e('Pullover', 'Chest', 'Mid chest', ['Dumbbell', 'Cable'], WR),
    e('Diamond Push Up', 'Chest', 'Mid chest', ['Bodyweight'], BW),
    e('Decline Push Up', 'Chest', 'Upper chest', ['Bodyweight'], BW),
    e('Incline Push Up', 'Chest', 'Lower chest', ['Bodyweight'], BW),
    // Back
    e('Bent Over Row', 'Back', 'Mid back', ['Barbell', 'Dumbbell', 'Smith Machine'], WR),
    e('Pendlay Row', 'Back', 'Mid back', ['Barbell'], WR),
    e('Single-Arm Row', 'Back', 'Lats', ['Dumbbell', 'Cable'], WR),
    e('Chest Supported Row', 'Back', 'Upper back', ['Machine', 'Dumbbell'], WR),
    e('Machine Row', 'Back', 'Mid back', ['Machine'], WR),
    e('Inverted Row', 'Back', 'Mid back', ['Bodyweight'], BW),
    e('Chin Up', 'Back', 'Lats', ['Bodyweight'], BW),
    e('Neutral Grip Pull Up', 'Back', 'Lats', ['Bodyweight'], BW),
    e('Assisted Pull Up', 'Back', 'Lats', ['Machine'], AS),
    e('Straight Arm Pulldown', 'Back', 'Lats', ['Cable'], WR),
    e('Face Pull', 'Shoulders', 'Rear delts', ['Cable'], WR),
    e('Shrug', 'Back', 'Traps', ['Barbell', 'Dumbbell', 'Smith Machine'], WR),
    e('Back Extension', 'Back', 'Lower back', ['Bodyweight', 'Machine'], 'reps'),
    e('Rack Pull', 'Back', 'Lower back', ['Barbell'], WR),
    e('Good Morning', 'Back', 'Lower back', ['Barbell'], WR),
    // Shoulders
    e('Arnold Press', 'Shoulders', 'Front delts', ['Dumbbell'], WR),
    e('Front Raise', 'Shoulders', 'Front delts', ['Dumbbell', 'Cable', 'Barbell'], WR),
    e('Upright Row', 'Shoulders', 'Side delts', ['Barbell', 'Dumbbell', 'Cable'], WR),
    e('Push Press', 'Shoulders', 'Front delts', ['Barbell'], WR),
    e('Landmine Press', 'Shoulders', 'Front delts', ['Barbell'], WR),
    e('Pike Push Up', 'Shoulders', 'Front delts', ['Bodyweight'], BW),
    // Biceps
    e('Preacher Curl', 'Arms', 'Biceps', ['Barbell', 'Dumbbell', 'Machine'], WR),
    e('Incline Curl', 'Arms', 'Biceps', ['Dumbbell'], WR),
    e('Concentration Curl', 'Arms', 'Biceps', ['Dumbbell'], WR),
    e('EZ Bar Curl', 'Arms', 'Biceps', ['Barbell'], WR),
    e('Spider Curl', 'Arms', 'Biceps', ['Dumbbell', 'Barbell'], WR),
    e('Zottman Curl', 'Arms', 'Biceps', ['Dumbbell'], WR),
    e('Reverse Curl', 'Arms', 'Forearms', ['Barbell', 'Dumbbell', 'Cable'], WR),
    // Triceps and forearms
    e('Overhead Tricep Extension', 'Arms', 'Triceps', ['Dumbbell', 'Cable'], WR),
    e('Close Grip Bench Press', 'Arms', 'Triceps', ['Barbell', 'Smith Machine'], WR),
    e('Tricep Kickback', 'Arms', 'Triceps', ['Dumbbell', 'Cable'], WR),
    e('Bench Dip', 'Arms', 'Triceps', ['Bodyweight'], BW),
    e('Machine Tricep Extension', 'Arms', 'Triceps', ['Machine'], WR),
    e('Reverse Wrist Curl', 'Arms', 'Forearms', ['Dumbbell', 'Barbell'], WR),
    e('Dead Hang', 'Arms', 'Forearms', ['Bodyweight'], DU),
    // Legs
    e('Front Squat', 'Legs', 'Quads', ['Barbell', 'Smith Machine'], WR),
    e('Goblet Squat', 'Legs', 'Quads', ['Dumbbell', 'Kettlebell'], WR),
    e('Hack Squat', 'Legs', 'Quads', ['Machine', 'Barbell'], WR),
    e('Leg Press', 'Legs', 'Quads', ['Machine'], WR),
    e('Bulgarian Split Squat', 'Legs', 'Quads', ['Dumbbell', 'Barbell', 'Smith Machine'], WR),
    e('Walking Lunge', 'Legs', 'Quads', ['Dumbbell', 'Barbell'], WR),
    e('Reverse Lunge', 'Legs', 'Glutes', ['Dumbbell', 'Barbell'], WR),
    e('Bodyweight Lunge', 'Legs', 'Quads', ['Bodyweight'], BW),
    e('Step Up', 'Legs', 'Quads', ['Dumbbell', 'Barbell'], WR),
    e('Hip Thrust', 'Legs', 'Glutes', ['Barbell', 'Machine', 'Smith Machine'], WR),
    e('Glute Bridge', 'Legs', 'Glutes', ['Bodyweight'], BW),
    e('Sumo Deadlift', 'Legs', 'Glutes', ['Barbell'], WR),
    e('Trap Bar Deadlift', 'Legs', 'Quads', ['Barbell'], WR),
    e('Seated Calf Raise', 'Legs', 'Calves', ['Machine'], WR),
    e('Lying Leg Curl', 'Legs', 'Hamstrings', ['Machine'], WR),
    e('Nordic Hamstring Curl', 'Legs', 'Hamstrings', ['Bodyweight'], BW),
    e('Cable Kickback', 'Legs', 'Glutes', ['Cable'], WR),
    e('Cable Pull Through', 'Legs', 'Glutes', ['Cable'], WR),
    e('Wall Sit', 'Legs', 'Quads', ['Bodyweight'], DU),
    e('Bodyweight Squat', 'Legs', 'Quads', ['Bodyweight'], BW),
    e('Jump Squat', 'Legs', 'Quads', ['Bodyweight'], BW),
    // Core
    e('Hanging Leg Raise', 'Core', 'Lower abs', ['Bodyweight'], BW),
    e('Hanging Knee Raise', 'Core', 'Lower abs', ['Bodyweight'], BW),
    e('Cable Crunch', 'Core', 'Abs', ['Cable'], WR),
    e('Russian Twist', 'Core', 'Obliques', ['Bodyweight'], BW),
    e('Ab Wheel Rollout', 'Core', 'Abs', ['Other'], BW),
    e('Sit Up', 'Core', 'Abs', ['Bodyweight'], BW),
    e('Leg Raise', 'Core', 'Lower abs', ['Bodyweight'], BW),
    e('Side Plank', 'Core', 'Obliques', ['Bodyweight'], DU),
    e('Dead Bug', 'Core', 'Abs', ['Bodyweight'], BW),
    e('Bicycle Crunch', 'Core', 'Obliques', ['Bodyweight'], BW),
    e('Mountain Climber', 'Core', 'Abs', ['Bodyweight'], DU),
    e('Pallof Press', 'Core', 'Obliques', ['Cable'], WR),
    e('Woodchopper', 'Core', 'Obliques', ['Cable'], WR),
    e('Hollow Hold', 'Core', 'Abs', ['Bodyweight'], DU),
    e('V Up', 'Core', 'Abs', ['Bodyweight'], BW),
    // Full body
    e('Power Clean', 'Full body', 'Other', ['Barbell'], WR),
    e('Kettlebell Swing', 'Full body', 'Glutes', ['Kettlebell'], WR),
    e('Thruster', 'Full body', 'Quads', ['Barbell', 'Dumbbell'], WR),
    e('Turkish Get Up', 'Full body', 'Other', ['Kettlebell'], WR),
    e('Burpee', 'Full body', 'Cardio', ['Bodyweight'], BW),
    // Cardio
    e('Cycling', 'Cardio', 'Cardio', ['Bike'], DD),
    e('Walking', 'Cardio', 'Cardio', ['Bodyweight', 'Treadmill'], DD),
    e('Incline Walk', 'Cardio', 'Cardio', ['Treadmill'], DD),
    e('Rowing', 'Cardio', 'Cardio', ['Rowing machine'], DD),
    e('Elliptical', 'Cardio', 'Cardio', ['Machine'], DD),
    e('Swimming', 'Cardio', 'Cardio', ['Other'], DD),
    e('Sprints', 'Cardio', 'Cardio', ['Bodyweight'], DD),
    e('Stair Climber', 'Cardio', 'Cardio', ['Stepper'], DU),
    e('Jump Rope', 'Cardio', 'Cardio', ['Other'], DU),
    e('Battle Ropes', 'Cardio', 'Cardio', ['Other'], DU),
    // Mobility
    e('Yoga', 'Other', 'Mobility', ['Bodyweight'], DU),
    e('Foam Rolling', 'Other', 'Mobility', ['Other'], DU),
    e('Mobility Flow', 'Other', 'Mobility', ['Bodyweight'], DU)
]

module.exports = [...exercises, ...moreExercises]