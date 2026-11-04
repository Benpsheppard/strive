// pendingWorkouts.js
// Workouts that could not be uploaded (no signal in the gym, a server hiccup) wait here, on the
// device, and are sent again later. Each carries its clientId, so sending twice is harmless.

const KEY = 'Strive:pendingWorkouts'
const MAX_PENDING = 25
export const PENDING_CHANGED = 'strive:pending-workouts-changed'

const read = () => {
    try {
        const list = JSON.parse(localStorage.getItem(KEY))
        return Array.isArray(list) ? list : []
    } catch {
        return []
    }
}

const write = (list) => {
    try {
        localStorage.setItem(KEY, JSON.stringify(list))
    } catch {
        // Storage full or blocked: nothing more we can do here
    }
    window.dispatchEvent(new Event(PENDING_CHANGED))
}

export const getPendingWorkouts = (userId) => read().filter(item => item.userId === userId)

export const countPendingWorkouts = (userId) => getPendingWorkouts(userId).length

// Adds a workout to the queue. Returns false if it could not be kept.
export const addPendingWorkout = (userId, payload) => {
    if (!payload?.clientId) return false

    const list = read()
    if (list.some(item => item.userId === userId && item.payload.clientId === payload.clientId)) return true

    const forUser = list.filter(item => item.userId === userId)
    if (forUser.length >= MAX_PENDING) return false

    write([...list, { userId, payload, queuedAt: Date.now() }])
    return true
}

export const removePendingWorkout = (userId, clientId) =>
    write(read().filter(item => !(item.userId === userId && item.payload.clientId === clientId)))

export const clearPendingWorkouts = () => {
    try { localStorage.removeItem(KEY) } catch { /* nothing to clear */ }
    window.dispatchEvent(new Event(PENDING_CHANGED))
}
