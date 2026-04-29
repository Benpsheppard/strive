// userRoutes.js

// Imports
const express = require('express')
const rateLimit = require('express-rate-limit')
const { 
    registerUser, loginUser, getMe, 
    deleteUser, updateUnitPreference, 
    resetUser, addPoints, migrateUser, 
    updateProfile, updateStreak, 
    updateMomentum
} = require('../controllers/userController.js')
const { protect } = require('../middleware/authMiddleware.js')
const { validateObjectId } = require('../middleware/validateObjectId.js')

// Initialise router
const userRouter = express.Router()

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 3,
    message: 'Too many login attempts, please try again later'
})

// User routes
userRouter.post('/', rateLimit({ max: 3 }), registerUser)
userRouter.post('/login', loginLimiter, loginUser)
userRouter.put('/migrate', protect, migrateUser)
userRouter.get('/me', protect, getMe)
userRouter.put('/preference', protect, updateUnitPreference)
userRouter.put('/profile', protect, updateProfile)
userRouter.put('/momentum', protect, updateMomentum)

userRouter.delete('/:id', protect, validateObjectId('id'), deleteUser)
userRouter.delete('/:id/reset', protect, validateObjectId('id'), resetUser)
userRouter.post('/:id/points', protect, validateObjectId('id'), addPoints)
userRouter.put('/:id/streak', protect, updateStreak)

// Export router
module.exports = { userRouter }