// leaderboardRoutes.js

// Imports
const express = require('express')
const { getLeaderboard } = require('../controllers/leaderboardController')
const { protect } = require('../middleware/authMiddleware.js')

const leaderboardRouter = express.Router()

leaderboardRouter.use(protect)

// Leaderboard routes
leaderboardRouter.route('/').get(getLeaderboard)

module.exports = { leaderboardRouter }