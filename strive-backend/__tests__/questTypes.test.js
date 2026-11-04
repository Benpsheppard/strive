const volume = require('../utils/quests/types/volume')
const consistency = require('../utils/quests/types/consistency')

const exercise = (name, muscleGroup, sets) => ({ name, muscleGroup, sets })

describe('volume quest', () => {
    const makeQuest = (completion, progressLog = []) => ({ completion, progressLog })
    const workout = { _id: 'w1' }

    test('adds session volume to progress without completing early', () => {
        const quest = makeQuest({ filterTag: 'Chest', targetVolume: 1000, currentVolume: 0 })
        const result = volume.check(quest, [exercise('Bench Press', 'Chest', [{ weight: 50, reps: 10 }])], workout)

        expect(result.completed).toBe(false)
        expect(result.progress.completion.currentVolume).toBe(500)
    })

    test('completes once cumulative volume reaches the target', () => {
        const quest = makeQuest(
            { filterTag: 'Chest', targetVolume: 800, currentVolume: 500 },
            [{ workoutId: 'w0', value: 500 }]
        )
        const result = volume.check(quest, [exercise('Bench Press', 'Chest', [{ weight: 50, reps: 10 }])], workout)

        expect(result.completed).toBe(true)
    })

    test('ignores exercises that do not match the filter', () => {
        const quest = makeQuest({ filterTag: 'Legs', targetVolume: 100, currentVolume: 0 })
        const result = volume.check(quest, [exercise('Bench Press', 'Chest', [{ weight: 50, reps: 10 }])], workout)

        expect(result).toEqual({ completed: false })
    })

    test('does not count the same workout twice', () => {
        const quest = makeQuest(
            { filterTag: null, targetVolume: 100, currentVolume: 500 },
            [{ workoutId: 'w1', value: 500 }]
        )
        const result = volume.check(quest, [exercise('Bench Press', 'Chest', [{ weight: 50, reps: 10 }])], workout)

        expect(result).toEqual({ completed: false })
    })

    test('validate only accepts tags from the user history', () => {
        const context = { volumeExerciseNames: new Set(['Bench Press']), volumeMuscleGroups: new Set(['Chest']) }

        expect(volume.validate({ targetVolume: 1000, filterTag: 'Chest' }, context)).toBe(true)
        expect(volume.validate({ targetVolume: 1000, filterTag: null }, context)).toBe(true)
        expect(volume.validate({ targetVolume: 1000, filterTag: 'Upper Body' }, context)).toBe(false)
        expect(volume.validate({ targetVolume: 0, filterTag: null }, context)).toBe(false)
        expect(volume.validate({ targetVolume: 1000, currentVolume: 50 }, context)).toBe(false)
    })
})

describe('consistency quest validate', () => {
    const base = { exerciseNames: new Set(['Bench Press']), muscleGroups: new Set(['Chest']) }

    test('target count must be within the bounds for the duration', () => {
        expect(consistency.validate({ targetCount: 1 }, { ...base, duration: 'daily' })).toBe(true)
        expect(consistency.validate({ targetCount: 2 }, { ...base, duration: 'daily' })).toBe(false)
        expect(consistency.validate({ targetCount: 3 }, { ...base, duration: 'weekly' })).toBe(true)
        expect(consistency.validate({ targetCount: 5 }, { ...base, duration: 'weekly' })).toBe(false)
        expect(consistency.validate({ targetCount: 10 }, { ...base, duration: 'monthly' })).toBe(true)
        expect(consistency.validate({ targetCount: 2.5 }, { ...base, duration: 'weekly' })).toBe(false)
    })

    test('filter tag must come from the user history', () => {
        const context = { ...base, duration: 'weekly' }

        expect(consistency.validate({ targetCount: 3, filterTag: 'Chest' }, context)).toBe(true)
        expect(consistency.validate({ targetCount: 3, filterTag: 'Arms' }, context)).toBe(false)
    })
})
