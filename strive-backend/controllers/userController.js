// userController.js

// Imports
const asyncHandler = require('express-async-handler')
const jwt = require('jsonwebtoken')  
const bcrypt = require('bcryptjs')    
const validator = require('validator')    

// Function Imports
const { 
    getStartOfWeek, getEndOfWeek, getPreviousWeekRange, 
    getISOWeekString, getPreviousISOWeekString, 
    getWeeksBetween, isoWeekToDate 
} = require('../utils/dateFormat.js')
const formatUser = require('../utils/formatUser.js')
const { addPointsToUser, updateUserMomentum, checkAndBreakStreak, checkAndIncreaseStreak } = require('../utils/workoutServices.js')

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
        res.status(201).json(formatUser(user, genToken(user._id)))
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
    const identifier = username || email

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
        res.status(200).json(formatUser(user, genToken(user._id)))
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

    res.status(201).json(formatUser(user, genToken(user._id)))
})

/**
 *   @desc    Get current user info
 *   @route   GET /api/users/me
 *   @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
    const token = req.headers.authorization.split(' ')[1]

    res.status(200).json(formatUser(req.user, token))
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

    res.status(200).json(formatUser(updatedUser))
})

/**
 *   @desc    Add strive points to user
 *   @route   POST /api/users/:id/points
 *   @access  Private
 */
const addPoints = asyncHandler(async (req, res) => {
    const { amount } = req.body    // Amount of SP to be added
    const user = await addPointsToUser(req.params.id, amount)

    res.status(200).json(formatUser(user))
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

    res.status(200).json(formatUser(updatedUser))
}) 

/**
 * @desc    Check if user's streak broke
 * @route   PUT /api/users/:id/streak-broken
 * @access  Private
 */
const checkIfStreakBroken = asyncHandler(async (req, res) => {
    const user = await checkAndBreakStreak(req.params.id)

    res.status(200).json(formatUser(user))
})

/**
 * @desc    Check if user's streak needs incrementing
 * @route   PUT /api/users/:id/streak-increased
 * @access  Private
 */
const checkIfStreakIncreased = asyncHandler(async (req, res) => {
    const user = await checkAndIncreaseStreak(req.params.id)
    res.status(200).json(formatUser(updatedUser))
})

/**
 * @desc    Update user's momentum value
 * @route   PUT /api/users/momentum
 * @access  Private
 */
const updateMomentum = asyncHandler(async (req, res) => {
    const user = await updateUserMomentum(req.user.id, req.body)
    res.status(200).json(formatUser(user))
})

// Generate JWT token
const genToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '14d'
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
    checkIfStreakBroken,
    checkIfStreakIncreased,
    updateMomentum
}