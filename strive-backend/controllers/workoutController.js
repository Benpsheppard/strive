// workoutController.js
// File to handle workout functionality

// Imports
const asyncHandler = require('express-async-handler') 
const { calculateWorkoutSummary } = require('../utils/workoutSummary.js') 

// Model Imports
const Workout = require('../models/workoutModel.js')    
const User = require('../models/userModel.js')
const Exercise = require('../models/exerciseModel.js')

/**
 *  @desc   Get workouts for the authenticated user
 *  @route  GET /api/workouts
 *  @access Private
 */
const getWorkouts = asyncHandler(async (req, res) => {
    // Find workouts for specific user
    const workouts = await Workout.find({ user: req.user.id }).populate('exercises.exercise')

    // Output list of workouts
    res.status(200).json(workouts) 
})

/**
 *  @desc   Create a workout for the authenticated user
 *  @route  POST /api/workouts
 *  @access Private
 */
const setWorkout = asyncHandler(async (req, res) => {
    // Check if workout includes a title
    if(!req.body.title){
        res.status(400)
        throw new Error('Please add a title field')
    }

    const workoutCount = await Workout.countDocuments({ user: req.user._id })

    // Check if user is guest account
    if (req.user.isGuest && workoutCount >= 5) {
        res.status(403)
        throw new Error('Guest accounts are limited to 5 workouts. Create a free Strive account for unlimited access!')
    }

    const exercises = req.body.exercises

    // Create new workout with given req data
    const workout = await Workout.create({
        user: req.user.id,
        title: req.body.title,
        duration: req.body.duration,
        exercises
    })

    const populatedWorkout = await workout.populate('exercises.exercise')
    const populatedExercises = populatedWorkout.exercises.map(ex => ({
        name: ex.exercise.name,
        muscleGroup: ex.exercise.muscleGroup,
        subMuscleGroup: ex.exercise.subMuscleGroup,
        trackingMode: ex.exercise.trackingMode,
        sets: ex.sets
    }))

    const summary = await calculateWorkoutSummary(req.user.id, populatedExercises, workout)
    workout.summary = summary
    await workout.save()

    const workoutDate = new Date()
    await User.findByIdAndUpdate(
        req.user.id,
        { 
            $push: { workouts: workout._id },
            $max: { lastWorkout: workoutDate }
        }
    )

    // Output created workout
    res.status(201).json(workout)
})

/**
 *  @desc   Update a workout with id
 *  @route  PUT /api/workouts/:id
 *  @access Private
 */
const updateWorkout = asyncHandler(async (req, res) => {
    // Find workout with given id
    const workout = await Workout.findById(req.params.id)

    // Check if workout with given id exists
    if (!workout){
        res.status(404)
        throw new Error(`Workout with the id: ${req.params.id} was not found`)
    }

    // Check user exists
    if (!req.user) {
        res.status(404)
        throw new Error('User not found')
    }

    // Check that logged in user matches workout user/owner 
    if (workout.user.toString() !== req.user.id){
        res.status(401)
        throw new Error('User not authorised')
    }
    
    // Update workout with given id with new data
    const updatedWorkout = await Workout.findByIdAndUpdate(req.params.id, req.body, {new: true})

    // Output updated workout
    res.status(200).json(updatedWorkout)
})

/**
 *  @desc   Delete a workout with id
 *  @route  DELETE /api/workouts/:id
 *  @access Private
 */
const deleteWorkout = asyncHandler(async (req, res) => {
    // Find workout with given id
    const workout = await Workout.findById(req.params.id)

    // Check if workout with given id exists
    if (!workout) {
        res.status(404)
        throw new Error(`Workout with the id: ${req.params.id} was not found`)
    }

    // Check user exists
    if (!req.user) {
        res.status(404)
        throw new Error('User not found')
    }

    // Check that logged in user matches workout user/owner 
    if (workout.user.toString() !== req.user.id){
        res.status(401)
        throw new Error('User not authorised')
    }

    // Remove SP earned
    const user = await User.findById(req.user.id)

    if (!user) {
        res.status(404)
        throw new Error('User not found')
    }

    const pointsToDeduct = workout.summary.totalStrivePoints

    const newSP = Math.max(0, user.strivepoints - pointsToDeduct)

    const newLevel = Math.floor(Math.sqrt(newSP / 100)) + 1

    await User.findByIdAndUpdate(
        req.user.id,
        {
            strivepoints: newSP,
            level: newLevel,
            $pull: { workouts: workout._id }
        }
    )
    await workout.deleteOne()

    const updatedUser = await User.findById(req.user.id)
    res.status(200).json({
        user: updatedUser,
        message: 'Workout deleted successfully' 
    })
})

/**
 *  @desc   Delete all workouts for the authenticated user
 *  @route  DELETE /api/workouts
 *  @access Private
 */
const deleteAllWorkouts = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)

    if (!user) {
        res.status(404)
        throw new Error('User not found')
    }

    // Only allow user to delete their own workouts
    if (user._id.toString() !== req.user._id.toString()) {
        res.status(401)
        throw new Error('User not authorized to reset this account')
    }

    await Workout.deleteMany({ user: req.user._id })

    res.status(200).json({
        message: 'All workouts deleted successfully'
    })
})

/**
 *  @desc    Add an exercise to a workout
 *  @route   POST /api/workouts/:id/exercises
 *  @access  Private
 */
const addExercise = asyncHandler(async (req, res) => {
    // Validate Workout
    const workout = await Workout.findById(req.params.id)
    if (!workout) {
        res.status(404)
        throw new Error('Workout not found')
    }

    // Validate Exercise
    const exercise = await Exercise.findById(req.body.exercise)
    if (!exercise) {
        res.status(404)
        throw new Error('Exercise not found')
    }

    // Validate User
    if (!req.user || workout.user.toString() !== req.user.id) {
        res.status(401)
        throw new Error('User not authorised')
    }

    if (req.body.sets && !Array.isArray(req.body.sets)) {
        res.status(400)
        throw new Error('Sets must be an array')
    }

    // Validate Sets array
    for (const set of req.body.sets || []) {
        if (exercise.trackingMode === 'weight_reps') {
            if (typeof set.weight !== 'number' || typeof set.reps !== 'number') {
                res.status(400)
                throw new Error('Each set must include numeric weight and reps')
            }
        }

        if (exercise.trackingMode === 'duration') {
            if (typeof set.duration !== 'number') {
                res.status(400)
                throw new Error('Each set must include duration')
            }
        }

        if (exercise.trackingMode === 'distance_duration') {
            if (typeof set.distance !== 'number' || typeof set.duration !== 'number') {
                res.status(400)
                throw new Error('Each set must include distance and duration')
            }
        }
    }

    // Validate Equipment
    if (req.body.selectedEquipment && typeof req.body.selectedEquipment !== 'string') {
        res.status(400)
        throw new Error('Equipment must be a string')
    }
    if (req.body.selectedEquipment && !exercise.equipment.includes(req.body.selectedEquipment)) {
        res.status(400)
        throw new Error('Invalid equipment for this exercise')
    }

    // Build new exercise
    const newExercise = {
        exercise: exercise._id,
        selectedEquipment: req.body.selectedEquipment,
        sets: req.body.sets || []
    }

    workout.exercises.push(newExercise)

    const updatedWorkout = await workout.save()
    res.status(200).json(updatedWorkout)
})

/**
 *  @desc    Update an exercise inside a workout
 *  @route   PUT /api/workouts/:id/exercises/:exerciseId
 *  @access  Private
 */
const updateExercise = asyncHandler(async (req, res) => {
    const workout = await Workout.findById(req.params.id)

    // Check workout exists
    if (!workout) {
        res.status(404)
        throw new Error('Workout not found')
    }

    // Check user exists and is allowed to update workout
    if (!req.user || workout.user.toString() !== req.user.id) {
        res.status(401)
        throw new Error('User not authorised')
    }

    const exercise = workout.exercises.id(req.params.exerciseId)

    // Check exercise exists
    if (!exercise) {
        res.status(404)
        throw new Error('Exercise not found')
    }

    // Update exercise info
    exercise.name = req.body.name || exercise.name
    exercise.musclegroup = req.body.musclegroup || exercise.musclegroup
    exercise.description = req.body.description || exercise.description

    // Update sets
    if (req.body.sets) {
        exercise.sets = req.body.sets 
    }

    const updatedWorkout = await workout.save()
    res.status(200).json(updatedWorkout)
})

/**
 *  @desc    Delete an exercise from a workout
 *  @route   DELETE /api/workouts/:id/exercises/:exerciseId
 *  @access  Private
 */
const deleteExercise = asyncHandler(async (req, res) => {
    const workout = await Workout.findById(req.params.id)

    // Check if workout with given id exists
    if (!workout) {
        res.status(404)
        throw new Error('Workout not found')
    }

    // Check user exists and is authorised to access workout
    if (!req.user || workout.user.toString() !== req.user.id) {
        res.status(401)
        throw new Error('User not authorised')
    }

    // Remove exercise
    workout.exercises = workout.exercises.filter(
        (ex) => ex._id.toString() !== req.params.exerciseId
    )

    const updatedWorkout = await workout.save()
    res.status(200).json(updatedWorkout)
})

// Export functions
module.exports = { 
    getWorkouts, 
    setWorkout, 
    updateWorkout, 
    deleteWorkout,
    deleteAllWorkouts, 
    addExercise, 
    updateExercise, 
    deleteExercise
 }