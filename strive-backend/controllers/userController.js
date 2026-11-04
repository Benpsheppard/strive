// userController.js

// Imports
const asyncHandler = require('express-async-handler')
const jwt = require('jsonwebtoken')  
const bcrypt = require('bcryptjs')
const validator = require('validator')    

// Function Imports
const formatUser = require('../utils/formatUser.js')
const { hashPassword, DUMMY_HASH } = require('../utils/passwords.js')
const { TERMS_VERSION } = require('../utils/legal.js')
const loginThrottle = require('../utils/loginThrottle.js')
const mailer = require('../utils/mailer.js')
const { verifyEmail } = require('../utils/emails.js')
const { createToken, VERIFY_TOKEN_TTL_MS } = require('../utils/tokens.js')
const { deleteUserData } = require('../utils/accountData.js')
const { getDuplicateField } = require('../utils/duplicateKey.js')
const { updateUserMomentum, checkAndBreakStreak, checkAndIncreaseStreak, getWorkoutsThisWeek, resetWorkoutData } = require('../utils/workoutServices.js')

// Model Imports
const User = require('../models/userModel.js')    
const Workout = require('../models/workoutModel.js') 
const Quest = require('../models/questModel.js')
const LeaderboardEntry = require('../models/leaderboardEntryModel.js')

const USERNAME_REGEX = /^[A-Za-z0-9_.-]{3,30}$/

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Case-insensitive exact match so 'Ben' and 'ben' can't both be registered
const usernameQuery = (username) => ({ username: new RegExp(`^${escapeRegex(username)}$`, 'i') })

// Validates and normalises the username, email and password for register and migrate.
// Sets a 400 status and throws on invalid input.
const validateCredentials = (body, res) => {
    let { username, email, password } = body

    // Check if all info exists
    if (!username || !email || !password) {
        res.status(400)
        throw new Error('Please add all fields')
    }

    // Only plain strings are accepted (blocks NoSQL operator objects like { $ne: null })
    if (typeof username !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
        res.status(400)
        throw new Error('Invalid input')
    }

    username = username.trim()

    // Check username format
    if (!USERNAME_REGEX.test(username)) {
        res.status(400)
        throw new Error('Username must be 3-30 characters and only contain letters, numbers, ., _ or -')
    }

    // Check email is in email format
    if (!validator.isEmail(email)) {
        res.status(400)
        throw new Error('Invalid email address')
    }

    // Check password is strong enough
    if (!validator.isStrongPassword(password)) {
        res.status(400)
        throw new Error('Password must satisfy all criteria.')
    }

    return { username, email: validator.normalizeEmail(email), password }
}

/**
 *   @desc    Register user
 *   @route   POST /api/users
 *   @access  Public
 */
const registerUser = asyncHandler(async (req, res) => {
    // Get user info
    const { username, email, password } = validateCredentials(req.body, res)
    const isGuest = req.body.isGuest === true

    // Members must agree to the terms (guests are just trying the app)
    if (!isGuest && req.body.acceptedTerms !== true) {
        res.status(400)
        throw new Error('Please accept the terms and privacy policy to create an account')
    }

    // Look if email and username exists already
    const emailExists = await User.findOne({ email })
    const usernameExists = await User.findOne(usernameQuery(username))

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
    const hashedPassword = await hashPassword(password)

    // Create user. Two sign-ups at the same moment can both pass the checks above, so a
    // duplicate-key error from the unique index is reported like any other duplicate.
    let user
    try {
        user = await User.create({
            username,
            email,
            password: hashedPassword,
            useImperial: false,
            isGuest,
            acceptedTermsAt: isGuest ? null : new Date(),
            termsVersion: isGuest ? null : TERMS_VERSION
        })
    } catch (error) {
        const duplicate = getDuplicateField(error)
        if (duplicate) {
            res.status(400)
            throw new Error(duplicate === 'email' ? 'Email already exists' : 'Username already exists')
        }
        throw error
    }

    // Verify user creation
    if (!user) {
        res.status(400)
        throw new Error('Invalid user data')
    }

    // Ask new members to confirm their email. A failure to send must not fail sign-up.
    if (!isGuest) await sendVerificationEmail(user).catch(error => console.error('Verification email failed:', error.message))

    res.status(201).json(formatUser(user, genToken(user)))
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

    // Only plain strings are accepted (blocks NoSQL operator objects like { $ne: null })
    if (typeof identifier !== 'string' || typeof password !== 'string') {
        res.status(400)
        throw new Error('Invalid input')
    }

    // Determine if identifier is email
    const isEmail = validator.isEmail(identifier)

    // Check for username
    const user = isEmail 
        ? await User.findOne({ email: validator.normalizeEmail(identifier) })
        : await User.findOne(usernameQuery(identifier))

    // Too many recent failures for this account
    if (loginThrottle.isLocked(identifier)) {
        res.status(429)
        throw new Error('Too many failed sign-in attempts for this account. Please wait a few minutes or reset your password.')
    }

    // Always run a password comparison, even for unknown users, so timing doesn't reveal accounts
    const passwordMatches = await bcrypt.compare(password, user ? user.password : DUMMY_HASH)

    if (user && passwordMatches) {
        loginThrottle.clearFailures(identifier)
        res.status(200).json(formatUser(user, genToken(user)))
    } else {
        loginThrottle.recordFailure(identifier)
        res.status(400)
        throw new Error('Invalid user credentials')
    }
})

/**
 *   @desc   Migrate guest user to strive user
 *   @route  PUT /api/users/migrate
 *   @access Private
 */
const migrateUser = asyncHandler(async (req, res) => {

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

    const { username, email, password } = validateCredentials(req.body, res)

    // Look if email and username exists already
    const emailExists = await User.findOne({ email })
    const usernameExists = await User.findOne(usernameQuery(username))

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

    if (req.body.acceptedTerms !== true) {
        res.status(400)
        throw new Error('Please accept the terms and privacy policy to create an account')
    }

    user.username = username
    user.email = email
    user.password = await hashPassword(password)
    user.isGuest = false
    user.emailVerified = false
    user.acceptedTermsAt = new Date()
    user.termsVersion = TERMS_VERSION

    try {
        await user.save()
    } catch (error) {
        const duplicate = getDuplicateField(error)
        if (duplicate) {
            res.status(400)
            throw new Error(duplicate === 'email' ? 'Email already exists' : 'Username already exists')
        }
        throw error
    }

    await sendVerificationEmail(user).catch(error => console.error('Verification email failed:', error.message))

    res.status(201).json(formatUser(user, genToken(user)))
})

/**
 *   @desc    Get current user info
 *   @route   GET /api/users/me
 *   @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
    res.status(200).json(formatUser(req.user))
})

/**
 *   @desc    Delete user and all associated data (workouts, quests, leaderboard, custom exercises)
 *   @route   DELETE /api/users/:id
 *   @access  Private (members confirm with their password)
 */
const deleteUser = asyncHandler(async (req, res) => {
    // Only your own account
    if (req.params.id !== req.user._id.toString()) {
        res.status(403)
        throw new Error('User not authorized to delete this account')
    }

    // Load with the password so members can confirm it
    const user = await User.findById(req.params.id)

    if (!user) {
        res.status(404)
        throw new Error('User not found')
    }

    // A stolen session alone must not be able to erase an account
    if (!user.isGuest) {
        const { password } = req.body || {}
        if (typeof password !== 'string' || !(await bcrypt.compare(password, user.password))) {
            res.status(400)
            throw new Error('Incorrect password')
        }
    }

    await deleteUserData(user._id)
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
    if (req.user.id !== userId) {
        res.status(403)
        throw new Error('Not authorized to reset this user')
    }

    const user = await User.findById(userId)
    if (!user) {
        res.status(404)
        throw new Error('User not found')
    }

    await resetWorkoutData(user)

    res.status(200).json({
        message: 'All user workout data has been reset successfully',
        user: formatUser(user)
    })
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
        user.target = Math.round(Number(target))
    }

    if (height !== undefined) {
        if (!height || typeof height !== 'object' || isNaN(Number(height.feet)) || isNaN(Number(height.inches))) {
            res.status(400)
            throw new Error('Height must be an object with numeric feet and inches')
        }
        const feet = Number(height.feet)
        const inches = Number(height.inches)
        if (!Number.isInteger(feet) || feet < 4 || feet > 7 || inches < 0 || inches > 12) {
            res.status(400)
            throw new Error('Height must be between 4 and 7 feet, with 0 to 12 inches')
        }
        user.height = { feet, inches }
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
    const userId = getAuthenticatedUserId(req, res)
    const user = await checkAndBreakStreak(userId)

    res.status(200).json(formatUser(user))
})

/**
 * @desc    Check if user's streak needs incrementing
 * @route   PUT /api/users/:id/streak-increased
 * @access  Private
 */
const checkIfStreakIncreased = asyncHandler(async (req, res) => {
    const userId = getAuthenticatedUserId(req, res)
    const workoutsThisWeek = await getWorkoutsThisWeek(userId, new Date())
    const user = await checkAndIncreaseStreak(userId, workoutsThisWeek)
    res.status(200).json(formatUser(user))
})

const getAuthenticatedUserId = (req, res) => {
    const authenticatedUserId = req.user?.id?.toString()
    if (!authenticatedUserId) {
        res.status(401)
        throw new Error('Not authorised')
    }

    if (req.params.id !== authenticatedUserId) {
        res.status(403)
        throw new Error('Not authorised to access this user')
    }

    return authenticatedUserId
}

/**
 * @desc    Recalculate user's momentum decay (gains are only awarded server-side)
 * @route   PUT /api/users/momentum
 * @access  Private
 */
const updateMomentum = asyncHandler(async (req, res) => {
    // The client may only trigger decay recalculation. Momentum gains are awarded
    // server-side when a workout is submitted, so request data is never trusted here.
    const user = await updateUserMomentum(req.user.id, {})
    res.status(200).json(formatUser(user))
})

// Generate JWT token
const genToken = (user) => {
    return jwt.sign({ id: user._id, v: user.tokenVersion || 0 }, process.env.JWT_SECRET, {
        expiresIn: '14d',
        algorithm: 'HS256'
    })
}

// Creates and emails a fresh email-confirmation link
const sendVerificationEmail = async (user) => {
    const { token, hash, expires } = createToken(VERIFY_TOKEN_TTL_MS)
    await User.updateOne({ _id: user._id }, { emailVerifyTokenHash: hash, emailVerifyExpires: expires })
    await mailer.sendMail({ to: user.email, ...verifyEmail(`${process.env.FRONTEND_URL}/verify-email?token=${token}`) })
}

// Export functions
module.exports = { 
    genToken,
    sendVerificationEmail,
    registerUser, 
    loginUser, 
    migrateUser,
    getMe, 
    deleteUser, 
    resetUser, 
    updateUnitPreference, 
    updateProfile,
    checkIfStreakBroken,
    checkIfStreakIncreased,
    updateMomentum
}