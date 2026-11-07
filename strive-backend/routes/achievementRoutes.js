// achievementRoutes.js

// Imports
const express = require('express')
const rateLimit = require('express-rate-limit')
const { getAchievements, reportEvent } = require('../controllers/achievementController.js')
const { protect } = require('../middleware/authMiddleware.js')

// Initialise router
const achievementRouter = express.Router()

achievementRouter.use(protect)

achievementRouter.get('/', getAchievements)

// Events come from the client, so keep a lid on how often they can be sent
const eventLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: process.env.NODE_ENV === 'test' ? 100000 : 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests, please try again later' }
})

achievementRouter.post('/event', eventLimiter, reportEvent)

module.exports = { achievementRouter }
