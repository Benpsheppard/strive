// integrationRateLimit.js
// Rate limits for the routes meant for my other apps (not members)

// Imports
const { rateLimit } = require('express-rate-limit')

const message = { message: 'Too many requests, please try again later' }

// Caps every request from one IP (good or bad), to stop runaway polling
const createIntegrationLimiter = (options = {}) => rateLimit({
    windowMs: 60 * 1000,
    limit: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message,
    ...options
})

// Only counts failed requests (wrong or missing key), to stop the key being guessed
const createIntegrationFailureLimiter = (options = {}) => rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false,
    message,
    ...options
})

module.exports = { createIntegrationLimiter, createIntegrationFailureLimiter }
