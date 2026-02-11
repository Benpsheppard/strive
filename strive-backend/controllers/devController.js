// devController.js

const asyncHandler = require('express-async-handler')
const Workout = require('../models/workoutModel')
const User = require('../models/userModel')

/**
 *   @desc   Populate test workouts for current user
 *   @route  POST /api/dev/populate-workouts
 *   @access Private (DEV ONLY)
 */
const populateTestWorkouts = asyncHandler(async (req, res) => {
    // Safety guard
    if (process.env.NODE_ENV === 'production') {
        res.status(403)
        throw new Error('This route is disabled in production')
    }

    const user = await User.findById(req.user.id)

    if (!user) {
        res.status(404)
        throw new Error('User not found')
    }

    // Optional: prevent accidental duplication
    const existing = await Workout.countDocuments({ user: user._id })
    if (existing > 0) {
        res.status(400)
        throw new Error('User already has workouts')
    }

    const workoutsData = [
        {
            title: 'Push Day',
            duration: 75,
            exercises: [
                {
                    name: 'Bench Press',
                    musclegroup: 'Chest',
                    sets: [
                        { weight: 80, reps: 8 },
                        { weight: 80, reps: 8 },
                        { weight: 75, reps: 10 }
                    ]
                },
                {
                    name: 'Overhead Press',
                    musclegroup: 'Shoulders',
                    sets: [
                        { weight: 40, reps: 10 },
                        { weight: 40, reps: 10 }
                    ]
                }
            ]
        },
        {
            title: 'Pull Day',
            duration: 70,
            exercises: [
                {
                    name: 'Lat Pulldown',
                    musclegroup: 'Back',
                    sets: [
                        { weight: 60, reps: 10 },
                        { weight: 60, reps: 10 }
                    ]
                },
                {
                    name: 'Barbell Row',
                    musclegroup: 'Back',
                    sets: [
                        { weight: 70, reps: 8 },
                        { weight: 70, reps: 8 }
                    ]
                }
            ]
        }
    ]

    const createdWorkouts = []

    for (const data of workoutsData) {
        const workout = await Workout.create({
            ...data,
            user: user._id
        })

        createdWorkouts.push(workout._id)
    }

    user.workouts.push(...createdWorkouts)
    await user.save()

    res.status(201).json({
        message: 'Test workouts created successfully',
        workoutsCreated: createdWorkouts.length
    })
})

module.exports = { populateTestWorkouts }