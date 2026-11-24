// integrationKeyMiddleware.js
// Protects routes meant for my other apps (not members). They send a shared secret in a header.

// Imports
const crypto = require('crypto')

// Compares two strings without leaking, through timing, how much of the key was right
const keysMatch = (supplied, expected) => {
    const hash = (value) => crypto.createHash('sha256').update(String(value)).digest()
    return crypto.timingSafeEqual(hash(supplied), hash(expected))
}

// Only lets a request through if it carries the right key, and the integration is set up
const requireIntegrationKey = (req, res, next) => {
    const expected = process.env.LIFE_API_KEY

    // Not configured: switched off, rather than open to anyone
    if (!expected || !process.env.LIFE_USER_EMAIL) {
        return res.status(503).json({ message: 'Integration is not set up' })
    }

    const supplied = req.headers['x-integration-key']

    if (typeof supplied !== 'string' || !keysMatch(supplied, expected)) {
        return res.status(401).json({ message: 'Not Authorised' })
    }

    next()
}

module.exports = { requireIntegrationKey, keysMatch }
