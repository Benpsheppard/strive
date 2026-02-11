// contestRoutes.js

// Imports
const express = require('express')
const { protect } = require('../middleware/authMiddleware.js')
const { getContest, getLeaderboard } = require('../controllers/contestController.js')

// Initialise router
const contestRouter = express.Router()

contestRouter.use(protect)

// Get current contest
contestRouter.get('/current', getContest)

// Get current leaderboard
contestRouter.get('/leaderboard', getLeaderboard)

module.exports = { contestRouter }