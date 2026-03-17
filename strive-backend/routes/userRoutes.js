// userRoutes.js
// File to handle user routes

// Imports
const express = require('express')     // Import express
const { registerUser, loginUser, getMe, deleteUser, updateWeightPreference, resetUser, addPoints, migrateUser } = require('../controllers/userController.js')   // Import user controllers
const { protect } = require('../middleware/authMiddleware.js')     // Import protect function to protect routes

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
userRouter.delete('/:id', protect, deleteUser)

// Reset user
userRouter.delete('/:id/reset', protect, resetUser)

// Update weight unit preference
userRouter.put('/preference', protect, updateWeightPreference)

// Add SP
userRouter.post('/:id/points', protect, addPoints)

// Export router
module.exports = { userRouter }