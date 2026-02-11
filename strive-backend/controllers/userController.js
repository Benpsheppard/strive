// userController.js
// File to handle user functionality

// Imports
const asyncHandler = require('express-async-handler')
const jwt = require('jsonwebtoken')  
const bcrypt = require('bcryptjs')    
const validator = require('validator')    

// Model Imports
const User = require('../models/userModel.js')    
const Workout = require('../models/workoutModel.js') 
const Quest = require('../models/questModel.js')

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
            strivepoints: user.strivepoints
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
            token: genToken(user._id)
        })
    } else {
        res.status(400)
        throw new Error('Invalid user credentials')
    }
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
const updateWeightPreference = asyncHandler(async (req, res) => {
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
    getMe, 
    deleteUser, 
    resetUser, 
    updateWeightPreference, 
    addPoints 
}