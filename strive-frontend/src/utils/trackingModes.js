// trackingModes.js
// One place describing how each exercise tracking mode is entered, validated, stored,
// displayed and measured for personal bests. Mirrors the backend's getPBMetric.

import {
    formatWeight, formatDistance, formatSeconds, formatNumber,
    kgToLbs, lbsToKg, kmToMiles, milesToKm
} from './formatValues.js'

// Backend limits (utils/validateWorkoutInput.js)
const MAX_WEIGHT_KG = 2000
const MAX_REPS = 1000
const MAX_DISTANCE_KM = 1000
const MAX_DURATION_SECONDS = 24 * 60 * 60

const round1 = (value) => Math.round(value * 10) / 10

// Input fields. `toStored` converts what the user typed to the stored unit (kg, km, seconds)
// and `toDisplay` converts back for prefilling the form.
const FIELDS = {
    weight: {
        label: 'Weight',
        unit: (imperial) => (imperial ? 'lbs' : 'kg'),
        inputMode: 'decimal',
        step: '0.5',
        toStored: (v, imperial) => (imperial ? lbsToKg(v) : v),
        toDisplay: (v, imperial) => round1(imperial ? kgToLbs(v) : v),
        maxStored: MAX_WEIGHT_KG,
        allowZero: false
    },
    assistance: {
        label: 'Assistance',
        unit: (imperial) => (imperial ? 'lbs' : 'kg'),
        inputMode: 'decimal',
        step: '0.5',
        toStored: (v, imperial) => (imperial ? lbsToKg(v) : v),
        toDisplay: (v, imperial) => round1(imperial ? kgToLbs(v) : v),
        maxStored: MAX_WEIGHT_KG,
        allowZero: true
    },
    reps: {
        label: 'Reps',
        unit: () => '',
        inputMode: 'numeric',
        step: '1',
        integer: true,
        toStored: (v) => v,
        toDisplay: (v) => v,
        maxStored: MAX_REPS,
        allowZero: false
    },
    distance: {
        label: 'Distance',
        unit: (imperial) => (imperial ? 'mi' : 'km'),
        inputMode: 'decimal',
        step: '0.01',
        toStored: (v, imperial) => (imperial ? milesToKm(v) : v),
        toDisplay: (v, imperial) => Math.round((imperial ? kmToMiles(v) : v) * 100) / 100,
        maxStored: MAX_DISTANCE_KM,
        allowZero: false
    },
    // Short holds (planks, stretches) are entered in seconds
    durationSeconds: {
        storedName: 'duration',
        label: 'Time',
        unit: () => 'sec',
        inputMode: 'numeric',
        step: '1',
        integer: true,
        toStored: (v) => v,
        toDisplay: (v) => Math.round(v),
        maxStored: MAX_DURATION_SECONDS,
        allowZero: false
    },
    // Longer efforts (cardio) are entered in minutes
    durationMinutes: {
        storedName: 'duration',
        label: 'Time',
        unit: () => 'min',
        inputMode: 'decimal',
        step: '0.5',
        toStored: (v) => Math.round(v * 60),
        toDisplay: (v) => round1(v / 60),
        maxStored: MAX_DURATION_SECONDS,
        allowZero: false
    }
}

// PB measurements (names match the backend's getPBMetric)
const sum = (sets, key) => sets.reduce((total, s) => total + (Number(s[key]) || 0), 0)
const max = (sets, key) => Math.max(0, ...sets.map(s => Number(s[key]) || 0))

const MEASURES = {
    max_weight: (sets) => max(sets, 'weight'),
    max_reps: (sets) => max(sets, 'reps'),
    best_duration: (sets) => max(sets, 'duration'),
    total_distance: (sets) => sum(sets, 'distance')
}

export const TRACKING_MODES = {
    weight_reps: { label: 'Weight & reps', fields: ['weight', 'reps'], pbMetric: 'max_weight' },
    bodyweight_reps: { label: 'Bodyweight reps', fields: ['reps'], pbMetric: 'max_reps' },
    assisted_reps: { label: 'Assisted reps', fields: ['assistance', 'reps'], pbMetric: 'max_reps' },
    reps: { label: 'Reps', fields: ['reps'], pbMetric: 'max_reps' },
    duration: { label: 'Time', fields: ['durationSeconds'], pbMetric: 'best_duration' },
    distance: { label: 'Distance', fields: ['distance'], pbMetric: 'total_distance' },
    distance_duration: { label: 'Distance & time', fields: ['distance', 'durationMinutes'], pbMetric: 'total_distance' }
}

export const isSupportedMode = (mode) => Object.prototype.hasOwnProperty.call(TRACKING_MODES, mode)

const storedName = (fieldKey) => FIELDS[fieldKey].storedName || fieldKey

// The inputs to show for a mode, with labels, units and keyboard hints
export const getModeFields = (mode, useImperial = false) => {
    if (!isSupportedMode(mode)) return []

    return TRACKING_MODES[mode].fields.map((key) => {
        const field = FIELDS[key]
        const unit = field.unit(useImperial)
        return {
            key,
            name: storedName(key),
            label: unit ? `${field.label} (${unit})` : field.label,
            inputMode: field.inputMode,
            step: field.step,
            required: key !== 'assistance'
        }
    })
}

export const getEmptySet = (mode) => {
    const empty = {}
    getModeFields(mode).forEach(field => { empty[field.name] = '' })
    return empty
}

// Check what the user typed. Returns { valid, errors: { [fieldName]: message } }
export const validateSet = (mode, raw, useImperial = false) => {
    const errors = {}
    if (!isSupportedMode(mode)) {
        return { valid: false, errors: { _form: 'This exercise type cannot be logged yet' } }
    }

    TRACKING_MODES[mode].fields.forEach((key) => {
        const field = FIELDS[key]
        const name = storedName(key)
        const text = raw?.[name]

        // Assistance may be left blank (treated as 0)
        if ((text === '' || text === undefined || text === null) && key === 'assistance') return

        if (text === '' || text === undefined || text === null) {
            errors[name] = `Enter ${field.label.toLowerCase()}`
            return
        }

        const value = Number(text)
        if (!Number.isFinite(value) || value < 0) {
            errors[name] = `${field.label} must be a positive number`
            return
        }
        if (value === 0 && !field.allowZero) {
            errors[name] = `${field.label} must be more than 0`
            return
        }
        if (field.integer && !Number.isInteger(value)) {
            errors[name] = `${field.label} must be a whole number`
            return
        }
        if (field.toStored(value, useImperial) > field.maxStored) {
            errors[name] = `${field.label} is too large`
        }
    })

    return { valid: Object.keys(errors).length === 0, errors }
}

// Convert what the user typed into the stored set (kg, km, seconds)
export const buildSet = (mode, raw, useImperial = false) => {
    const set = {}
    TRACKING_MODES[mode].fields.forEach((key) => {
        const text = raw?.[storedName(key)]
        const value = text === '' || text === undefined || text === null ? 0 : Number(text)
        set[storedName(key)] = FIELDS[key].toStored(value, useImperial)
    })
    return set
}

// Convert a stored set back to what should appear in the form inputs
export const setToRaw = (mode, set, useImperial = false) => {
    const raw = {}
    TRACKING_MODES[mode].fields.forEach((key) => {
        const name = storedName(key)
        const stored = Number(set?.[name]) || 0
        raw[name] = stored === 0 && key === 'assistance' ? '' : String(FIELDS[key].toDisplay(stored, useImperial))
    })
    return raw
}

// One-line description of a set, e.g. "80 kg × 8"
export const formatSet = (mode, set, useImperial = false) => {
    switch (mode) {
        case 'weight_reps':
            return `${formatWeight(set.weight, useImperial)} × ${formatNumber(set.reps)}`
        case 'bodyweight_reps':
        case 'reps':
            return `${formatNumber(set.reps)} reps`
        case 'assisted_reps':
            return Number(set.assistance) > 0
                ? `${formatNumber(set.reps)} reps (${formatWeight(set.assistance, useImperial)} assist)`
                : `${formatNumber(set.reps)} reps`
        case 'duration':
            return formatSeconds(Math.round(set.duration))
        case 'distance':
            return formatDistance(set.distance, useImperial)
        case 'distance_duration':
            return `${formatDistance(set.distance, useImperial)} in ${formatSeconds(Math.round(set.duration))}`
        default:
            return ''
    }
}

// Total weight lifted by a set (the backend's "volume")
export const getSetVolume = (set) => (Number(set.weight) || 0) * (Number(set.reps) || 0)

// ─── Personal bests ──────────────────────────────────────────────────────────
// Returns { metric, value } for an exercise's sets, or null if the mode has no PB
export const measurePB = (mode, sets) => {
    if (!isSupportedMode(mode)) return null
    const metric = TRACKING_MODES[mode].pbMetric
    return { metric, value: MEASURES[metric](sets || []) }
}

// Display a PB value in the unit of its metric
export const formatPBValue = (metric, value, useImperial = false) => {
    switch (metric) {
        case 'max_reps':
            return `${formatNumber(value)} reps`
        case 'best_duration':
            return formatSeconds(Math.round(value))
        case 'total_distance':
            return formatDistance(value, useImperial)
        case 'max_weight':
        default:
            return formatWeight(value, useImperial)
    }
}

// Smallest improvement that counts as a new PB (mirrors backend utils/spRules.js)
const MIN_PB_INCREASE_RATIO = 0.01
const MIN_WEIGHT_PB_INCREASE = 0.5

export const getMinPBIncrease = (metric, previousValue) => {
    const proportional = previousValue * MIN_PB_INCREASE_RATIO
    return metric === 'max_weight' ? Math.max(proportional, MIN_WEIGHT_PB_INCREASE) : proportional
}

export const beatsPB = (metric, previousValue, newValue) =>
    newValue >= previousValue + getMinPBIncrease(metric, previousValue)
