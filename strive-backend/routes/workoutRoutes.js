// workoutRoutes.js
// File to handle workout routes

// Imports
const express = require('express')  // Import express
const { body, param } = require('express-validator')
const { 
    getWorkouts, setWorkout, updateWorkout, deleteWorkout,
    addExercise, updateExercise, deleteExercise,
    deleteAllWorkouts
 } = require('../controllers/workoutController.js')    // Import workout & exercise controllers for CRUD functionality
const { protect } = require('../middleware/authMiddleware.js')    // Import protect function
const { sanitiseInput } = require('../middleware/sanitiseMiddleware.js')    // Import sanitise body function
const { validateObjectId } = require('../middleware/validateObjectId.js')  // Import ObjectId validation
const validateRequest = require('../middleware/validateRequest.js')

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