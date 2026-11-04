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
        const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] })
        req.user = await User.findById(decoded.id).select('-password -workouts')

        // A password change or reset signs out every older session
        if (req.user && (decoded.v ?? 0) !== (req.user.tokenVersion ?? 0)) {
            req.user = null
            res.status(401)
            throw new Error('Session expired, please sign in again')
        }
    } catch (error) {
        res.status(401)
        throw new Error(error.message === 'Session expired, please sign in again' ? error.message : 'Not Authorised')
    }

    // Token is valid but the account no longer exists (e.g. deleted)
    if (!req.user) {
        res.status(401)
        throw new Error('Not Authorised - User no longer exists')
    }

    next()
})

// Attaches req.user when a valid token is sent, but never rejects the request
const optionalProtect = asyncHandler(async (req, res, next) => {
    const header = req.headers.authorization

    if (header && header.startsWith('Bearer ')) {
        try {
            const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET, { algorithms: ['HS256'] })
            req.user = await User.findById(decoded.id).select('-password -workouts')
            if (req.user && (decoded.v ?? 0) !== (req.user.tokenVersion ?? 0)) req.user = null
        } catch (error) {
            req.user = null
        }
    }

    next()
})

// Export protect functions
module.exports = { protect, optionalProtect }