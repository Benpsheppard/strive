// integrationRoutes.js
// Routes for my other apps, not for members

// Imports
const express = require('express')
const { getWorkoutSummaries } = require('../controllers/integrationController.js')
const { requireIntegrationKey } = require('../middleware/integrationKeyMiddleware.js')

// Initialise router
const integrationRouter = express.Router()

integrationRouter.use(requireIntegrationKey)

integrationRouter.get('/life/workouts', getWorkoutSummaries)

module.exports = { integrationRouter }
