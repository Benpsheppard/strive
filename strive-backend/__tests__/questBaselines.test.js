const progressive = require('../utils/quests/types/progressive')
const strength = require('../utils/quests/types/strength')

const makeContext = () => {
    const pair = { exercise: 'Bench Press', selectedEquipment: 'Barbell' }
    return {
        allowedPairs: new Map([['bench press||barbell', pair]]),
        trackingModes: new Map([['bench press||barbell', 'weight_reps']]),
        recentWorkouts: [
            { exercises: [{ exercise: { name: 'Bench Press' }, selectedEquipment: 'Barbell', sets: [{ weight: 80, reps: 5 }] }] },
            { exercises: [{ exercise: { name: 'Bench Press' }, selectedEquipment: 'Barbell', sets: [{ weight: 70, reps: 8 }] }] }
        ]
    }
}

const base = { exercise: 'Bench Press', selectedEquipment: 'Barbell' }

describe('quest baselines come from workout history', () => {
    test('progressive baseline ignores the value the AI reports', () => {
        const context = makeContext()
        const completion = { ...base, metric: 'max_weight', baseline: 0 }

        expect(progressive.validate(completion, context)).toBe(true)
        expect(progressive.normalise(completion, context).baseline).toBe(80)
    })

    test('progressive quest is rejected when there is no history for the metric', () => {
        const context = makeContext()
        context.recentWorkouts = []

        expect(progressive.validate({ ...base, metric: 'max_weight', baseline: 50 }, context)).toBe(false)
    })

    test('strength target far above the historical best is rejected', () => {
        const context = makeContext()

        expect(strength.validate({ ...base, weight: 90, reps: 5 }, context)).toBe(true)
        expect(strength.validate({ ...base, weight: 200, reps: 5 }, context)).toBe(false)
    })
})

describe('strength quest check', () => {
    const quest = (reps) => ({ completion: { ...base, weight: 50, reps } })
    const workout = (reps) => [{ name: 'Bench Press', selectedEquipment: 'Barbell', sets: [{ weight: 50, reps }] }]

    test('a set with 0 reps never completes the quest', () => {
        expect(strength.check(quest(1), workout(0)).completed).toBe(false)
        expect(strength.check(quest(2), workout(0)).completed).toBe(false)
    })

    test('the rep buffer still applies', () => {
        expect(strength.check(quest(5), workout(3)).completed).toBe(true)
    })
})
