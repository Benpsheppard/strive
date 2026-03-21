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
    .post(
      sanitiseInput,
      body('title').isString().trim().notEmpty().withMessage('Title is required'),
      body('duration').optional().isInt({ min: 1 }).withMessage('Duration must be a positive integer'),
      body('exercises').optional().isArray().withMessage('Exercises must be an array'),
      body('exercises.*.name').optional().isString().trim().notEmpty().withMessage('Exercise name is required'),
      body('exercises.*.musclegroup').optional().isString().trim().notEmpty().withMessage('Exercise group is required'),
      validateRequest,
      setWorkout
    )
    .delete(sanitiseInput, deleteAllWorkouts)    // routes for getting and setting workouts
workoutRouter.route('/:id')
    .put(
      validateObjectId('id'),
      sanitiseInput,
      body('title').optional().isString().trim().notEmpty().withMessage('Title must be a non-empty string'),
      body('duration').optional().isInt({ min: 1 }).withMessage('Duration must be a positive integer'),
      body('exercises').optional().isArray().withMessage('Exercises must be an array'),
      validateRequest,
      updateWorkout
    )
    .delete(validateObjectId('id'), sanitiseInput, deleteWorkout)      // routes for updating and deleting workouts

// Exercise routes
workoutRouter.route('/:id/exercises')
    .post(
      validateObjectId('id'),
      sanitiseInput,
      body('name').isString().trim().notEmpty().withMessage('Exercise name is required'),
      body('musclegroup').isString().trim().notEmpty().withMessage('Musclegroup is required'),
      body('description').optional().isString(),
      body('sets').optional().isArray().withMessage('Sets must be an array'),
      body('sets.*.reps').optional().isInt({ min: 0 }),
      body('sets.*.weight').optional().isNumeric(),
      validateRequest,
      addExercise
    ) // route for adding exercises to workout
workoutRouter.route('/:id/exercises/:exerciseId')
    .put(
      validateObjectId('id'),
      validateObjectId('exerciseId'),
      sanitiseInput,
      body('name').optional().isString().trim().notEmpty(),
      body('musclegroup').optional().isString().trim().notEmpty(),
      body('description').optional().isString(),
      body('sets').optional().isArray(),
      body('sets.*.reps').optional().isInt({ min: 0 }),
      body('sets.*.weight').optional().isNumeric(),
      validateRequest,
      updateExercise
    )
    .delete(validateObjectId('id'), validateObjectId('exerciseId'), sanitiseInput, deleteExercise)  // routes for updating and deleting exercises

// Export router
module.exports = { workoutRouter }