// seedExercises.js
// Upserts the exercise library by slug. Existing exercises keep their _id, so
// workouts that reference them are never orphaned.
//
// Usage:  node scripts/seedExercises.js
//         node scripts/seedExercises.js --allow-production   (required when NODE_ENV=production)
require('dotenv').config({ path: '../.env' })
const mongoose = require('mongoose')
const Exercise = require('../models/exerciseModel')
const exercises = require('../data/exerciseLibrary')
const connectDB = require('../config/db')

// Must match the slug generation in exerciseModel.js
const generateSlug = (name) => name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')

const seedDB = async () => {
    if (process.env.NODE_ENV === 'production' && !process.argv.includes('--allow-production')) {
        console.error('Refusing to seed the production database without --allow-production')
        process.exit(1)
    }

    try {
        await connectDB()

        const slugs = []
        for (const exercise of exercises) {
            const slug = generateSlug(exercise.name)
            slugs.push(slug)

            await Exercise.findOneAndUpdate(
                { slug },
                { $set: { ...exercise, slug } },
                { upsert: true, runValidators: true, setDefaultsOnInsert: true }
            )
        }

        // Exercises no longer in the library are reported, not deleted, as workouts may reference them
        const stale = await Exercise.find({ slug: { $nin: slugs } }).select('name').lean()
        if (stale.length > 0) {
            console.warn(`Not in library but left in place: ${stale.map(e => e.name).join(', ')}`)
        }

        console.log(`Exercises seeded successfully! (${exercises.length} upserted)`)
    } catch (err) {
        console.error(err)
        process.exitCode = 1
    } finally {
        await mongoose.connection.close()
    }
}

seedDB()
