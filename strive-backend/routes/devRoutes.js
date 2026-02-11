// devRoutes.js

const express = require('express')
const { populateTestWorkouts } = require('../controllers/devController')
const { protect } = require('../middleware/authMiddleware')

const devRouter = express.Router()

// DEV ONLY
devRouter.post('/populate-workouts', protect, populateTestWorkouts)

module.exports = { devRouter }
