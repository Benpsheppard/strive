// migrate-exercises.js
const mongoose = require('mongoose')
const Exercise = require('../models/exerciseModel')
require('dotenv').config({ path: '../.env' })

// Map old names -> new names in the exercise library
const nameMap = {
    'Squats': 'Squat',
    'Incline Dumbbell Press': 'Incline Bench Press',
    'Bicep Curls': 'Bicep Curl',
    'Test': null, // null = skip/delete this exercise
}

const migrate = async () => {
    await mongoose.connect(process.env.MONGO_URI_TEST)
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

            // Resolve name — check nameMap first, then use as-is
            const resolvedName = nameMap.hasOwnProperty(ex.name)
                ? nameMap[ex.name]
                : ex.name

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
                selectedEquipment: match.equipment?.[0] || 'Other',
                sets: newSets,
            })

            changed = true
            console.log(`✅ "${ex.name}" -> "${match.name}" (${match.equipment?.[0] || 'Other'})`)
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