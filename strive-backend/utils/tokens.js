// tokens.js
// Single-use tokens for password reset and email verification. Only the SHA-256 hash is
// stored, so a leaked database cannot be used to reset anyone's password.

const crypto = require('crypto')

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000          // 1 hour
const VERIFY_TOKEN_TTL_MS = 24 * 60 * 60 * 1000    // 24 hours

const hashToken = (token) => crypto.createHash('sha256').update(String(token)).digest('hex')

// Returns the token to email and the hash/expiry to store
const createToken = (ttlMs) => {
    const token = crypto.randomBytes(32).toString('hex')
    return { token, hash: hashToken(token), expires: new Date(Date.now() + ttlMs) }
}

module.exports = { createToken, hashToken, RESET_TOKEN_TTL_MS, VERIFY_TOKEN_TTL_MS }
