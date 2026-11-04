// workoutRoutes.js
// File to handle workout routes

// Imports
const express = require('express')
const { 
    getWorkouts, setWorkout, deleteWorkout,
    addExercise,
    deleteAllWorkouts
 } = require('../controllers/workoutController.js')    
const { protect } = require('../middleware/authMiddleware.js')    
const { validateObjectId } = require('../middleware/validateObjectId.js')  

// Initialise router
const workoutRouter = express.Router()

// Apply global middleware
workoutRouter.use(protect)

// Workout routes
workoutRouter.route('/')
    .get(getWorkouts)
    .post(setWorkout)
    .delete(deleteAllWorkouts)
workoutRouter.route('/:id')
    .delete(validateObjectId('id'), deleteWorkout)

// Workout-Exercise routes
workoutRouter.route('/:id/exercises')
    .post(validateObjectId('id'), addExercise)

// Export router
module.exports = { workoutRouter }