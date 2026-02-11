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
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        try {
            // Get token from header
            token = req.headers.authorization.split(" ")[1]

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET)

            // Get user from token
            req.user = await User.findById(decoded.id).select('-password')

            next()
        } catch (error) {
            console.log(error)
            res.status(401)
            throw new Error('Not Authorised')
        }
    } 

    if (!token) {
        res.status(401)
        throw new Error('Not Authorised - No token')
    }
})

// Export protect function
module.exports = { protect }