const { ACHIEVEMENTS, EVENTS, BY_ID, toPublic } = require('../utils/achievements/definitions.js')
const { toLocal } = require('../utils/achievements/evaluate.js')

const find = (id) => BY_ID.get(id)

// A minimal context a check() can run against
const ctx = (overrides = {}) => ({
    user: { level: 1, streak: { best: 0, current: 0 } },
    workout: { createdAt: new Date('2026-03-10T12:00:00Z'), duration: 30, exercises: [] },
    summary: { totalWeight: 0, personalBests: [], questsCompleted: [] },
    exercises: [],
    flags: {},
    previousWorkoutAt: null,
    stats: { workouts: 1, volume: 0, personalBests: 0, questsCompleted: 0 },
    local: { hour: 12, minute: 30, month: 2, day: 10 },
    ...overrides
})

describe('definitions', () => {
    test('ids are unique', () => {
        const ids = ACHIEVEMENTS.map(a => a.id)
        expect(new Set(ids).size).toBe(ids.length)
    })

    test('every achievement is either workout-based (check) or event-based (event)', () => {
        for (const a of ACHIEVEMENTS) {
            expect(Boolean(a.check) !== Boolean(a.event)).toBe(true)
        }
    })

    test('event ids map back to a secret achievement', () => {
        for (const [, id] of EVENTS) expect(find(id).secret).toBe(true)
    })
})

describe('toPublic', () => {
    test('masks a locked secret so the answer is not in the response', () => {
        const masked = toPublic(find('high_noon'))
        expect(masked.name).toBe('???')
        expect(masked.description).not.toMatch(/12:00/)
        expect(masked.icon).toBe('lock')
    })

    test('reveals a secret once unlocked', () => {
        const shown = toPublic(find('high_noon'), new Date())
        expect(shown.name).toBe('High Noon')
    })

    test('non-secret achievements are always visible', () => {
        expect(toPublic(find('early_bird')).name).toBe('Early Bird')
    })
})

describe('milestones', () => {
    test('workout count thresholds', () => {
        expect(find('workouts_1').check(ctx({ stats: { workouts: 1 } }))).toBe(true)
        expect(find('workouts_10').check(ctx({ stats: { workouts: 9 } }))).toBe(false)
        expect(find('workouts_10').check(ctx({ stats: { workouts: 10 } }))).toBe(true)
    })

    test('streak uses the best streak so a broken streak keeps its badge', () => {
        const user = { level: 1, streak: { best: 5, current: 0 } }
        expect(find('streak_4').check(ctx({ user }))).toBe(true)
        expect(find('streak_12').check(ctx({ user }))).toBe(false)
    })
})

describe('wacky and secret checks', () => {
    test('early bird and night owl use local hour', () => {
        expect(find('early_bird').check(ctx({ local: { hour: 5 } }))).toBe(true)
        expect(find('early_bird').check(ctx({ local: { hour: 6 } }))).toBe(false)
        expect(find('night_owl').check(ctx({ local: { hour: 23 } }))).toBe(true)
        expect(find('night_owl').check(ctx({ local: { hour: 22 } }))).toBe(false)
    })

    test('leg day survivor needs four leg exercises', () => {
        const legs = (n) => Array.from({ length: n }, () => ({ muscleGroup: 'Legs' }))
        expect(find('leg_day_survivor').check(ctx({ exercises: legs(4) }))).toBe(true)
        expect(find('leg_day_survivor').check(ctx({ exercises: legs(3) }))).toBe(false)
    })

    test('round number ignores an empty workout', () => {
        expect(find('round_number').check(ctx({ summary: { totalWeight: 0 } }))).toBe(false)
        expect(find('round_number').check(ctx({ summary: { totalWeight: 2000 } }))).toBe(true)
        expect(find('round_number').check(ctx({ summary: { totalWeight: 2001 } }))).toBe(false)
    })

    test('comeback kid needs 30+ days since the previous workout', () => {
        const workout = { createdAt: new Date('2026-03-10T12:00:00Z'), duration: 30, exercises: [] }
        expect(find('comeback_kid').check(ctx({ workout, previousWorkoutAt: new Date('2026-02-01T00:00:00Z') }))).toBe(true)
        expect(find('comeback_kid').check(ctx({ workout, previousWorkoutAt: new Date('2026-03-01T00:00:00Z') }))).toBe(false)
        expect(find('comeback_kid').check(ctx({ workout, previousWorkoutAt: null }))).toBe(false)
    })

    test('lucky sevens needs seven sets of seven reps on one exercise', () => {
        const sets = (n) => Array.from({ length: n }, () => ({ reps: 7 }))
        expect(find('lucky_sevens').check(ctx({ workout: { exercises: [{ sets: sets(7) }] } }))).toBe(true)
        expect(find('lucky_sevens').check(ctx({ workout: { exercises: [{ sets: sets(6) }] } }))).toBe(false)
    })

    test('hat trick needs three PBs in one workout', () => {
        const pbs = (n) => ({ personalBests: Array.from({ length: n }, () => ({})) })
        expect(find('hat_trick').check(ctx({ summary: pbs(3) }))).toBe(true)
        expect(find('hat_trick').check(ctx({ summary: pbs(2) }))).toBe(false)
    })

    test('a check that reads a missing field does not throw for the shapes we pass', () => {
        for (const a of ACHIEVEMENTS.filter(a => a.check)) {
            expect(() => a.check(ctx())).not.toThrow()
        }
    })
})

describe('toLocal', () => {
    test('applies the client timezone offset (minutes, getTimezoneOffset sign)', () => {
        // 23:30 UTC for someone at UTC+1 (offset -60) is 00:30 the next day
        const local = toLocal(new Date('2026-12-31T23:30:00Z'), -60)
        expect(local).toEqual({ hour: 0, minute: 30, month: 0, day: 1 })
    })

    test('defaults to UTC', () => {
        expect(toLocal(new Date('2026-06-01T05:15:00Z')).hour).toBe(5)
    })
})
