// exerciseController.js

// Imports
const asyncHandler = require('express-async-handler') 

// Model Imports
const Exercise = require('../models/exerciseModel.js')

/**
 * @desc    Get pre-defined exercises from database
 * @route   GET /api/exercises
 */
const getExercises = asyncHandler(async (req, res) => {
    const exercises = await Exercise.find()

    res.status(200).json(exercises)
})

module.exports = { getExercises }