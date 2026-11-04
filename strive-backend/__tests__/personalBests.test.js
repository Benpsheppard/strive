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
        limit: jest.fn(),
        lean: jest.fn().mockResolvedValue(history)
    }
    query.populate.mockReturnValue(query)
    query.sort.mockReturnValue(query)
    query.limit.mockReturnValue(query)
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
    sets: [{ weight, reps: 5 }, { weight, reps: 5 }, { weight, reps: 5 }]
})

const run = (exercises) => calculateWorkoutSummary(
    { _id: 'user-1', momentum: { current: 0 }, target: 3 },
    exercises,
    { _id: 'workout-new', createdAt: new Date(), duration: 30 }
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
        const { summary } = await run([{ ...lift(60), sets: [{ weight: 0, reps: 0 }, { weight: 0, reps: 0 }, { weight: 0, reps: 0 }] }])

        expect(Number.isFinite(summary.totalStrivePoints.total)).toBe(true)
        expect(Number.isFinite(summary.totalStrivePoints.volume.score)).toBe(true)
    })
})

describe('anti-farming rules', () => {
    beforeEach(() => jest.clearAllMocks())

    const runWith = (exercises, duration) => calculateWorkoutSummary(
        { _id: 'user-1', momentum: { current: 0 }, target: 3 },
        exercises,
        { _id: 'workout-new', createdAt: new Date(), duration }
    )

    test('a workout with fewer than 3 sets earns nothing', async () => {
        mockHistory([pastWorkout('Bench Press', 60)])
        const { summary } = await runWith([{ ...lift(100), sets: [{ weight: 100, reps: 5 }] }], 30)

        expect(summary.totalStrivePoints.total).toBe(0)
        expect(summary.personalBests).toEqual([])
        expect(summary.noSPReason).toMatch(/at least 3 sets/)
    })

    test('a workout shorter than 5 minutes earns nothing', async () => {
        mockHistory([pastWorkout('Bench Press', 60)])
        const { summary } = await runWith([lift(100)], 2)

        expect(summary.totalStrivePoints.total).toBe(0)
        expect(summary.personalBests).toEqual([])
        expect(summary.noSPReason).toBeDefined()
    })

    test('a workout that is big enough has no reason recorded', async () => {
        mockHistory([pastWorkout('Bench Press', 60)])
        const { summary } = await runWith([lift(70)], 30)

        expect(summary.noSPReason).toBeUndefined()
        expect(summary.totalStrivePoints.total).toBeGreaterThan(0)
    })

    test('a tiny weight increase is not a PB', async () => {
        mockHistory([pastWorkout('Bench Press', 100)])

        const tiny = await runWith([lift(100.1)], 30)
        expect(tiny.summary.personalBests).toEqual([])

        mockHistory([pastWorkout('Bench Press', 100)])
        const real = await runWith([lift(101)], 30)
        expect(real.summary.personalBests).toHaveLength(1)
    })

    test('weight PBs need at least half a kilo on light lifts', async () => {
        mockHistory([pastWorkout('Bench Press', 20)])
        const small = await runWith([lift(20.3)], 30)
        expect(small.summary.personalBests).toEqual([])

        mockHistory([pastWorkout('Bench Press', 20)])
        const enough = await runWith([lift(20.5)], 30)
        expect(enough.summary.personalBests).toHaveLength(1)
    })

    test('first-lift rewards are capped at 5 per workout', async () => {
        mockHistory([])
        const names = ['A', 'B', 'C', 'D', 'E', 'F', 'G']
        const { summary } = await runWith(names.map(n => lift(50, n)), 30)

        expect(summary.firstLifts).toHaveLength(7)
        expect(summary.totalStrivePoints.firstLiftsReward).toBe(250)
    })

    test('SP earned in a day is capped', async () => {
        const earlierToday = {
            ...pastWorkout('Bench Press', 60),
            createdAt: new Date(),
            summary: { totalWeight: 1000, totalStrivePoints: { total: 1450 } }
        }
        mockHistory([earlierToday])
        const { summary } = await runWith([lift(100)], 30)

        expect(summary.totalStrivePoints.total).toBe(50)
        expect(summary.totalStrivePoints.dailyCapReached).toBe(true)
    })

    test('SP is not capped when under the daily limit', async () => {
        mockHistory([])
        const { summary } = await runWith([lift(50)], 30)

        expect(summary.totalStrivePoints.dailyCapReached).toBe(false)
    })
})
