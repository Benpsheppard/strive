// validateObjectId.js
// Middleware to validate MongoDB ObjectId parameters

const asyncHandler = require('express-async-handler')
const { isObjectId } = require('../utils/isObjectId')

/**
 * Validates that a parameter is a valid MongoDB ObjectId
 * @param {string} paramName - The name of the parameter to validate (default: 'id')
 */
const validateObjectId = (paramName = 'id') => {
    return asyncHandler(async (req, res, next) => {
        const id = req.params[paramName]

        // Check if id exists
        if (!id) {
            res.status(400)
            throw new Error(`Missing ${paramName} parameter`)
        }

        // Check if id is a valid MongoDB ObjectId
        if (!isObjectId(id)) {
            res.status(400)
            throw new Error(`Invalid ${paramName} format`)
        }

        next()
    })
}

module.exports = { validateObjectId }
