// validateDuration.js
// Middleware to validate quest duration parameter

const asyncHandler = require('express-async-handler')

// Valid durations
const VALID_DURATIONS = ['daily', 'weekly', 'monthly']

/**
 * Validates that duration parameter is one of the allowed values
 */
const validateDuration = asyncHandler(async (req, res, next) => {
    const duration = req.params.duration

    // Check if duration exists
    if (!duration) {
        res.status(400)
        throw new Error('Missing duration parameter')
    }

    // Check if duration is valid
    if (!VALID_DURATIONS.includes(duration.toLowerCase())) {
        res.status(400)
        throw new Error(`Invalid duration. Must be one of: ${VALID_DURATIONS.join(', ')}`)
    }

    next()
})

module.exports = { validateDuration }
