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

// User routes
userRouter.post('/', registerUser)
userRouter.post('/login', loginUser)
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