// questRoutes.js

// Imports
const express = require('express')
const { completeQuest, deleteQuest } = require('../controllers/questController.js')
const { getQuests, generateQuests, checkQuestCompletion } = require('../controllers/questControllerV2.js')
const { protect } = require('../middleware/authMiddleware.js')

// Initialise router
const questRouter = express.Router()

questRouter.use(protect)

// Get quests route
questRouter.get('/', getQuests)

// Generate quest route
questRouter.post('/generate/:duration', generateQuests)

// Check quest completion route
questRouter.post('/check-completion', checkQuestCompletion)

module.exports = { questRouter }