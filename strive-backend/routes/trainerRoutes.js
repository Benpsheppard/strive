// trainerRoutes.js

// Imports
const express = require('express')
const { generateSuggestions } = require('../controllers/trainerController.js')
const { protect } = require('../middleware/authMiddleware.js')

// Initialise router
const trainerRouter = express.Router()

trainerRouter.use(protect)

// Guest routes
trainerRouter.get('/', generateSuggestions)

module.exports = { trainerRouter }