// contestController.js

const asyncHandler = require("express-async-handler");
const Contest = require('../models/contestModel.js');
const ContestProgress = require('../models/contestProgressModel.js');
const contestPool = require('../data/contestPool.js');

// @desc    Get current contest
// @route   GET /api/contests/current
// @access  Private
const getContest = asyncHandler(async (req, res) => {
    if (req.user.level < 10) {
        res.status(403);
        throw new Error('You must be level 10 or higher to access monthly contests');
    }

    try {
        const now = new Date();
        const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
        const currentMonth = monthNames[now.getMonth()];

        // See if contest exists for this month
        let activeContest = await Contest.findOne({ month: currentMonth, active: true });

        if (!activeContest) {
            const lastContest = await Contest.findOne().sort({ _id: -1 });

            // Pick a new contest (not the same as last)
            let newContest;
            do {
                newContest = contestPool[Math.floor(Math.random() * contestPool.length)];
            } while (lastContest && lastContest.name === newContest.name);

            // Create and save new monthly contest
            activeContest = new Contest({
                ...newContest,
                month: currentMonth,
                active: true
            });
            await activeContest.save();
        }
        res.json(activeContest);

    } catch (error) {
        res.status(500);
        throw new Error('Current Contest fetch error');
    }
});

// @desc    Get current leaderboard
// @route   GET /api/contests/leaderboard
// @access  Private
const getLeaderboard = asyncHandler(async (req, res) => {
    if (req.user.level < 10) {
        res.status(403);
        throw new Error('You must be level 10 or higher to access monthly contests');
    }

    try {
        // Get active contest
        const activeContest = await Contest.findOne({ active: true });

        // Check contest exists
        if (!activeContest) {
            res.status(400);
            throw new Error('No active contest');
        }

        // Get users current contest progress
        const progress = await ContestProgress.find({ contest: activeContest._id }).populate('user', 'username level');

        // Create leaderboard
        const leaderboard = progress.map(p => {
            if (!p.user) return null; // skip if user not populated
            const baseline = p.baselineVol || 1; // avoid division by zero
            const percentGain = ((p.currentVol - baseline) / baseline) * 100;

            return {
                username: p.user.username,
                level: p.user.level,
                percentGain: percentGain
            }
        }).filter(Boolean); // remove any nulls


        // Sort leaderboard by highest % gain
        leaderboard.sort((a, b) => b.percentGain - a.percentGain);

        // Find top 5 in current leaderboard
        const topFive = leaderboard.slice(0, 5);

        // Get current users entry regardless of position
        const userPos = leaderboard.find(l => l.username === req.user.username);

        res.json({
            topFive,
            user: userPos
        });

    } catch (error) {
        res.status(500);
        throw new Error('Curret Leaderboard fetch error');
    }
})

module.exports = { getContest, getLeaderboard };