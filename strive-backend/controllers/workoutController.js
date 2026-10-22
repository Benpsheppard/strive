// workoutController.js
// File to handle workout functionality

// Imports
const asyncHandler = require('express-async-handler') 
const formatUser = require('../utils/formatUser.js')
const { calculateWorkoutSummary } = require('../utils/workoutSummary.js') 
const { updateLeaderboardEntry } = require('../utils/leaderboard.js')
const { validateWorkoutInput, sanitiseSets } = require('../utils/validateWorkoutInput.js')
const { updateUserPointsAndMomentum, checkAndIncreaseStreak, getWorkoutsThisWeek, calculateLevel, resetWorkoutData } = require('../utils/workoutServices.js')

// Model Imports
const Workout = require('../models/workoutModel.js')    
const User = require('../models/userModel.js')
const Exercise = require('../models/exerciseModel.js')

/**
 *  @desc   Get workouts for the authenticated user
 *  @route  GET /api/workouts
 *  @access Private
 */
const getWorkouts = asyncHandler(async (req, res) => {
    // Find workouts for specific user
    const workouts = await Workout.find({ user: req.user.id }).populate('exercises.exercise')

    // Output list of workouts
    res.status(200).json(workouts) 
})

/**
 *  @desc   Create a workout for the authenticated user
 *  @route  POST /api/workouts
 *  @access Private
 */
const setWorkout = asyncHandler(async (req, res) => {
    console.log("===== NEW WORKOUT =====")
    console.time("Total Workout Submission")

    // Validate and sanitise client input (only known fields are kept)
    const { error, value: input } = validateWorkoutInput(req.body)
    if (error) {
        res.status(400)
        throw new Error(error)
    }

    // Check if user is guest account
    const workoutCount = req.user.workouts.length
    if (req.user.isGuest && workoutCount >= 5) {
        res.status(403)
        throw new Error('Guest accounts are limited to 5 workouts. Create a free Strive account for unlimited access!')
    }

    // Create new workout
    console.time("Create Workout")
    const workout = new Workout({
        user: req.user.id,
        title: input.title,
        duration: input.duration,
        exercises: input.exercises,
        createdAt: new Date(),
        updatedAt: new Date()
    })
    console.timeEnd("Create Workout")

    // Populate variables for calculations
    console.time("Populate Exercises from Workout")
    const populatedWorkout = await workout.populate('exercises.exercise')

    // Every exercise must exist and the chosen equipment must be valid for it
    for (const ex of populatedWorkout.exercises) {
        if (!ex.exercise) {
            res.status(400)
            throw new Error('Exercise not found')
        }
        if (!ex.exercise.equipment?.includes(ex.selectedEquipment)) {
            res.status(400)
            throw new Error(`Invalid equipment for ${ex.exercise.name}`)
        }
    }
    const populatedExercises = populatedWorkout.exercises.map(ex => ({
        exerciseId: ex.exercise._id,
        name: ex.exercise.name,
        muscleGroup: ex.exercise.muscleGroup,
        subMuscleGroup: ex.exercise.subMuscleGroup,
        trackingMode: ex.exercise.trackingMode,
        selectedEquipment: ex.selectedEquipment,
        sets: ex.sets
    }))
    console.timeEnd("Populate Exercises from Workout")

    // Calculate workout summary
    console.time("Calculate Workout Summary")
    const summary = await calculateWorkoutSummary(req.user, populatedExercises, workout)
    console.timeEnd("Calculate Workout Summary")

    workout.summary = summary
    console.time("Save Workout")
    await workout.save()
    console.timeEnd("Save Workout")

    // Update user object with new workout
    const workoutDate = new Date() 

    console.time("Find User and Update")
    await User.findByIdAndUpdate(req.user.id,
        { 
            $push: { workouts: workout._id },
            $max: { lastWorkout: workoutDate }
        }
    )
    console.timeEnd("Find User and Update")

    // Update leaderboards
    console.time("Update Leaderboard Entry")
    await updateLeaderboardEntry(req.user.id, workout)
    console.timeEnd("Update Leaderboard Entry")

    // Store old values for gamification
    const oldStreak = req.user.streak.current
    const oldShield = req.user.streak.shield
    const oldMomentum = req.user.momentum.current
    const oldLevel = req.user.level

    // Check if user's streak has increased
    console.time("Get Workouts from This Week")
    const workoutsThisWeek = await getWorkoutsThisWeek(req.user.id, workoutDate)
    console.timeEnd("Get Workouts from This Week")

    console.time("Check and Increase Streak")
    await checkAndIncreaseStreak(req.user.id, workoutsThisWeek)
    console.timeEnd("Check and Increase Streak")

    // Update user's points and momentum
    console.time("Update user points and momentum")
    const points = summary.totalStrivePoints?.total > 0
            ? summary.totalStrivePoints.total
            : 0

    const updatedUser = await updateUserPointsAndMomentum(req.user.id, points, {
        workoutCompleted: true,
        personalBests: summary.personalBests?.length || 0,
        quests: summary.questsCompleted
    })
    console.timeEnd("Update user points and momentum")

    console.timeEnd("Total Workout Submission")

    // Output created workout + user + gamification flags
    res.status(201).json({
        workout,
        user: formatUser(updatedUser),
        gamification: {
            levelUp: updatedUser.level > oldLevel ? updatedUser.level : null,
            streakIncreased: updatedUser.streak.current > oldStreak,
            shieldEarned: !oldShield && updatedUser.streak.shield,
            shieldUsed: oldShield && !updatedUser.streak.shield && updatedUser.streak.current === oldStreak,
            streakBroken: updatedUser.streak.current === 0 && oldStreak > 0,
            momentumGained: updatedUser.momentum.current - oldMomentum,
        }
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
        res.status(401)
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
    await updateLeaderboardEntry(req.user.id, workout)

    const updatedUser = await User.findById(req.user.id)
    res.status(200).json({
        user: updatedUser,
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
    const exercise = await Exercise.findById(req.body.exercise)
    if (!exercise) {
        res.status(404)
        throw new Error('Exercise not found')
    }

    // Validate User
    if (!req.user || workout.user.toString() !== req.user.id) {
        res.status(401)
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

/**
 *  @desc    Update an exercise inside a workout
 *  @route   PUT /api/workouts/:id/exercises/:exerciseId
 *  @access  Private
 */
const updateExercise = asyncHandler(async (req, res) => {
    const workout = await Workout.findById(req.params.id)

    // Check workout exists
    if (!workout) {
        res.status(404)
        throw new Error('Workout not found')
    }

    // Check user exists and is allowed to update workout
    if (!req.user || workout.user.toString() !== req.user.id) {
        res.status(401)
        throw new Error('User not authorised')
    }

    const exercise = workout.exercises.id(req.params.exerciseId)

    // Check exercise exists
    if (!exercise) {
        res.status(404)
        throw new Error('Exercise not found')
    }

    // Update exercise info
    exercise.name = req.body.name || exercise.name
    exercise.musclegroup = req.body.musclegroup || exercise.musclegroup
    exercise.description = req.body.description || exercise.description

    // Update sets (sanitised to known, bounded numeric fields)
    if (req.body.sets) {
        const sets = sanitiseSets(req.body.sets)
        if (!sets) {
            res.status(400)
            throw new Error('Sets contain invalid values')
        }
        exercise.sets = sets
    }

    const updatedWorkout = await workout.save()
    res.status(200).json(updatedWorkout)
})

/**
 *  @desc    Delete an exercise from a workout
 *  @route   DELETE /api/workouts/:id/exercises/:exerciseId
 *  @access  Private
 */
const deleteExercise = asyncHandler(async (req, res) => {
    const workout = await Workout.findById(req.params.id)

    // Check if workout with given id exists
    if (!workout) {
        res.status(404)
        throw new Error('Workout not found')
    }

    // Check user exists and is authorised to access workout
    if (!req.user || workout.user.toString() !== req.user.id) {
        res.status(401)
        throw new Error('User not authorised')
    }

    // Remove exercise
    workout.exercises = workout.exercises.filter(
        (ex) => ex._id.toString() !== req.params.exerciseId
    )

    const updatedWorkout = await workout.save()
    res.status(200).json(updatedWorkout)
})

// Export functions
module.exports = { 
    getWorkouts, 
    setWorkout, 
    deleteWorkout,
    deleteAllWorkouts, 
    addExercise, 
    updateExercise, 
    deleteExercise
 }