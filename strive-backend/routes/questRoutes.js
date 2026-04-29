// questRoutes.js

// Imports
const express = require('express')
const { getQuests, generateQuests, checkQuestCompletion } = require('../controllers/questControllerV2.js')
const { protect } = require('../middleware/authMiddleware.js')

// Initialise router
const questRouter = express.Router()

questRouter.use(protect)

// Guest routes
questRouter.get('/', getQuests)

questRouter.post('/generate/:duration', generateQuests)

module.exports = { questRouter }