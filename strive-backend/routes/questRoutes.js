// questRoutes.js

// Imports
const express = require('express')
const { getQuests, generateQuests, checkQuestCompletion } = require('../controllers/questControllerV2.js')
const rateLimit = require('express-rate-limit')
const { protect } = require('../middleware/authMiddleware.js')

// Initialise router
const questRouter = express.Router()

questRouter.use(protect)

// Guest routes
questRouter.get('/', getQuests)

// AI generation is costly, so limit how often a client can trigger it
const generateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many quest generation requests, please try again later' }
})

questRouter.post('/generate/:duration', generateLimiter, generateQuests)

module.exports = { questRouter }