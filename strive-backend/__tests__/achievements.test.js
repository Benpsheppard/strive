const { ACHIEVEMENTS, EVENTS, BY_ID, TIERS, CATEGORIES, toPublic } = require('../utils/achievements/definitions.js')
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

    test('every achievement is workout-based (check), event-based (event) or the completion one', () => {
        for (const a of ACHIEVEMENTS) {
            const kinds = [Boolean(a.check), Boolean(a.event), Boolean(a.completion)]
            expect(kinds.filter(Boolean)).toHaveLength(1)
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

describe('definitions', () => {
    test('every achievement has a valid tier and category', () => {
        for (const a of ACHIEVEMENTS) {
            expect(TIERS).toContain(a.tier)
            expect(CATEGORIES).toContain(a.category)
        }
    })

    test('only ladder achievements are backfilled', () => {
        expect(find('workouts_10').backfill).toBe(true)
        expect(find('early_bird').backfill).toBeUndefined()
    })
})

describe('variety, equipment, palindrome and account anniversary', () => {
    test('variety pack needs 5 different muscle groups, ignoring Other', () => {
        const groups = (...g) => ({ exercises: g.map(muscleGroup => ({ muscleGroup })) })
        expect(find('variety_pack').check(ctx(groups('Chest', 'Back', 'Legs', 'Arms', 'Core')))).toBe(true)
        expect(find('variety_pack').check(ctx(groups('Chest', 'Chest', 'Back', 'Legs', 'Arms')))).toBe(false)
        expect(find('variety_pack').check(ctx(groups('Chest', 'Back', 'Legs', 'Arms', 'Other')))).toBe(false)
    })

    test('equipment explorer counts distinct equipment types', () => {
        expect(find('equipment_5').check(ctx({ stats: { equipmentTypes: 4 } }))).toBe(false)
        expect(find('equipment_5').check(ctx({ stats: { equipmentTypes: 5 } }))).toBe(true)
        expect(find('equipment_5').backfill).toBe(true)
    })

    test('palindrome needs a 3+ digit palindromic duration', () => {
        const at = (duration) => find('palindrome').check(ctx({ workout: { duration } }))
        expect(at(101)).toBe(true)
        expect(at(1221)).toBe(true)
        expect(at(102)).toBe(false)
        expect(at(55)).toBe(false)
        expect(at(5)).toBe(false)
    })

    test('account anniversary needs the same date at least a year later', () => {
        const check = (workoutDate) => find('account_birthday').check(ctx({
            local: toLocal(new Date(workoutDate)),
            accountLocal: toLocal(new Date('2025-06-15T09:00:00Z'))
        }))
        expect(check('2026-06-15T18:00:00Z')).toBe(true)
        expect(check('2026-06-16T18:00:00Z')).toBe(false)
        expect(check('2025-06-15T18:00:00Z')).toBe(false)
        expect(find('account_birthday').check(ctx({ local: toLocal(new Date()), accountLocal: null }))).toBe(false)
    })
})

describe('muscle focus and completionist', () => {
    test('one focus achievement per real muscle group, at 10 workouts', () => {
        const ids = ACHIEVEMENTS.filter(a => a.id.startsWith('focus_')).map(a => a.id)
        expect(ids).toEqual(expect.arrayContaining(['focus_chest', 'focus_back', 'focus_legs', 'focus_full_body']))
        expect(ids).not.toContain('focus_other')

        expect(find('focus_chest').check(ctx({ stats: { muscleFocus: { Chest: 9 } } }))).toBe(false)
        expect(find('focus_chest').check(ctx({ stats: { muscleFocus: { Chest: 10 } } }))).toBe(true)
        expect(find('focus_back').check(ctx({ stats: {} }))).toBe(false)
    })

    test('ladder rungs carry their ladder and are listed lowest first', () => {
        expect(toPublic(find('workouts_10')).ladder).toBe('workouts')
        expect(toPublic(find('early_bird')).ladder).toBeNull()

        const rungs = ACHIEVEMENTS.filter(a => a.ladder === 'workouts').map(a => TIERS.indexOf(a.tier))
        expect(rungs).toEqual([...rungs].sort((x, y) => x - y))
    })

    test('completionist has no check and is not awarded by workouts', () => {
        expect(find('completionist').check).toBeUndefined()
        expect(find('completionist').completion).toBe(true)
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
        expect(find('streak_6').check(ctx({ user }))).toBe(false)
    })
})

describe('standalone and secret checks', () => {
    test('leap day only unlocks on 29 February', () => {
        expect(find('leap_day').check(ctx({ local: toLocal(new Date('2028-02-29T12:00:00Z')) }))).toBe(true)
        expect(find('leap_day').check(ctx({ local: toLocal(new Date('2026-03-01T12:00:00Z')) }))).toBe(false)
        expect(find('leap_day').check(ctx({ local: toLocal(new Date('2028-02-28T12:00:00Z')) }))).toBe(false)
    })

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
        expect(local).toEqual({ hour: 0, minute: 30, year: 2027, month: 0, day: 1 })
    })

    test('defaults to UTC', () => {
        expect(toLocal(new Date('2026-06-01T05:15:00Z')).hour).toBe(5)
    })
})
