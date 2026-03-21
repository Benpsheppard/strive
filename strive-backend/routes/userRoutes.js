// userRoutes.js
// File to handle user routes

// Imports
const express = require('express')     // Import express
const { body, param } = require('express-validator')
const { registerUser, loginUser, getMe, deleteUser, updateWeightPreference, resetUser, addPoints, migrateUser } = require('../controllers/userController.js')   // Import user controllers
const { protect } = require('../middleware/authMiddleware.js')     // Import protect function to protect routes
const { validateObjectId } = require('../middleware/validateObjectId.js')  // Import ObjectId validation

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
userRouter.put('/preference', protect, updateWeightPreference)

// Add SP
userRouter.post('/:id/points', protect, validateObjectId('id'), addPoints)

// Export router
module.exports = { userRouter }