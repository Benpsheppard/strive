// userRoutes.js
// File to handle user routes

// Imports
const express = require('express')     // Import express
const { body, param } = require('express-validator')
const { registerUser, loginUser, getMe, deleteUser, updateWeightPreference, resetUser, addPoints, migrateUser } = require('../controllers/userController.js')   // Import user controllers
const { protect } = require('../middleware/authMiddleware.js')     // Import protect function to protect routes
const { validateObjectId } = require('../middleware/validateObjectId.js')  // Import ObjectId validation
const validateRequest = require('../middleware/validateRequest.js')

// Initialise router
const userRouter = express.Router()

// Register user route
userRouter.post(
  '/',
  body('username').isString().trim().notEmpty().withMessage('Username is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isStrongPassword().withMessage('Password must be strong'),
  validateRequest,
  registerUser
)

// Login user route
userRouter.post(
  '/login',
  body('password').isString().notEmpty().withMessage('Password is required'),
  body('username').optional().isString().trim(),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body().custom((value) => {
    if (!value.username && !value.email) {
      throw new Error('Username or email is required')
    }
    return true
  }),
  validateRequest,
  loginUser
)

// Migrate guest user route
userRouter.put(
  '/migrate',
  protect,
  body('username').isString().trim().notEmpty().withMessage('Username is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isStrongPassword().withMessage('Password must be strong'),
  validateRequest,
  migrateUser
)

// Get logged in user route
userRouter.get('/me', protect, getMe)

// Delete user
userRouter.delete('/:id', protect, validateObjectId('id'), deleteUser)

// Reset user
userRouter.delete('/:id/reset', protect, validateObjectId('id'), resetUser)

// Update weight unit preference
userRouter.put(
  '/preference',
  protect,
  body('useImperial').isBoolean().withMessage('useImperial must be true or false'),
  validateRequest,
  updateWeightPreference
)

// Add SP
userRouter.post(
  '/:id/points',
  protect,
  validateObjectId('id'),
  body('points').isInt({ min: 0 }).withMessage('Points must be an integer >= 0'),
  validateRequest,
  addPoints
)

// Export router
module.exports = { userRouter }