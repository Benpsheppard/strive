// userRoutes.js
// File to handle user routes

// Imports
const express = require('express')
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

// Register user route
userRouter.post('/', registerUser)

// Login user route
userRouter.post('/login', loginUser)

// Migrate guest user route
userRouter.put('/migrate', protect, migrateUser)

// Get logged in user route
userRouter.get('/me', protect, getMe)

// Delete user
userRouter.delete('/:id', protect, validateObjectId('id'), deleteUser)

// Reset user
userRouter.delete('/:id/reset', protect, validateObjectId('id'), resetUser)

// Update weight unit preference
userRouter.put('/preference', protect, updateUnitPreference)

// Add SP
userRouter.post('/:id/points', protect, validateObjectId('id'), addPoints)

// Update profile information
userRouter.put('/profile', protect, updateProfile)

// Update streak
userRouter.put('/:id/streak', protect, updateStreak)

// Update momentum
userRouter.put('/momentum', protect, updateMomentum)

// Export router
module.exports = { userRouter }