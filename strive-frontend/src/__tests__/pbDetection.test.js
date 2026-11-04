import { describe, test, expect } from 'vitest'
import { calculatePersonalBests, calculateAllPersonalBests, detectNewPBs, getLastSession, getLastEquipment, buildPBKey } from '../utils/pbDetection.js'

const bench = { name: 'Bench Press', trackingMode: 'weight_reps', muscleGroup: 'Chest' }

const workout = (weight, equipment = 'Barbell', date = '2026-10-01') => ({
    createdAt: date,
    exercises: [{ exercise: bench, selectedEquipment: equipment, sets: [{ weight, reps: 5 }] }]
})

describe('calculatePersonalBests', () => {
    test('keeps the heaviest weight per exercise and equipment', () => {
        const pbs = calculatePersonalBests([workout(60), workout(80), workout(70)])
        expect(pbs[buildPBKey('Bench Press', 'Barbell')].weight).toBe(80)
    })

    test('tracks equipment separately', () => {
        const pbs = calculatePersonalBests([workout(60, 'Barbell'), workout(40, 'Dumbbell')])
        expect(pbs[buildPBKey('Bench Press', 'Dumbbell')].weight).toBe(40)
        expect(pbs[buildPBKey('Bench Press', 'Barbell')].weight).toBe(60)
    })

    test('ignores exercises that are not populated', () => {
        const unpopulated = { createdAt: '2026-10-01', exercises: [{ exercise: 'abc', sets: [{ weight: 100, reps: 5 }] }] }
        expect(calculatePersonalBests([unpopulated])).toEqual({})
    })
})

describe('detectNewPBs', () => {
    test('beating the previous best is a PB', () => {
        const result = detectNewPBs(workout(90), [workout(80)])
        expect(result).toEqual([{ exerciseName: 'Bench Press', metric: 'max_weight', newValue: 90, oldValue: 80 }])
    })

    test('a first-ever lift is not a PB', () => {
        expect(detectNewPBs(workout(90), [])).toEqual([])
    })

    test('matching the best is not a PB', () => {
        expect(detectNewPBs(workout(80), [workout(80)])).toEqual([])
    })
})

describe('calculateAllPersonalBests', () => {
    const plank = { _id: 'p1', name: 'Plank', trackingMode: 'duration', muscleGroup: 'Core' }
    const pullUp = { _id: 'p2', name: 'Pull Up', trackingMode: 'bodyweight_reps', muscleGroup: 'Back' }
    const run = { _id: 'p3', name: 'Running', trackingMode: 'distance_duration', muscleGroup: 'Cardio' }

    const log = (exercise, sets, equipment = 'Bodyweight') => ({
        createdAt: '2026-10-01',
        exercises: [{ exercise, selectedEquipment: equipment, sets }]
    })

    test('measures each tracking mode in its own metric', () => {
        const pbs = calculateAllPersonalBests([
            log(plank, [{ duration: 30 }, { duration: 60 }]),
            log(pullUp, [{ reps: 8 }, { reps: 10 }]),
            log(run, [{ distance: 3, duration: 900 }, { distance: 2, duration: 600 }], 'Treadmill')
        ])

        expect(pbs[buildPBKey('Plank', 'Bodyweight')]).toMatchObject({ metric: 'best_duration', value: 60 })
        expect(pbs[buildPBKey('Pull Up', 'Bodyweight')]).toMatchObject({ metric: 'max_reps', value: 10 })
        expect(pbs[buildPBKey('Running', 'Treadmill')]).toMatchObject({ metric: 'total_distance', value: 5 })
    })

    test('skips exercises with nothing logged', () => {
        expect(calculateAllPersonalBests([log(pullUp, [{ reps: 0 }])])).toEqual({})
    })
})

describe('detectNewPBs for other modes', () => {
    const pullUp = { _id: 'p2', name: 'Pull Up', trackingMode: 'bodyweight_reps' }
    const log = (reps) => ({ exercises: [{ exercise: pullUp, selectedEquipment: 'Bodyweight', sets: [{ reps }] }] })

    test('more reps than before is a PB', () => {
        expect(detectNewPBs(log(11), [log(10)])).toHaveLength(1)
    })

    test('a tiny weight increase is not a PB', () => {
        const bench = { _id: 'b', name: 'Bench Press', trackingMode: 'weight_reps' }
        const lift = (weight) => ({ exercises: [{ exercise: bench, selectedEquipment: 'Barbell', sets: [{ weight, reps: 5 }] }] })
        expect(detectNewPBs(lift(100.1), [lift(100)])).toEqual([])
        expect(detectNewPBs(lift(101), [lift(100)])).toHaveLength(1)
    })
})

describe('getLastSession', () => {
    const squat = { _id: 'sq', name: 'Squat', trackingMode: 'weight_reps' }
    const session = (date, equipment, sets) => ({
        createdAt: date,
        exercises: [{ exercise: squat, selectedEquipment: equipment, sets }]
    })

    const history = [
        session('2026-10-01', 'Barbell', [{ weight: 100, reps: 5 }]),
        session('2026-10-08', 'Smith Machine', [{ weight: 90, reps: 8 }]),
        session('2026-10-15', 'Barbell', [{ weight: 105, reps: 5 }, { weight: 105, reps: 4 }])
    ]

    test('returns the most recent session for the exercise', () => {
        const last = getLastSession(history, 'sq')
        expect(last.sets).toHaveLength(2)
        expect(last.equipment).toBe('Barbell')
    })

    test('can be narrowed to one piece of equipment', () => {
        const last = getLastSession(history, 'sq', 'smith machine')
        expect(last.sets).toEqual([{ weight: 90, reps: 8 }])
    })

    test('works with unpopulated exercise ids', () => {
        const raw = [{ createdAt: '2026-10-01', exercises: [{ exercise: 'sq', selectedEquipment: 'Barbell', sets: [{ weight: 50, reps: 5 }] }] }]
        expect(getLastSession(raw, 'sq').sets).toHaveLength(1)
    })

    test('returns null when never logged', () => {
        expect(getLastSession(history, 'other')).toBeNull()
        expect(getLastSession(history, null)).toBeNull()
    })

    test('last equipment', () => {
        expect(getLastEquipment(history, 'sq')).toBe('Barbell')
        expect(getLastEquipment(history, 'nope')).toBeNull()
    })
})
