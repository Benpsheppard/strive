// userController.js

// Imports
const asyncHandler = require('express-async-handler')
const jwt = require('jsonwebtoken')  
const bcrypt = require('bcryptjs')    
const validator = require('validator')    

// Function Imports
const { getStartOfWeek, getEndOfWeek, getISOWeekString, getWeeksBetween, isoWeekToDate } = require('../utils/dateFormat.js')

// Model Imports
const User = require('../models/userModel.js')    
const Workout = require('../models/workoutModel.js') 
const Quest = require('../models/questModel.js')
const { calculateMomentum } = require('../utils/momentum.js')

/**
 *   @desc    Register user
 *   @route   POST /api/users
 *   @access  Public
 */
const registerUser = asyncHandler(async (req, res) => {
    // Get user info
    let { username, email, password } = req.body

    // Check if all info exists
    if (!username || !email || !password) {
        res.status(400)
        throw new Error('Please add all fields')
    }

    // Check email is in email format
    if (!validator.isEmail(email)) {
        res.status(400)
        throw new Error('Invalid email address')
    }

    // Check password is long enough
    if (!validator.isStrongPassword(password)) {
        res.status(400)
        throw new Error('Password must satisfy all criteria.')
    }

    // Normalize email
    email = validator.normalizeEmail(email)

    // Look if email and username exists already
    const emailExists = await User.findOne({ email })
    const usernameExists = await User.findOne({ username })

    // Check if email already exists
    if (emailExists){
        res.status(400)
        throw new Error('Email already exists')
    }

    // Check if username already exists
    if (usernameExists){
        res.status(400)
        throw new Error('Username already exists')
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)  // generating a hash string to add to unhashed password
    const hashPassword = await bcrypt.hash(password, salt)     // hash users password using salt

    // Create user
    const user = await User.create({
        username,
        email,
        password: hashPassword,
        useImperial: false,
        isGuest: req.body.isGuest || false
    })
    
    // Verify user creation
    if (user) {
        res.status(201).json({
            _id: user.id,
            username: user.username,
            email: user.email,
            useImperial: user.useImperial,
            createdAt: user.createdAt,
            token: genToken(user._id),
            isGuest: user.isGuest,
            level: user.level,
            strivepoints: user.strivepoints,
            momentum: user.momentum,
            streak: user.streak,
            target: user.target,
            height: user.height,
            weight: user.weight
        })
    } else {
        res.status(400)
        throw new Error('Invalid user data')
    }
})

/**
 *   @desc    Authenticate user
 *   @route   POST /api/users/login
 *   @access  Public
 */
const loginUser = asyncHandler(async (req, res) => {
    // Get user details
    const { username, email, password } = req.body
    identifier = username || email

    if (!identifier || !password) {
        res.status(400)
        throw new Error('Please provide username/email and password')
    }

    // Determine if identifier is email
    const isEmail = validator.isEmail(identifier)

    // Check for username
    const user = isEmail 
        ? await User.findOne({ email: validator.normalizeEmail(identifier) })
        : await User.findOne({ username: identifier })

    // Check username and password match
    if (user && (await bcrypt.compare(password, user.password))){
        res.json({
            _id: user.id,
            username: user.username,
            email: user.email,
            createdAt: user.createdAt,
            useImperial: user.useImperial,
            level: user.level,
            strivepoints: user.strivepoints,
            momentum: user.momentum,
            streak: user.streak,
            target: user.target,
            height: user.height,
            weight: user.weight,
            token: genToken(user._id)
        })
    } else {
        res.status(400)
        throw new Error('Invalid user credentials')
    }
})

/**
 *   @desc   Migrate guest user to strive user
 *   @route  POST /api/users/migrate
 *   @access Private
 */
const migrateUser = asyncHandler(async (req, res) => {
    // Get new user info
    let { username, email, password } = req.body

    // Get old guest user info
    const user = await User.findById(req.user.id)

    // Account verification
    if (!user) {
        res.status(404)
        throw new Error('User not found')
    }

    if (!user.isGuest) {
        res.status(400)
        throw new Error('Only guest accounts can migrate')
    }

    // Check if all info exists
    if (!username || !email || !password) {
        res.status(400)
        throw new Error('Please add all fields')
    }

    // Check email is in email format
    if (!validator.isEmail(email)) {
        res.status(400)
        throw new Error('Invalid email address')
    }

    // Check password is long enough
    if (!validator.isStrongPassword(password)) {
        res.status(400)
        throw new Error('Password must satisfy all criteria.')
    }

    // Normalize email
    email = validator.normalizeEmail(email)

    // Look if email and username exists already
    const emailExists = await User.findOne({ email })
    const usernameExists = await User.findOne({ username })

    // Check if email already exists
    if (emailExists && emailExists._id.toString() !== user._id.toString()){
        res.status(400)
        throw new Error('Email already exists')
    }

    // Check if username already exists
    if (usernameExists && usernameExists._id.toString() !== user._id.toString()){
        res.status(400)
        throw new Error('Username already exists')
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)  // generating a hash string to add to unhashed password
    const hashPassword = await bcrypt.hash(password, salt)     // hash users password using salt

    user.username = username
    user.email = email
    user.password = hashPassword
    user.isGuest = false

    await user.save()

    res.status(200).json({
        _id: user.id,
        username: user.username,
        email: user.email,
        isGuest: user.isGuest,
        token: genToken(user._id)
    })
})

/**
 *   @desc    Get current user info
 *   @route   GET /api/users/me
 *   @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
    // Return user info
    res.status(200).json(req.user)
})

/**
 *   @desc    Delete user and all associated data (workouts, quests)
 *   @route   DELETE /api/users/:id
 *   @access  Private
 */
const deleteUser = asyncHandler(async (req, res) => {
    // Get user from database
    const user = await User.findById(req.params.id)

    // Check if user exists
    if (!user) {
        res.status(404)
        throw new Error('User not found')
    }

    // Check if the authenticated user is deleting their own account
    if (user._id.toString() !== req.user._id.toString()) {
        res.status(401)
        throw new Error('User not authorized to delete this account')
    }

    // Delete all workouts associated with the user
    await Workout.deleteMany({ user: req.params.id })

    // Delete all quests associated with the user
    await Quest.deleteMany({ user: req.params.id })

    // Delete user
    await user.deleteOne()

    res.status(200).json({ 
        id: req.params.id,
        message: 'User and associated data deleted successfully' 
    })
})

/**
 *   @desc    Reset all workout data for a user
 *   @route   DELETE /api/users/:id/reset
 *   @access  Private
 */
const resetUser = asyncHandler(async (req, res) => {
    const userId = req.params.id

    // Make sure user is authorized
    if (req.user.id !== userId && !req.user.isAdmin) {
        res.status(401)
        throw new Error('Not authorized to reset this user')
    }

    // Delete all workouts that belong to this user
    await Workout.deleteMany({ user: userId })

    res.status(200).json({ message: 'All user workout data has been reset successfully' })
})

/**
 *   @desc    Change user's weight preference (kg or lbs)
 *   @route   PUT /api/users/preference
 *   @access  Private
 */
const updateUnitPreference = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id)

    if (!user) {
        res.status(404)
        throw new Error('User not found')
    }

    user.useImperial = req.body.useImperial
    const updatedUser = await user.save()

    res.status(200).json({
        _id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        useImperial: updatedUser.useImperial,
        createdAt: updatedUser.createdAt,
        token: genToken(updatedUser._id)
    })
})

/**
 *   @desc    Add strive points to user
 *   @route   POST /api/users/:id/points
 *   @access  Private
 */
const addPoints = asyncHandler(async (req, res) => {
    const { amount } = req.body    // Amount of SP to be added
    const user = await User.findById(req.params.id)      // Get user

    // Check user exists
    if (!user) {
        res.status(404)
        throw new Error('User not found')
    }

    const pointsToAdd = Number(amount)

    if (isNaN(pointsToAdd)){
        res.status(400)
        throw new Error('Amount is not a valid number')
    }

    user.strivepoints += pointsToAdd    // Add points to user

    user.level = Math.floor(Math.sqrt(user.strivepoints / 100)) + 1    // Level up rate (lower divisor is quicker leveling)
    
    await user.save()  // Save updates to user

    res.json({
        message: `Added ${amount} SP to ${user.username}`,
        strivepoints: user.strivepoints,
        level: user.level,
    })
})

/**
 * @desc    Update user's profile information
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id)

    if (!user) {
        res.status(404)
        throw new Error('User not found')
    }

    const { target, height, weight } = req.body

    if (target !== undefined) {
        if (isNaN(Number(target)) || Number(target) < 1 || Number(target) > 7) {
            res.status(400)
            throw new Error('Target must be a number between 1 and 7')
        }
        user.target = target
    }

    if (height !== undefined) {
        if (typeof height !== 'object' || isNaN(Number(height.feet)) || isNaN(Number(height.inches))) {
            res.status(400)
            throw new Error('Height must be an object with numeric feet and inches')
        }
        user.height = height
    }

    if (weight !== undefined) {
        if (isNaN(Number(weight)) || Number(weight) <= 0) {
            res.status(400)
            throw new Error('Weight must be a positive number')
        }
        user.weight = weight
    }

    const updatedUser = await user.save()

    res.status(200).json({
        _id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        target: updatedUser.target,
        height: updatedUser.height,
        weight: updatedUser.weight,
        createdAt: updatedUser.createdAt,
        token: genToken(updatedUser._id)
    })
}) 

/**
 * @desc   Update user's streak count (increment or reset)
 * @route  POST /api/users/:id/streak
 * @access Private
 */
const updateStreak = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)

    if (!user) {
        res.status(404)
        throw new Error('User not found')
    }

    const now = new Date()
    const currentWeek = getISOWeekString(now)
    const lastEvaluated = user.streak.lastEvaluatedWeek

    if (lastEvaluated && lastEvaluated !== currentWeek) {
        const weeksMissed = getWeeksBetween(lastEvaluated, currentWeek)

        if (weeksMissed > 0) {
            const startOfLastWeek = isoWeekToDate(lastEvaluated)
            const endOfLastWeek = new Date(startOfLastWeek.getTime() + 7 * 24 * 60 * 60 * 1000)

            const workoutsLastWeek = await Workout.countDocuments({
                user: user._id,
                createdAt: {
                    $gte: startOfLastWeek,
                    $lte: endOfLastWeek
                }
            })
            const missedTarget = workoutsLastWeek < user.target

            if (missedTarget) {
                if (user.streak.shield) {
                    user.streak.shield = false

                    if (weeksMissed > 1) {
                        user.streak.current = 0
                    }
                } else {
                    user.streak.current = 0
                }
            }
        }   
    }

    const startOfWeek = getStartOfWeek(now)
    const endOfWeek = getEndOfWeek(now)

    const workoutsThisWeek = await Workout.countDocuments({
        user: user._id,
        createdAt: {
            $gte: startOfWeek,
            $lte: endOfWeek
        }
    })

    const hitTarget = workoutsThisWeek >= user.target
    const alreadyIncrementedThisWeek = lastEvaluated === currentWeek

    if (hitTarget && !alreadyIncrementedThisWeek) {
        user.streak.current += 1

        user.strivepoints += 1000
        user.level = Math.floor(Math.sqrt(user.strivepoints / 100)) + 1

        if (user.streak.current > user.streak.best) {
            user.streak.best = user.streak.current
        }

        if (user.streak.current % 4 === 0 && !user.streak.shield) {
            user.streak.shield = true
        }
    }

    if (hitTarget) {
        user.streak.lastEvaluatedWeek = currentWeek
    }

    const updatedUser = await user.save()
    res.json({
        _id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        createdAt: updatedUser.createdAt,
        useImperial: updatedUser.useImperial,
        level: updatedUser.level,
        strivepoints: updatedUser.strivepoints,
        streak: updatedUser.streak,
        target: updatedUser.target,
        height: updatedUser.height,
        weight: updatedUser.weight,
        token: genToken(updatedUser._id)
    })
})

/**
 * @desc    Update user's momentum value
 * @route   PUT /api/users/momentum
 * @access  Private
 */
const updateMomentum = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id)
    if (!user) {
        res.status(404)
        throw new Error('User not found')
    }

    user.momentum = calculateMomentum(user, req.body)
    const updatedUser = await user.save()

    res.status(200).json({
        _id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        createdAt: updatedUser.createdAt,
        momentum: updatedUser.momentum,
        token: genToken(updatedUser._id)
    })
})

// Generate JWT token
const genToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    })
}

// Export functions
module.exports = { 
    registerUser, 
    loginUser, 
    migrateUser,
    getMe, 
    deleteUser, 
    resetUser, 
    updateUnitPreference, 
    addPoints,
    updateProfile,
    updateStreak,
    updateMomentum
}