// integrationRoutes.js
// Routes for my other apps, not for members

// Imports
const express = require('express')
const { getWorkoutSummaries } = require('../controllers/integrationController.js')
const { createIntegrationLimiter, createIntegrationFailureLimiter } = require('../middleware/integrationRateLimit.js')
const { requireIntegrationKey } = require('../middleware/integrationKeyMiddleware.js')

// Initialise router
const integrationRouter = express.Router()

// Limiters run before the key check, so wrong-key attempts are counted too
integrationRouter.use(createIntegrationLimiter())
integrationRouter.use(createIntegrationFailureLimiter())
integrationRouter.use(requireIntegrationKey)

integrationRouter.get('/life/workouts', getWorkoutSummaries)

module.exports = { integrationRouter }
