// authMiddleware.js
// File to handle authorisation

// Imports
const jwt = require('jsonwebtoken')    // Import JWT for token usage
const asyncHandler = require('express-async-handler')      // Import asyncHandler
const User = require('../models/userModel.js')      // Import user schema model 

// Function to protect routes
const protect = asyncHandler(async (req, res, next) => {
    let token

    // Check if route has auth and that auth is bearer token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        // Get token from header
        token = req.headers.authorization.split(" ")[1]
    }

    // Check if token exists
    if (!token) {
        res.status(401)
        throw new Error('Not Authorised - No token')
    }

    // Verify token and get user
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = await User.findById(decoded.id).select('-password')
    } catch (error) {
        res.status(401)
        throw new Error('Not Authorised')
    }

    // Token is valid but the account no longer exists (e.g. deleted)
    if (!req.user) {
        res.status(401)
        throw new Error('Not Authorised - User no longer exists')
    }

    next()
})

// Export protect function
module.exports = { protect }