// workoutServices.js

// Imports
const User = require('../models/userModel')
const Workout = require('../models/workoutModel')
const { getPreviousISOWeekString, getISOWeekString, getPreviousWeekRange, getStartOfWeek, getEndOfWeek } = require('./dateFormat')
const { calculateMomentum } = require('./momentum')

// Add Strive Points to User
const addPointsToUser = async (userId, amount) => {
    const user = await User.findById(userId)
    if (!user) {
        throw new Error('User not found')
    }

    const pointsToAdd = Number(amount)
    if (isNaN(pointsToAdd)) {
        throw new Error('Amount is not a valid number')
    }

    user.strivepoints += pointsToAdd
    user.level = Math.floor(Math.sqrt(user.strivepoints / 100)) + 1

    await user.save()

    return {
        strivepoints: user.strivepoints,
        level: user.level
    }
}

// Check if Streak is Broken
const checkAndBreakStreak = async (userId) => {
    const user = await User.findById(userId)
    if (!user) {
        throw new Error('User not found')
    }

    const now = new Date()
    const previousWeek = getPreviousISOWeekString(now)
    const currentWeek = getISOWeekString(now)

    if (user.streak.lastIncrementedWeek === currentWeek) {
        user.streak.lastEvaluatedWeek = previousWeek
        await user.save()
        return user
    }

    if (user.streak.lastEvaluatedWeek === previousWeek) {
        return user
    }

    const { start, end } = getPreviousWeekRange(now)

    const completedWorkouts = await workoutModel.countDocuments({
        user: user._id,
        createdAt: {
            $gte: start,
            $lte: end
        }
    })

    if (completedWorkouts < user.target) {
        if (user.streak.shield) {
            user.streak.shield = false
        } else {
            user.streak.current = 0
        }
    }

    user.streak.lastEvaluatedWeek = previousWeek

    const updatedUser = await user.save()
    return updatedUser
}

// Check if Streak is Increased
const checkAndIncreaseStreak = async (userId) => {
    const user = await User.findById(userId)
    if (!user) {
        throw new Error('User not found')
    }

    const now = new Date()
    const currentWeek = getISOWeekString(now)

    if (user.streak.lastIncrementedWeek === currentWeek) {
        return user
    }

    const start = getStartOfWeek(now)
    const end = getEndOfWeek(now)

    const completedWorkouts = await Workout.countDocuments({
        user: user._id,
        createdAt: {
            $gte: start,
            $lte: end
        }
    })

    if (completedWorkouts >= user.target) {
        user.streak.current++
        user.streak.best = Math.max(user.streak.best, user.streak.current)

        user.streak.lastIncrementedWeek = currentWeek
    }

    const updatedUser = await user.save()
    return updatedUser
}

// Update Momentum
const updateUserMomentum = async (userId, data) => {
    const user = await User.findById(userId)
    if (!user) {
        throw new Error('User not found')
    }

    const newMomentum = calculateMomentum(user, data || {})
    user.momentum.current = newMomentum

    const newLastCalculated = new Date()
    user.momentum.lastCalculated = newLastCalculated

    const updatedUser = await user.save()
    return updatedUser
}

module.exports = {
    addPointsToUser,
    checkAndBreakStreak,
    checkAndIncreaseStreak,
    updateUserMomentum
}