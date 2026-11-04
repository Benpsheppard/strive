import { describe, test, expect } from 'vitest'
import {
    TRACKING_MODES, isSupportedMode, getModeFields, getEmptySet, validateSet,
    buildSet, setToRaw, formatSet, measurePB, formatPBValue, beatsPB
} from '../utils/trackingModes.js'

describe('modes', () => {
    test('supports every mode the exercise library uses', () => {
        ;['weight_reps', 'bodyweight_reps', 'assisted_reps', 'reps', 'duration', 'distance_duration', 'distance']
            .forEach(mode => expect(isSupportedMode(mode)).toBe(true))
        expect(isSupportedMode('other')).toBe(false)
        expect(isSupportedMode('__proto__')).toBe(false)
    })

    test('fields include units for the user preference', () => {
        expect(getModeFields('weight_reps', false).map(f => f.label)).toEqual(['Weight (kg)', 'Reps'])
        expect(getModeFields('weight_reps', true).map(f => f.label)).toEqual(['Weight (lbs)', 'Reps'])
        expect(getModeFields('distance_duration', true).map(f => f.label)).toEqual(['Distance (mi)', 'Time (min)'])
        expect(getModeFields('duration').map(f => f.label)).toEqual(['Time (sec)'])
    })

    test('empty sets use the backend field names', () => {
        expect(getEmptySet('distance_duration')).toEqual({ distance: '', duration: '' })
        expect(getEmptySet('assisted_reps')).toEqual({ assistance: '', reps: '' })
        expect(getEmptySet('nope')).toEqual({})
    })
})

describe('validateSet', () => {
    test('accepts valid input', () => {
        expect(validateSet('weight_reps', { weight: '80', reps: '8' }).valid).toBe(true)
        expect(validateSet('bodyweight_reps', { reps: '12' }).valid).toBe(true)
        expect(validateSet('duration', { duration: '45' }).valid).toBe(true)
    })

    test('reports each missing or bad field', () => {
        const { valid, errors } = validateSet('weight_reps', { weight: '', reps: '0' })
        expect(valid).toBe(false)
        expect(errors.weight).toMatch(/Enter weight/)
        expect(errors.reps).toMatch(/more than 0/)
    })

    test('rejects negatives, decimals reps and huge values', () => {
        expect(validateSet('weight_reps', { weight: '-5', reps: '5' }).valid).toBe(false)
        expect(validateSet('weight_reps', { weight: '50', reps: '5.5' }).errors.reps).toMatch(/whole/)
        expect(validateSet('weight_reps', { weight: '5000', reps: '5' }).errors.weight).toMatch(/too large/)
        expect(validateSet('weight_reps', { weight: 'abc', reps: '5' }).valid).toBe(false)
    })

    test('limit applies in the stored unit, so lbs inputs convert first', () => {
        expect(validateSet('weight_reps', { weight: '4000', reps: '5' }, true).valid).toBe(true)
        expect(validateSet('weight_reps', { weight: '5000', reps: '5' }, true).valid).toBe(false)
    })

    test('assistance is optional', () => {
        expect(validateSet('assisted_reps', { assistance: '', reps: '8' }).valid).toBe(true)
    })

    test('unsupported modes cannot be logged', () => {
        expect(validateSet('other', {}).valid).toBe(false)
    })
})

describe('buildSet and setToRaw', () => {
    test('stores imperial weights in kg and round trips', () => {
        const set = buildSet('weight_reps', { weight: '135', reps: '5' }, true)
        expect(set.weight).toBeCloseTo(61.23, 1)
        expect(set.reps).toBe(5)
        expect(setToRaw('weight_reps', set, true)).toEqual({ weight: '135', reps: '5' })
    })

    test('metric weights are unchanged', () => {
        expect(buildSet('weight_reps', { weight: '62.5', reps: '8' })).toEqual({ weight: 62.5, reps: 8 })
    })

    test('cardio time is entered in minutes and stored in seconds', () => {
        const set = buildSet('distance_duration', { distance: '5', duration: '25' })
        expect(set).toEqual({ distance: 5, duration: 1500 })
        expect(setToRaw('distance_duration', set)).toEqual({ distance: '5', duration: '25' })
    })

    test('imperial distance is stored in km', () => {
        const set = buildSet('distance', { distance: '3.1' }, true)
        expect(set.distance).toBeCloseTo(4.99, 1)
    })

    test('blank assistance is stored as 0 and shown blank again', () => {
        const set = buildSet('assisted_reps', { assistance: '', reps: '6' })
        expect(set).toEqual({ assistance: 0, reps: 6 })
        expect(setToRaw('assisted_reps', set).assistance).toBe('')
    })
})

describe('formatSet', () => {
    test('formats each mode', () => {
        expect(formatSet('weight_reps', { weight: 80, reps: 8 })).toBe('80.0 kg × 8')
        expect(formatSet('bodyweight_reps', { reps: 12 })).toBe('12 reps')
        expect(formatSet('assisted_reps', { assistance: 20, reps: 6 })).toBe('6 reps (20.0 kg assist)')
        expect(formatSet('duration', { duration: 90 })).toBe('1m 30s')
        expect(formatSet('distance_duration', { distance: 5, duration: 1500 })).toBe('5.0 km in 25m')
    })
})

describe('personal best helpers', () => {
    test('measures by mode', () => {
        expect(measurePB('weight_reps', [{ weight: 50, reps: 5 }, { weight: 60, reps: 3 }])).toEqual({ metric: 'max_weight', value: 60 })
        expect(measurePB('distance', [{ distance: 2 }, { distance: 3 }])).toEqual({ metric: 'total_distance', value: 5 })
        expect(measurePB('other', [])).toBeNull()
    })

    test('formats values by metric', () => {
        expect(formatPBValue('max_reps', 12)).toBe('12 reps')
        expect(formatPBValue('best_duration', 75)).toBe('1m 15s')
        expect(formatPBValue('total_distance', 5, true)).toBe('3.1 miles')
    })

    test('beating a PB needs a meaningful increase', () => {
        expect(beatsPB('max_weight', 100, 100.4)).toBe(false)
        expect(beatsPB('max_weight', 100, 101)).toBe(true)
        expect(beatsPB('max_weight', 20, 20.5)).toBe(true)
        expect(beatsPB('max_reps', 10, 11)).toBe(true)
        expect(beatsPB('max_reps', 10, 10)).toBe(false)
    })

    test('table covers all modes', () => {
        expect(Object.keys(TRACKING_MODES)).toHaveLength(7)
    })
})
