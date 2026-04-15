require('dotenv').config({ path: '../.env' })
const mongoose = require('mongoose')
const connectDB = require('../config/db')
const Workout = require('../models/workoutModel')

const run = async () => {
    await connectDB()

    const workouts = await Workout.find().select('exercises.name').lean()
    console.log(JSON.stringify(workouts, null, 2))
    
    const exerciseNames = new Set(
        workouts.flatMap(workout => workout.exercises.map(e => e.name))
    )

    console.log([...exerciseNames])

    await mongoose.connection.close()
}

run()