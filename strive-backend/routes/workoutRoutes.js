// workoutRoutes.js
// File to handle workout routes

// Imports
const express = require('express')
const { 
    getWorkouts, setWorkout, updateWorkout, deleteWorkout,
    addExercise, updateExercise, deleteExercise,
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
    .put(validateObjectId('id'), updateWorkout)
    .delete(validateObjectId('id'), deleteWorkout)

// Exercise routes
workoutRouter.route('/:id/exercises')
    .post(validateObjectId('id'), addExercise)
workoutRouter.route('/:id/exercises/:exerciseId')
    .put(validateObjectId('id'), validateObjectId('exerciseId'),updateExercise)
    .delete(validateObjectId('id'), validateObjectId('exerciseId'), deleteExercise)

// Export router
module.exports = { workoutRouter }