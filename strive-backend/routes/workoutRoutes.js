// workoutRoutes.js
// File to handle workout routes

// Imports
const express = require('express');  // Import express
const { 
    getWorkouts, setWorkout, updateWorkout, deleteWorkout,
    addExercise, updateExercise, deleteExercise,
    deleteAllWorkouts
 } = require('../controllers/workoutController.js');    // Import workout & exercise controllers for CRUD functionality
const { protect } = require('../middleware/authMiddleware.js');    // Import protect function
const { sanitiseInput } = require('../middleware/sanitiseMiddleware.js');    // Import sanitise body function

// Initialise router
const workoutRouter = express.Router();

// Apply global middleware
workoutRouter.use(protect);

// Workout routes
workoutRouter.route('/')
    .get(getWorkouts)
    .post(sanitiseInput, setWorkout)
    .delete(sanitiseInput, deleteAllWorkouts);    // routes for getting and setting workouts
workoutRouter.route('/:id')
    .put(sanitiseInput, updateWorkout)
    .delete(sanitiseInput, deleteWorkout);      // routes for updating and deleting workouts

// Exercise routes
workoutRouter.route('/:id/exercises')
    .post(sanitiseInput, addExercise) // route for adding exercises to workout
workoutRouter.route('/:id/exercises/:exerciseId')
    .put(sanitiseInput, updateExercise)
    .delete(sanitiseInput, deleteExercise)  // routes for updating and deleting exercises

// Export router
module.exports = { workoutRouter };