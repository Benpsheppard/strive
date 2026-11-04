// loginThrottle.js
// Limits failed sign-ins per account (not just per IP), so a spread-out guessing attack on one
// account is slowed down. Kept in memory: it resets on restart and covers a single instance.

const WINDOW_MS = 15 * 60 * 1000
const MAX_FAILURES = 8

const failures = new Map()

const keyFor = (identifier) => String(identifier || '').trim().toLowerCase().slice(0, 254)

const recent = (key, now) => (failures.get(key) || []).filter(time => now - time < WINDOW_MS)

const isLocked = (identifier, now = Date.now()) => recent(keyFor(identifier), now).length >= MAX_FAILURES

const recordFailure = (identifier, now = Date.now()) => {
    const key = keyFor(identifier)
    failures.set(key, [...recent(key, now), now])
}

const clearFailures = (identifier) => failures.delete(keyFor(identifier))

// Drop old entries so the map cannot grow forever
const prune = (now = Date.now()) => {
    for (const key of failures.keys()) {
        const kept = recent(key, now)
        if (kept.length === 0) failures.delete(key)
        else failures.set(key, kept)
    }
}

const reset = () => failures.clear()

setInterval(prune, WINDOW_MS).unref()

module.exports = { isLocked, recordFailure, clearFailures, prune, reset, MAX_FAILURES, WINDOW_MS }
