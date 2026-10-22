// userRoutes.js

// Imports
const express = require('express')
const rateLimit = require('express-rate-limit')
const { 
    registerUser, loginUser, getMe, 
    deleteUser, updateUnitPreference, 
    resetUser, migrateUser,
    updateProfile, checkIfStreakBroken,
    checkIfStreakIncreased, updateMomentum
} = require('../controllers/userController.js')
const { protect } = require('../middleware/authMiddleware.js')
const { validateObjectId } = require('../middleware/validateObjectId.js')

// Initialise router
const userRouter = express.Router()

// Limits are per client IP (the server trusts the first proxy hop, see server.js)
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many login attempts, please try again later' }
})

const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many accounts created, please try again later' }
})

// User routes
userRouter.post('/', registerLimiter, registerUser)
userRouter.post('/login', loginLimiter, loginUser)
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