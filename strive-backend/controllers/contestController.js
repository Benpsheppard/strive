// contestController.js

const asyncHandler = require("express-async-handler");
const Contest = require('../models/contestModel.js');
const contestPool = require('../data/contestPool.js');

// @desc    Get current contest
// @route   GET /api/contests/current
// @access  Private
const getContest = asyncHandler(async (req, res) => {
    console.log("Contest pool:", contestPool.length, "entries");

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
});

module.exports = {getContest};