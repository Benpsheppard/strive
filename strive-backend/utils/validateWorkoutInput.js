// validateWorkoutInput.js
// Validates and sanitises client-supplied workout data before it is stored or used for scoring

const mongoose = require('mongoose')

const LIMITS = {
    title: 100,
    maxDurationMinutes: 24 * 60,
    maxExercises: 50,
    maxSets: 100
}

// Allowed set fields and the maximum value accepted for each
const SET_FIELD_MAX = {
    weight: 2000,
    reps: 1000,
    duration: 24 * 60 * 60,
    distance: 1000,
    addedWeight: 2000,
    assistance: 2000
}

// Convert to a finite number; blank values are treated as "not provided"
const toNumber = (value) => {
    if (value === undefined || value === null || value === '') return undefined
    if (typeof value !== 'number' && typeof value !== 'string') return NaN
    return Number(value)
}

/**
 * Returns a sanitised copy of a sets array containing only known numeric fields.
 * Returns null if the array or any value in it is invalid.
 */
const sanitiseSets = (sets) => {
    if (!Array.isArray(sets) || sets.length > LIMITS.maxSets) return null

    const sanitised = []

    for (const set of sets) {
        if (!set || typeof set !== 'object' || Array.isArray(set)) return null

        const cleanSet = {}
        for (const [field, max] of Object.entries(SET_FIELD_MAX)) {
            const value = toNumber(set[field])
            if (value === undefined) continue
            if (!Number.isFinite(value) || value < 0 || value > max) return null
            cleanSet[field] = value
        }

        sanitised.push(cleanSet)
    }

    return sanitised
}

const sanitiseTitle = (title) => {
    if (typeof title !== 'string') return null
    const trimmed = title.trim()
    return trimmed && trimmed.length <= LIMITS.title ? trimmed : null
}

const sanitiseDuration = (duration) => {
    const value = toNumber(duration)
    if (value === undefined || !Number.isFinite(value) || value < 0 || value > LIMITS.maxDurationMinutes) return null
    return value
}

/**
 * Validates a new workout request body.
 * @returns {{ error: string } | { value: { title, duration, exercises } }}
 */
const validateWorkoutInput = (body = {}) => {
    const title = sanitiseTitle(body.title)
    if (!title) return { error: `Title must be a non-empty string of at most ${LIMITS.title} characters` }

    const duration = sanitiseDuration(body.duration)
    if (duration === null) return { error: 'Duration must be a number of minutes between 0 and 1440' }

    if (!Array.isArray(body.exercises) || body.exercises.length > LIMITS.maxExercises) {
        return { error: `Exercises must be an array of at most ${LIMITS.maxExercises} items` }
    }

    const exercises = []
    for (const ex of body.exercises) {
        if (!ex || typeof ex !== 'object') return { error: 'Invalid exercise' }

        if (typeof ex.exercise !== 'string' || !mongoose.Types.ObjectId.isValid(ex.exercise)) {
            return { error: 'Each exercise must reference a valid exercise id' }
        }

        if (typeof ex.selectedEquipment !== 'string' || !ex.selectedEquipment.trim()) {
            return { error: 'Each exercise must include selected equipment' }
        }

        const sets = sanitiseSets(ex.sets)
        if (!sets) return { error: 'Sets contain invalid values' }

        exercises.push({ exercise: ex.exercise, selectedEquipment: ex.selectedEquipment.trim(), sets })
    }

    return { value: { title, duration, exercises } }
}

module.exports = { validateWorkoutInput, sanitiseSets, sanitiseTitle, sanitiseDuration }
