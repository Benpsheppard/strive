// userLock.js
// Runs async tasks for the same key one at a time, in the order they arrive. Used so two saves
// from the same user (a double tap, or a retry racing the original) cannot interleave.
// It lives in this process's memory, so it protects a single server instance; the unique
// clientId index on workouts is the safety net if there are ever several.

const tails = new Map()

const withLock = (key, task) => {
    const previous = tails.get(key) || Promise.resolve()

    const run = previous.then(task)
    // The chain itself must never reject, or one failure would block the key forever
    const tail = run.catch(() => {})

    tails.set(key, tail)
    tail.then(() => {
        if (tails.get(key) === tail) tails.delete(key)
    })

    return run
}

const size = () => tails.size

module.exports = { withLock, size }
