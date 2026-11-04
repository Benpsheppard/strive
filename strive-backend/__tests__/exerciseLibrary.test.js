const library = require('../data/exerciseLibrary')
const { MUSCLE_GROUPS, SUB_MUSCLE_GROUPS, EQUIPMENT, LOGGABLE_TRACKING_MODES, generateSlug } = require('../models/exerciseOptions')

describe('exercise library', () => {
    test('has a broad set of exercises', () => {
        expect(library.length).toBeGreaterThanOrEqual(120)
    })

    test('slugs are unique (the seed script upserts by slug)', () => {
        const slugs = library.map(e => generateSlug(e.name))
        expect(new Set(slugs).size).toBe(slugs.length)
    })

    test.each(library.map(e => [e.name, e]))('%s uses only allowed values', (_name, e) => {
        expect(MUSCLE_GROUPS).toContain(e.muscleGroup)
        expect(SUB_MUSCLE_GROUPS).toContain(e.subMuscleGroup)
        expect(LOGGABLE_TRACKING_MODES).toContain(e.trackingMode)
        expect(e.equipment.length).toBeGreaterThan(0)
        e.equipment.forEach(item => expect(EQUIPMENT).toContain(item))
    })

    test('every tracking mode the app can log is represented', () => {
        const used = new Set(library.map(e => e.trackingMode))
        ;['weight_reps', 'bodyweight_reps', 'assisted_reps', 'reps', 'duration', 'distance_duration']
            .forEach(mode => expect(used).toContain(mode))
    })
})
