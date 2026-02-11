// contestController.js

// Imports
const asyncHandler = require("express-async-handler")
const Contest = require('../models/contestModel.js')
const ContestProgress = require('../models/contestProgressModel.js')
const contestPool = require('../data/contestPool.js')

/**
 *  @desc    Get current contest
 *  @route   GET /api/contests/current
 *  @access  Private
 */
const getContest = asyncHandler(async (req, res) => {
    try {
        const now = new Date()
        const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
        const currentMonth = monthNames[now.getMonth()]

        let activeContest = await Contest.findOne({ month: currentMonth, active: true })

        if (!activeContest) {
            const lastContest = await Contest.findOne().sort({ _id: -1 })

            let newContest
            do {
                newContest = contestPool[Math.floor(Math.random() * contestPool.length)]
            } while (lastContest && lastContest.name === newContest.name)

            activeContest = new Contest({
                ...newContest,
                month: currentMonth,
                active: true
            })
            await activeContest.save()
        }
        res.json(activeContest)

    } catch (error) {
        res.status(500)
        throw new Error('Current Contest fetch error')
    }
})

/**
 *  @desc    Get current leaderboard
 *  @route   GET /api/contests/leaderboard
 *  @access  Private
 */
const getLeaderboard = asyncHandler(async (req, res) => {
    try {
        const activeContest = await Contest.findOne({ active: true })

        if (!activeContest) {
            res.status(400)
            throw new Error('No active contest')
        }

        const progress = await ContestProgress.find({ contest: activeContest._id }).populate('user', 'username level')

        const leaderboard = progress.map(p => {
            if (!p.user) return null 
            const baseline = p.baselineVol || 1
            const percentGain = ((p.currentVol - baseline) / baseline) * 100

            return {
                username: p.user.username,
                level: p.user.level,
                percentGain: percentGain
            }
        }).filter(Boolean)

        leaderboard.sort((a, b) => b.percentGain - a.percentGain)

        const topFive = leaderboard.slice(0, 5)

        const userPos = leaderboard.find(l => l.username === req.user.username)

        res.json({
            topFive,
            user: userPos
        })

    } catch (error) {
        res.status(500)
        throw new Error('Curret Leaderboard fetch error')
    }
})

module.exports = { getContest, getLeaderboard }