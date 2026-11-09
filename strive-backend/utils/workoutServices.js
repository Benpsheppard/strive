// workoutServices.js

// Imports
const User = require('../models/userModel')
const Workout = require('../models/workoutModel')
const Quest = require('../models/questModel')
const LeaderboardEntry = require('../models/leaderboardEntryModel')
const { getPreviousISOWeekString, getISOWeekString, getPreviousWeekRange, getStartOfWeek, getEndOfWeek, getWeeksBetween } = require('./dateFormat')
const { calculateMomentum } = require('./momentum')

// A shield is earned every time the streak reaches a multiple of this many weeks
const WEEKS_PER_SHIELD = 4

// A week keeps the streak alive if it contains at least this many workouts. This matches
// checkAndIncreaseStreak, which counts a week as soon as its first workout is logged.
const MIN_WORKOUTS_FOR_STREAK = 1

// Get number of workouts completed this week
const getWorkoutsThisWeek = async (userId, date) => {
    const start = getStartOfWeek(date)
    const end = getEndOfWeek(date)
    const workoutsThisWeek = await Workout.countDocuments({
        user: userId,
        createdAt: {
            $gte: start,
            $lte: end
        }
    })

    return workoutsThisWeek
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

// Update points and momentum
const updateUserPointsAndMomentum = async (userId, points, momentumData) => {
    const user = await User.findById(userId)
    if (!user) {
        throw new Error('User not found')
    }

    // Update Points
    const pointsToAdd = Number(points)
    if (isNaN(pointsToAdd)) {
        throw new Error('Amount is not a valid number')
    }

    user.strivepoints += pointsToAdd
    user.level = calculateLevel(user.strivepoints)

    // Update Momentum
    const newMomentum = calculateMomentum(user, momentumData || {})
    user.momentum.current = newMomentum

    const newLastCalculated = new Date()
    user.momentum.lastCalculated = newLastCalculated

    return await user.save()
}

// Calculate users level
const calculateLevel = (sp) => {
    return Math.floor(Math.sqrt(sp / 100)) + 1
}

const resetWorkoutData = async (user) => {
    const workouts = await Workout.find({ user: user._id })
        .select('summary.totalStrivePoints.total')
        .lean()
    const pointsEarnedFromWorkouts = workouts.reduce(
        (total, workout) => total + (Number(workout.summary?.totalStrivePoints?.total) || 0),
        0
    )

    await Workout.deleteMany({ user: user._id })
    await Quest.deleteMany({ user: user._id })
    await LeaderboardEntry.deleteMany({ user: user._id })

    user.workouts = []
    user.lastWorkout = null
    user.strivepoints = Math.max(0, (Number(user.strivepoints) || 0) - pointsEarnedFromWorkouts)
    user.level = calculateLevel(user.strivepoints)
    user.momentum.current = 30
    user.momentum.lastCalculated = null
    user.streak.current = 0
    user.streak.shield = false
    user.streak.lastEvaluatedWeek = null
    user.streak.lastIncrementedWeek = null
    user.streak.best = 0
    await user.save()

    return user
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

    const completedWorkouts = await Workout.countDocuments({
        user: user._id,
        createdAt: {
            $gte: start,
            $lte: end
        }
    })

    // A shield only covers a single missed week. If more than one whole week has passed
    // without a workout, the streak is lost regardless of any shield.
    const weeksSinceLastWorkoutWeek = user.streak.lastIncrementedWeek
        ? getWeeksBetween(user.streak.lastIncrementedWeek, currentWeek) - 1
        : 0

    if (weeksSinceLastWorkoutWeek > 1) {
        user.streak.current = 0
    } else if (completedWorkouts < MIN_WORKOUTS_FOR_STREAK) {
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
const checkAndIncreaseStreak = async (userId, workoutsThisWeek) => {
    const user = await User.findById(userId)
    if (!user) {
        throw new Error('User Not Found')
    }
    const currentWeek = getISOWeekString(new Date())
    if (workoutsThisWeek !== 1 || user.streak.lastIncrementedWeek === currentWeek) {
        return user
    }

    user.streak.current++
    user.streak.best = Math.max(user.streak.best, user.streak.current)
    user.streak.lastIncrementedWeek = currentWeek

    // Earn a shield for every WEEKS_PER_SHIELD weeks of streak (only one can be held)
    if (user.streak.current % WEEKS_PER_SHIELD === 0) {
        user.streak.shield = true
    }

    const updatedUser = await user.save()
    return updatedUser
}

module.exports = {
    getWorkoutsThisWeek,
    updateUserPointsAndMomentum,
    checkAndBreakStreak,
    checkAndIncreaseStreak,
    updateUserMomentum,
    calculateLevel,
    resetWorkoutData
}