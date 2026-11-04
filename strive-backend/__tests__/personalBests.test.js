jest.mock('../models/workoutModel', () => ({ find: jest.fn() }))
jest.mock('../models/questModel', () => ({ find: jest.fn() }))
jest.mock('../utils/workoutServices', () => ({
    getWorkoutsThisWeek: jest.fn().mockResolvedValue(1)
}))

const Workout = require('../models/workoutModel')
const Quest = require('../models/questModel')
const { calculateWorkoutSummary } = require('../utils/workoutSummary')

const mockHistory = (history) => {
    const query = {
        populate: jest.fn(),
        sort: jest.fn(),
        lean: jest.fn().mockResolvedValue(history)
    }
    query.populate.mockReturnValue(query)
    query.sort.mockReturnValue(query)
    Workout.find.mockReturnValue(query)
    Quest.find.mockResolvedValue([])
}

const pastWorkout = (name, weight, totalWeight = 1000) => ({
    createdAt: new Date(),
    summary: { totalWeight },
    exercises: [{
        exercise: { _id: 'ex-1', name, trackingMode: 'weight_reps' },
        selectedEquipment: 'Barbell',
        sets: [{ weight, reps: 5 }]
    }]
})

const lift = (weight, name = 'Bench Press') => ({
    name,
    exerciseId: 'ex-1',
    selectedEquipment: 'Barbell',
    trackingMode: 'weight_reps',
    sets: [{ weight, reps: 5 }]
})

const run = (exercises) => calculateWorkoutSummary(
    { _id: 'user-1', momentum: { current: 0 }, target: 3 },
    exercises,
    { _id: 'workout-new', createdAt: new Date() }
)

describe('personal bests', () => {
    beforeEach(() => jest.clearAllMocks())

    test('a first-ever lift is not a PB but earns 50 SP', async () => {
        mockHistory([])
        const { summary } = await run([lift(60)])

        expect(summary.personalBests).toEqual([])
        expect(summary.firstLifts).toEqual([{ exercise: 'Bench Press', equipment: 'Barbell' }])
        expect(summary.totalStrivePoints.firstLiftsReward).toBe(50)
        expect(summary.totalStrivePoints.personalBestsReward).toBe(0)
    })

    test('beating a previous best is a PB worth 500 SP', async () => {
        mockHistory([pastWorkout('Bench Press', 60)])
        const { summary } = await run([lift(70)])

        expect(summary.personalBests).toHaveLength(1)
        expect(summary.personalBests[0]).toMatchObject({ previousValue: 60, newValue: 70, metric: 'max_weight' })
        expect(summary.firstLifts).toEqual([])
        expect(summary.totalStrivePoints.personalBestsReward).toBe(500)
    })

    test('the same exercise logged twice only counts one PB', async () => {
        mockHistory([pastWorkout('Bench Press', 60)])
        const { summary } = await run([lift(70), lift(80)])

        expect(summary.personalBests).toHaveLength(1)
        expect(summary.personalBests[0].newValue).toBe(80)
        expect(summary.totalStrivePoints.personalBestsReward).toBe(500)
    })

    test('the same new exercise logged twice only earns one first-lift reward', async () => {
        mockHistory([])
        const { summary } = await run([lift(60), lift(80)])

        expect(summary.firstLifts).toHaveLength(1)
        expect(summary.personalBests).toEqual([])
    })

    test('matching the previous best is not a PB', async () => {
        mockHistory([pastWorkout('Bench Press', 60)])
        const { summary } = await run([lift(60)])

        expect(summary.personalBests).toEqual([])
        expect(summary.firstLifts).toEqual([])
    })

    test('zero recent volume does not produce NaN points', async () => {
        mockHistory(Array.from({ length: 5 }, () => pastWorkout('Bench Press', 60, 0)))
        const { summary } = await run([{ ...lift(60), sets: [{ weight: 0, reps: 0 }] }])

        expect(Number.isFinite(summary.totalStrivePoints.total)).toBe(true)
        expect(Number.isFinite(summary.totalStrivePoints.volume.score)).toBe(true)
    })
})
