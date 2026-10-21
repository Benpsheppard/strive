jest.mock('../models/workoutModel', () => ({
    find: jest.fn()
}))
jest.mock('../models/questModel', () => ({
    find: jest.fn()
}))
jest.mock('../utils/workoutServices', () => ({
    getWorkoutsThisWeek: jest.fn().mockResolvedValue(1)
}))
jest.mock('../utils/dateFormat', () => ({
    getStartOfWeek: jest.fn(),
    getEndOfWeek: jest.fn()
}))

const Workout = require('../models/workoutModel')
const Quest = require('../models/questModel')
const { calculateWorkoutSummary } = require('../utils/workoutSummary')

const makeWorkoutHistoryQuery = () => {
    const query = {
        populate: jest.fn(),
        sort: jest.fn(),
        lean: jest.fn().mockResolvedValue([])
    }
    query.populate.mockReturnValue(query)
    query.sort.mockReturnValue(query)
    Workout.find.mockReturnValue(query)
}

const makeQuest = (questType, completion) => ({
    _id: 'quest-1',
    questType,
    completion,
    progressLog: [],
    status: 'active',
    reward: 100,
    title: 'Equipment-specific quest',
    duration: 'weekly',
    save: jest.fn().mockResolvedValue(undefined)
})

const exercise = {
    name: 'Bench Press',
    exerciseId: 'exercise-1',
    selectedEquipment: 'Smith Machine',
    trackingMode: 'weight_reps',
    sets: [{ weight: 70, reps: 8 }]
}

const makeSummary = async quest => {
    makeWorkoutHistoryQuery()
    Quest.find.mockResolvedValue([quest])

    return calculateWorkoutSummary(
        {
            _id: 'user-1',
            momentum: { current: 30 },
            target: 3
        },
        [exercise],
        {
            _id: 'workout-1',
            createdAt: new Date()
        }
    )
}

describe('equipment-specific quest completion', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('strength quest does not complete for the same exercise with different equipment', async () => {
        const quest = makeQuest('strength', {
            exercise: 'Bench Press',
            selectedEquipment: 'Barbell',
            weight: 70,
            reps: 8
        })

        const summary = await makeSummary(quest)

        expect(summary.questsCompleted).toEqual([])
        expect(quest.save).not.toHaveBeenCalled()
    })

    test('strength quest completes for the matching equipment', async () => {
        const quest = makeQuest('strength', {
            exercise: 'Bench Press',
            selectedEquipment: 'Smith Machine',
            weight: 70,
            reps: 8
        })

        const summary = await makeSummary(quest)

        expect(summary.questsCompleted).toHaveLength(1)
        expect(quest.status).toBe('completed')
        expect(quest.save).toHaveBeenCalledTimes(1)
    })

    test('progressive quest matches only its exact exercise/equipment pair', async () => {
        const quest = makeQuest('progressive', {
            exercise: 'Bench Press',
            selectedEquipment: 'Smith Machine',
            metric: 'max_weight',
            baseline: 60
        })

        const summary = await makeSummary(quest)

        expect(summary.questsCompleted).toHaveLength(1)
        expect(quest.status).toBe('completed')
        expect(quest.save).toHaveBeenCalledTimes(1)
    })
})
