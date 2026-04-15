// migrate-exercises.js
const mongoose = require('mongoose')
const Exercise = require('../models/exerciseModel')
require('dotenv').config({ path: '../.env' })

// Map old names -> new names in the exercise library
const exerciseMap = {
    'Bench': {
        name: 'Bench Press',
        equipment: 'Barbell'
    },
    'Incline Dumbbell Bench': {
        name: 'Incline Bench Press',
        equipment: 'Dumbbell'
    },
    'Bar Push Downs': {
        name: 'Tricep Pushdown',
        equipment: 'Cable'
    },
    'Skull Crushers': {
        name: 'Skull Crushers',
        equipment: 'Cable'
    },
    'Squats': {
        name: 'Squat',
        equipment: 'Barbell'
    },
    'Rdls': {
        name: 'Romanian Deadlift',
        equipment: 'Barbell'
    },
    'Bicep Curls': {
        name: 'Bicep Curl',
        equipment: 'Cable'
    },
    'Bicep Hammer Curls': {
        name: 'Hammer Curl',
        equipment: 'Cable'
    },
    'Forearm Curls': {
        name: 'Forearm Curl',
        equipment: 'Cable'
    },
    'Incline Bench': {
        name: 'Incline Bench Press',
        equipment: 'Smith Machine'
    },
    'Jm Press': {
        name: 'Jm Press',
        equipment: 'Smith Machine'
    },
    'JM Press': {
        name: 'Jm Press',
        equipment: 'Smith Machine'
    },
    'Chest Flys': {
        name: 'Chest Fly',
        equipment: 'Cable'
    },
    'Kneeling Row': {
        name: 'Kneeling Cable Row',
        equipment: 'Cable'
    },
    'T-Bar Row': {
        name: 'T-Bar Row',
        equipment: 'Barbell'
    },
    'Pull Downs': {
        name: 'Lat Pulldown',
        equipment: 'Cable'
    },
    'Delt Flys': {
        name: 'Rear Delt Fly',
        equipment: 'Cable'
    },
    'Calf Raises': {
        name: 'Calf Raise',
        equipment: 'Machine'
    },
    'Ab Crunches': {
        name: 'Crunch',
        equipment: 'Machine'
    },
    'Shoulder Press Machine': {
        name: 'Shoulder Press',
        equipment: 'Machine'
    },
    'Lateral Raises': {
        name: 'Lateral Raise',
        equipment: 'Cable'
    },
    'Sitting Row': {
        name: 'Seated Cable Row',
        equipment: 'Cable'
    },
    'Shoulder Press': {
        name: 'Shoulder Press',
        equipment: 'Smith Machine'
    },
    'Single-arm Push Down': {
        name: 'Single-arm Tricep Pushdown',
        equipment: 'Cable'
    },
    'Leg Extension': {
        name: 'Leg Extension',
        equipment: 'Machine'
    },
    'Chest Press': {
        name: 'Chest Press',
        equipment: 'Machine'
    },
    'Lat Pull Downs': {
        name: 'Lat Pulldown',
        equipment: 'Machine'
    },
    'Dumbbell Shoulder Press': {
        name: 'Shoulder Press',
        equipment: 'Dumbbell'
    },
    'Adductor': {
        name: 'Adductor',
        equipment: 'Machine'
    },
    'Machine Chest Flys': {
        name: 'Chest Fly',
        equipment: 'Machine'
    },
}

const migrate = async () => {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('Connected to DB')

    const db = mongoose.connection.db
    const workoutsCollection = db.collection('workouts')

    const workouts = await workoutsCollection.find({}).toArray()
    let migratedWorkouts = 0
    let failedExercises = []

    for (const workout of workouts) {
        let changed = false
        const newExercises = []

        for (const ex of workout.exercises) {
            // Already in new format
            if (ex.exercise) {
                newExercises.push(ex)
                continue
            }

            const mapping = exerciseMap[ex.name]

            // Resolve name — check nameMap first, then use as-is
            const resolvedName = mapping ? mapping.name : ex.name

            // null in nameMap means intentionally skip/delete
            if (resolvedName === null) {
                console.log(`🗑️  Skipping "${ex.name}" in workout ${workout._id} (mapped to null)`)
                changed = true
                continue
            }


            const match = await Exercise.findOne({
                name: { $regex: new RegExp(`^${resolvedName}$`, 'i') }
            })

            if (!match) {
                console.warn(`⚠️  No match for "${ex.name}" (resolved: "${resolvedName}") in workout ${workout._id}`)
                failedExercises.push({ workoutId: workout._id, name: ex.name, resolvedName })
                continue
            }

            const selectedEquipment = mapping?.equipment || match.equipment?.[0] || 'Other'

            const newSets = (ex.sets || []).map(set => ({
                weight: set.weight ?? undefined,
                reps: set.reps ?? undefined,
                duration: undefined,
                distance: undefined,
                addedWeight: undefined,
                assistance: undefined
            }))

            newExercises.push({
                exercise: match._id,
                selectedEquipment,
                sets: newSets,
            })

            changed = true
            console.log(`✅ "${ex.name}" -> "${match.name}" (${selectedEquipment})`)
        }

        if (changed) {
            await workoutsCollection.updateOne(
                { _id: workout._id },
                { $set: { exercises: newExercises } }
            )
            migratedWorkouts++
            console.log(`💾 Saved workout ${workout._id}`)
        }
    }

    console.log(`\n✅ Done. ${migratedWorkouts} workouts migrated.`)

    if (failedExercises.length > 0) {
        console.log(`\n⚠️  ${failedExercises.length} exercises still could not be matched:`)
        failedExercises.forEach(f => console.log(`   - "${f.name}" -> "${f.resolvedName}" in workout ${f.workoutId}`))
    }

    await mongoose.disconnect()
}

migrate().catch(err => {
    console.error('Migration failed:', err)
    process.exit(1)
})