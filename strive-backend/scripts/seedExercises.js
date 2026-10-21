// seedExercises.js
require('dotenv').config({ path: '../.env' })
const mongoose = require('mongoose')
const Exercise = require('../models/exerciseModel')
const exercises = require('../data/exerciseLibrary')
const connectDB = require('../config/db')

connectDB()

const seedDB = async () => {
    try {
        await Exercise.deleteMany({})

        await Exercise.insertMany(exercises)

        console.log('Exercises seeded successfully!')
    } catch (err) {
        console.error(err)
    } finally {
        mongoose.connection.close()
    }
}

seedDB()