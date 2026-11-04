// exerciseRoutes

const express = require('express')
const { getExercises, createExercise } = require('../controllers/exerciseController')
const { protect, optionalProtect } = require('../middleware/authMiddleware')

const exerciseRouter = express.Router()

// Exercise routes
exerciseRouter.route('/')
    .get(optionalProtect, getExercises)
    .post(protect, createExercise)

module.exports = { exerciseRouter }
