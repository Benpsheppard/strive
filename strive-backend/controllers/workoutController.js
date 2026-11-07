// workoutController.js
// File to handle workout functionality

// Imports
const asyncHandler = require('express-async-handler') 
const formatUser = require('../utils/formatUser.js')
const { isObjectId } = require('../utils/isObjectId.js')
const { withLock } = require('../utils/userLock.js')
const { getDuplicateField } = require('../utils/duplicateKey.js')
const { calculateWorkoutSummary } = require('../utils/workoutSummary.js')
const { applyQuestResults, snapshotQuests, restoreQuests } = require('../utils/quests/progress.js') 
const { updateLeaderboardEntry } = require('../utils/leaderboard.js')
const { evaluateWorkoutAchievements } = require('../utils/achievements/evaluate.js')
const { validateWorkoutInput, sanitiseSets } = require('../utils/validateWorkoutInput.js')
const { updateUserPointsAndMomentum, checkAndIncreaseStreak, getWorkoutsThisWeek, calculateLevel, resetWorkoutData } = require('../utils/workoutServices.js')

// Model Imports
const Workout = require('../models/workoutModel.js')    
const User = require('../models/userModel.js')
const Exercise = require('../models/exerciseModel.js')

// Every exercise must exist and the chosen equipment must be valid for it
const buildExerciseSnapshots = (populatedWorkout, res, userId) => {
    for (const ex of populatedWorkout.exercises) {
        if (!ex.exercise) {
            res.status(400)
            throw new Error('Exercise not found')
        }
        // Custom exercises belong to the user who created them
        if (ex.exercise.isCustom && String(ex.exercise.createdBy) !== String(userId)) {
            res.status(400)
            throw new Error('Exercise not found')
        }
        if (!ex.exercise.equipment?.includes(ex.selectedEquipment)) {
            res.status(400)
            throw new Error(`Invalid equipment for ${ex.exercise.name}`)
        }
    }

    return populatedWorkout.exercises.map(ex => ({
        exerciseId: ex.exercise._id,
        name: ex.exercise.name,
        muscleGroup: ex.exercise.muscleGroup,
        subMuscleGroup: ex.exercise.subMuscleGroup,
        trackingMode: ex.exercise.trackingMode,
        selectedEquipment: ex.selectedEquipment,
        sets: ex.sets
    }))
}

// Compare the user's state before and after a workout
const buildGamificationFlags = (before, updatedUser) => ({
    levelUp: updatedUser.level > before.level ? updatedUser.level : null,
    streakIncreased: updatedUser.streak.current > before.streak,
    shieldEarned: !before.shield && updatedUser.streak.shield,
    shieldUsed: before.shield && !updatedUser.streak.shield && updatedUser.streak.current === before.streak,
    streakBroken: updatedUser.streak.current === 0 && before.streak > 0,
    momentumGained: updatedUser.momentum.current - before.momentum,
})

/**
 *  @desc   Get workouts for the authenticated user
 *  @route  GET /api/workouts
 *  @access Private
 */
const getWorkouts = asyncHandler(async (req, res) => {
    // Find workouts for specific user
    const workouts = await Workout.find({ user: req.user.id })
        .sort({ createdAt: -1 })
        .populate('exercises.exercise')
        .lean()

    // Output list of workouts
    res.status(200).json(workouts) 
})

/**
 *  @desc   Create a workout for the authenticated user. Safe to repeat: sending the same
 *          clientId again returns the workout that was already saved instead of a second one.
 *  @route  POST /api/workouts
 *  @access Private
 */
const setWorkout = asyncHandler(async (req, res) => {
    // Validate and sanitise client input (only known fields are kept)
    const { error, value: input } = validateWorkoutInput(req.body)
    if (error) {
        res.status(400)
        throw new Error(error)
    }

    // One save at a time per user, so a double tap or a retry racing the original can't interleave
    return withLock(String(req.user.id), async () => {
        // A repeat of a save we already completed: hand back the stored workout
        const replay = async () => {
            const existing = await Workout.findOne({ user: req.user.id, clientId: input.clientId })
            if (!existing) return false

            const current = await User.findById(req.user.id)
            res.status(200).json({ workout: existing, user: formatUser(current), gamification: null, duplicate: true })
            return true
        }

        if (input.clientId && (await replay())) return

        // Guest accounts are limited to 5 workouts (counted in the database, so no big array
        // has to be loaded on every request)
        if (req.user.isGuest && (await Workout.countDocuments({ user: req.user.id })) >= 5) {
            res.status(403)
            throw new Error('Guest accounts are limited to 5 workouts. Create a free Strive account for unlimited access!')
        }

        // Create new workout
        const workout = new Workout({
            user: req.user.id,
            title: input.title,
            duration: input.duration,
            exercises: input.exercises,
            ...(input.clientId ? { clientId: input.clientId } : {}),
            createdAt: new Date(),
            updatedAt: new Date()
        })

        // Resolve exercises for calculations (validates exercise + equipment)
        const populatedWorkout = await workout.populate('exercises.exercise')
        const populatedExercises = buildExerciseSnapshots(populatedWorkout, res, req.user.id)

        // Store old values for gamification
        const before = {
            streak: req.user.streak.current,
            shield: req.user.streak.shield,
            momentum: req.user.momentum.current,
            level: req.user.level,
            lastWorkout: req.user.lastWorkout
        }

        // Calculate workout summary (no database writes)
        const { summary, questUpdates } = await calculateWorkoutSummary(req.user, populatedExercises, workout)
        workout.summary = summary

        try {
            await workout.save()
        } catch (saveError) {
            // Two saves with the same clientId got past the check above (e.g. on two servers):
            // the unique index stopped the second, so answer with the first
            if (input.clientId && getDuplicateField(saveError) && (await replay())) return
            throw saveError
        }

        // From here on, anything that fails undoes what was done, so the user is never left
        // with a saved workout that never paid out (a retry then starts clean)
        const questSnapshots = snapshotQuests(questUpdates)
        let updatedUser

        try {
            // Save quest progress / completions earned by this workout
            await applyQuestResults(questUpdates)

            // Record the workout date on the user
            const workoutDate = workout.createdAt
            await User.findByIdAndUpdate(req.user.id, { $max: { lastWorkout: workoutDate } })

            // Check if user's streak has increased
            const workoutsThisWeek = await getWorkoutsThisWeek(req.user.id, workoutDate)
            await checkAndIncreaseStreak(req.user.id, workoutsThisWeek)

            // Update user's points and momentum
            const points = summary.totalStrivePoints?.total > 0
                ? summary.totalStrivePoints.total
                : 0

            updatedUser = await updateUserPointsAndMomentum(req.user.id, points, {
                workoutCompleted: true,
                personalBests: summary.personalBests?.length || 0,
                quests: summary.questsCompleted
            })
        } catch (stepError) {
            await restoreQuests(questSnapshots, workout._id).catch(e => console.error('Could not restore quests:', e.message))
            await Workout.deleteOne({ _id: workout._id }).catch(e => console.error('Could not remove the unfinished workout:', e.message))
            throw stepError
        }

        // The leaderboard is recalculated from workouts, so if this fails it fixes itself on the
        // next save. It must not undo or fail an otherwise complete workout.
        if (!req.user.isGuest) {
            await updateLeaderboardEntry(req.user.id, workout)
                .catch(e => console.error('Leaderboard update failed:', e.message))
        }

        const gamification = buildGamificationFlags(before, updatedUser)

        // Achievements are a bonus on top of a finished workout, so like the leaderboard a
        // failure here is logged and must not fail the save
        gamification.newBadges = await evaluateWorkoutAchievements({
            user: updatedUser,
            workout,
            summary,
            exercises: populatedExercises,
            flags: gamification,
            previousWorkoutAt: before.lastWorkout,
            tzOffset: input.tzOffset
        }).catch(e => {
            console.error('Achievement evaluation failed:', e.message)
            return []
        })

        // updatedUser was read before the unlocks were recorded, so add them to its count
        const responseUser = formatUser(updatedUser)
        if (gamification.newBadges.length > 0) {
            responseUser.achievementCount = (responseUser.achievementCount || 0) + gamification.newBadges.length
        }

        // Output created workout + user + gamification flags
        res.status(201).json({
            workout,
            user: responseUser,
            gamification
        })
    })
})

/**
 *  @desc   Delete a workout with id
 *  @route  DELETE /api/workouts/:id
 *  @access Private
 */
const deleteWorkout = asyncHandler(async (req, res) => {
    // Find workout with given id
    const workout = await Workout.findById(req.params.id)

    // Check if workout with given id exists
    if (!workout) {
        res.status(404)
        throw new Error(`Workout with the id: ${req.params.id} was not found`)
    }

    // Check user exists
    if (!req.user) {
        res.status(404)
        throw new Error('User not found')
    }

    // Check that logged in user matches workout user/owner 
    if (workout.user.toString() !== req.user.id){
        res.status(403)
        throw new Error('User not authorised')
    }

    // Remove SP earned
    const user = await User.findById(req.user.id)

    if (!user) {
        res.status(404)
        throw new Error('User not found')
    }

    const pointsToDeduct = Number(workout.summary?.totalStrivePoints?.total) || 0

    const newSP = Math.max(0, user.strivepoints - pointsToDeduct)

    const newLevel = calculateLevel(newSP)

    await User.findByIdAndUpdate(
        req.user.id,
        {
            strivepoints: newSP,
            level: newLevel,
            $pull: { workouts: workout._id }
        }
    )
    await workout.deleteOne()
    if (!req.user.isGuest) await updateLeaderboardEntry(req.user.id, workout)

    const updatedUser = await User.findById(req.user.id)
    res.status(200).json({
        user: formatUser(updatedUser),
        message: 'Workout deleted successfully' 
    })
})

/**
 *  @desc   Delete all workouts for the authenticated user
 *  @route  DELETE /api/workouts
 *  @access Private
 */
const deleteAllWorkouts = asyncHandler(async (req, res) => {
    const userId = req.user?.id
    if (!userId) {
        res.status(401)
        throw new Error('Not authorised')
    }

    const user = await User.findById(userId)
    if (!user) {
        res.status(404)
        throw new Error('User not found')
    }

    await resetWorkoutData(user)

    res.status(200).json({
        message: 'All workouts deleted successfully'
    })
})

/**
 *  @desc    Add an exercise to a workout
 *  @route   POST /api/workouts/:id/exercises
 *  @access  Private
 */
const addExercise = asyncHandler(async (req, res) => {
    // Validate Workout
    const workout = await Workout.findById(req.params.id)
    if (!workout) {
        res.status(404)
        throw new Error('Workout not found')
    }

    // Validate Exercise
    if (!isObjectId(req.body.exercise)) {
        res.status(400)
        throw new Error('Each exercise must reference a valid exercise id')
    }
    const exercise = await Exercise.findById(req.body.exercise)
    if (!exercise) {
        res.status(404)
        throw new Error('Exercise not found')
    }

    // Validate User
    if (!req.user || workout.user.toString() !== req.user.id) {
        res.status(403)
        throw new Error('User not authorised')
    }

    if (req.body.sets && !Array.isArray(req.body.sets)) {
        res.status(400)
        throw new Error('Sets must be an array')
    }

    // Validate Sets array
    for (const set of req.body.sets || []) {
        if (exercise.trackingMode === 'weight_reps') {
            if (typeof set.weight !== 'number' || typeof set.reps !== 'number') {
                res.status(400)
                throw new Error('Each set must include numeric weight and reps')
            }
        }

        if (exercise.trackingMode === 'duration') {
            if (typeof set.duration !== 'number') {
                res.status(400)
                throw new Error('Each set must include duration')
            }
        }

        if (exercise.trackingMode === 'distance_duration') {
            if (typeof set.distance !== 'number' || typeof set.duration !== 'number') {
                res.status(400)
                throw new Error('Each set must include distance and duration')
            }
        }
    }

    // Validate Equipment
    if (req.body.selectedEquipment && typeof req.body.selectedEquipment !== 'string') {
        res.status(400)
        throw new Error('Equipment must be a string')
    }
    if (req.body.selectedEquipment && !exercise.equipment.includes(req.body.selectedEquipment)) {
        res.status(400)
        throw new Error('Invalid equipment for this exercise')
    }

    // Build new exercise (sets are sanitised to known, bounded numeric fields)
    const sets = sanitiseSets(req.body.sets || [])
    if (!sets) {
        res.status(400)
        throw new Error('Sets contain invalid values')
    }

    const newExercise = {
        exercise: exercise._id,
        selectedEquipment: req.body.selectedEquipment,
        sets
    }

    workout.exercises.push(newExercise)

    const updatedWorkout = await workout.save()
    res.status(200).json(updatedWorkout)
})

// Export functions
module.exports = { 
    getWorkouts, 
    setWorkout, 
    deleteWorkout,
    deleteAllWorkouts, 
    addExercise
 }