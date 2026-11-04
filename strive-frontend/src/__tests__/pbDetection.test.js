import { describe, test, expect } from 'vitest'
import { calculatePersonalBests, detectNewPBs, buildPBKey } from '../utils/pbDetection.js'

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
        expect(result).toEqual([{ exerciseName: 'Bench Press', newWeight: 90, oldWeight: 80 }])
    })

    test('a first-ever lift is not a PB', () => {
        expect(detectNewPBs(workout(90), [])).toEqual([])
    })

    test('matching the best is not a PB', () => {
        expect(detectNewPBs(workout(80), [workout(80)])).toEqual([])
    })
})
