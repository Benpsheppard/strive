// userRoutes.js
// File to handle user routes

// Imports
const express = require('express');     // Import express
const { registerUser, loginUser, getMe, deleteUser } = require('../controllers/userController.js');   // Import user controllers
const { protect } = require('../middleware/authMiddleware.js');     // Import protect function to protect routes

// Initialise router
const userRouter = express.Router();

// Register user route
userRouter.post('/', registerUser);

// Login user route
userRouter.post('/login', loginUser);

// Get logged in user route
userRouter.get('/me', protect, getMe);

// Delete user
userRouter.delete('/:id', protect, deleteUser);

// Export router
module.exports = { userRouter };