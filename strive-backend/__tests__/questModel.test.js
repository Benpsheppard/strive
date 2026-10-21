const Quest = require('../models/questModel')

describe('Quest model completion equipment', () => {
    test('declares and serializes selected equipment with other completion data', () => {
        const quest = new Quest({
            title: 'Strength Quest',
            duration: 'daily',
            description: 'Train with the same equipment.',
            expiry: new Date(),
            completion: {
                exercise: 'Bench Press',
                selectedEquipment: 'Smith Machine',
                weight: 60,
                reps: 8
            }
        })

        expect(Quest.schema.path('completion.selectedEquipment')).toBeDefined()
        expect(quest.toObject().completion).toEqual({
            exercise: 'Bench Press',
            selectedEquipment: 'Smith Machine',
            weight: 60,
            reps: 8
        })
    })
})
