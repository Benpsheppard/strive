// userRoutes.js

// Imports
const express = require('express')
const rateLimit = require('express-rate-limit')
const { ipKeyGenerator } = require('express-rate-limit')
const { 
    registerUser, loginUser, getMe, 
    deleteUser, updateUnitPreference, 
    resetUser, migrateUser,
    updateProfile, checkIfStreakBroken,
    checkIfStreakIncreased, updateMomentum
} = require('../controllers/userController.js')
const {
    forgotPassword, resetPassword, verifyEmailToken, resendVerification,
    changePassword, changeEmail, exportData
} = require('../controllers/accountController.js')
const { protect } = require('../middleware/authMiddleware.js')
const { validateObjectId } = require('../middleware/validateObjectId.js')

// Initialise router
const userRouter = express.Router()

// Limits are per client IP (the server trusts the first proxy hop, see app.js).
// They are effectively off in tests so suites can sign in and register freely.
const inTest = process.env.NODE_ENV === 'test'

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: inTest ? 10000 : 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many login attempts, please try again later' }
})

const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: inTest ? 10000 : 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many accounts created, please try again later' }
})

// Email-sending and guessing-prone routes
const forgotLimiterByIp = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: inTest ? 10000 : 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many reset requests, please try again later' }
})

// Also limit per email address so one inbox can't be flooded from many IPs
const forgotLimiterByEmail = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: inTest ? 10000 : 3,
    standardHeaders: false,
    legacyHeaders: false,
    keyGenerator: (req) => String(req.body?.email || '').trim().toLowerCase().slice(0, 254) || ipKeyGenerator(req.ip),
    message: { message: 'Too many reset requests for that email, please try again later' }
})

const tokenLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: inTest ? 10000 : 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many attempts, please try again later' }
})

const resendLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: inTest ? 10000 : 5,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => String(req.user?.id || ipKeyGenerator(req.ip)),
    message: { message: 'Too many emails requested, please try again later' }
})

// User routes
userRouter.post('/', registerLimiter, registerUser)
userRouter.post('/login', loginLimiter, loginUser)
userRouter.post('/forgot-password', forgotLimiterByIp, forgotLimiterByEmail, forgotPassword)
userRouter.post('/reset-password', tokenLimiter, resetPassword)
userRouter.post('/verify-email', tokenLimiter, verifyEmailToken)
userRouter.post('/resend-verification', protect, resendLimiter, resendVerification)
userRouter.put('/password', protect, tokenLimiter, changePassword)
userRouter.put('/email', protect, tokenLimiter, changeEmail)
userRouter.get('/export', protect, exportData)
userRouter.put('/migrate', protect, migrateUser)
userRouter.get('/me', protect, getMe)
userRouter.put('/preference', protect, updateUnitPreference)
userRouter.put('/profile', protect, updateProfile)
userRouter.put('/momentum', protect, updateMomentum)

userRouter.delete('/:id', protect, validateObjectId('id'), deleteUser)
userRouter.delete('/:id/reset', protect, validateObjectId('id'), resetUser)
userRouter.put('/:id/streak-broken', protect, validateObjectId('id'), checkIfStreakBroken)
userRouter.put('/:id/streak-increased', protect, validateObjectId('id'), checkIfStreakIncreased)

// Export router
module.exports = { userRouter }