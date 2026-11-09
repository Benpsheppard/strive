jest.mock('../models/userModel.js')
jest.mock('../models/workoutModel.js')
jest.mock('../models/questModel.js')
jest.mock('../models/leaderboardEntryModel.js')
jest.mock('../utils/dateFormat.js', () => ({
    getPreviousISOWeekString: jest.fn(),
    getISOWeekString: jest.fn(),
    getPreviousWeekRange: jest.fn(),
    getStartOfWeek: jest.fn(),
    getEndOfWeek: jest.fn(),
    getWeeksBetween: jest.fn()
}))
jest.mock('../utils/momentum.js', () => ({
    calculateMomentum: jest.fn()
}))

const User = require('../models/userModel.js')
const Workout = require('../models/workoutModel.js')
const Quest = require('../models/questModel.js')
const LeaderboardEntry = require('../models/leaderboardEntryModel.js')
const { getISOWeekString, getPreviousISOWeekString, getPreviousWeekRange, getWeeksBetween } = require('../utils/dateFormat.js')
const { resetWorkoutData, checkAndIncreaseStreak, checkAndBreakStreak } = require('../utils/workoutServices.js')

describe('workoutServices', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('resets workout-derived account data and leaderboard entries', async () => {
        const workouts = [
            { summary: { totalStrivePoints: { total: 100 } } },
            { summary: { totalStrivePoints: { total: 50 } } }
        ]
        const lean = jest.fn().mockResolvedValue(workouts)
        const select = jest.fn().mockReturnValue({ lean })
        Workout.find.mockReturnValue({ select })
        Workout.deleteMany.mockResolvedValue({})
        LeaderboardEntry.deleteMany.mockResolvedValue({})

        const user = {
            _id: 'user123',
            workouts: ['workout1', 'workout2'],
            lastWorkout: new Date(),
            strivepoints: 250,
            momentum: { current: 80, lastCalculated: new Date() },
            streak: {
                current: 5,
                shield: true,
                lastEvaluatedWeek: '2026-W41',
                lastIncrementedWeek: '2026-W42',
                best: 6
            },
            save: jest.fn().mockResolvedValue(undefined)
        }

        await resetWorkoutData(user)

        expect(Workout.find).toHaveBeenCalledWith({ user: 'user123' })
        expect(select).toHaveBeenCalledWith('summary.totalStrivePoints.total')
        expect(Workout.deleteMany).toHaveBeenCalledWith({ user: 'user123' })
        expect(Quest.deleteMany).toHaveBeenCalledWith({ user: 'user123' })
        expect(LeaderboardEntry.deleteMany).toHaveBeenCalledWith({ user: 'user123' })
        expect(user).toMatchObject({
            workouts: [],
            lastWorkout: null,
            strivepoints: 100,
            level: 2,
            momentum: { current: 30, lastCalculated: null },
            streak: {
                current: 0,
                shield: false,
                lastEvaluatedWeek: null,
                lastIncrementedWeek: null,
                best: 0
            }
        })
        expect(user.save).toHaveBeenCalled()
    })

    test('does not increment a streak more than once per week', async () => {
        getISOWeekString.mockReturnValue('2026-W43')
        const user = {
            streak: {
                current: 4,
                best: 5,
                lastIncrementedWeek: '2026-W43'
            },
            save: jest.fn()
        }
        User.findById.mockResolvedValue(user)

        await expect(checkAndIncreaseStreak('user123', 1)).resolves.toBe(user)

        expect(user.streak.current).toBe(4)
        expect(user.save).not.toHaveBeenCalled()
    })

    describe('streak shields', () => {
        const makeUser = (streak, target = 3) => ({
            _id: 'user123',
            target,
            streak: { current: 3, best: 3, shield: false, lastEvaluatedWeek: null, lastIncrementedWeek: null, ...streak },
            save: jest.fn().mockImplementation(function () { return Promise.resolve(this) })
        })

        test('earns a shield when the streak reaches a multiple of 4', async () => {
            getISOWeekString.mockReturnValue('2026-W44')
            const user = makeUser({ current: 3, lastIncrementedWeek: '2026-W43' })
            User.findById.mockResolvedValue(user)

            await checkAndIncreaseStreak('user123', 1)

            expect(user.streak.current).toBe(4)
            expect(user.streak.shield).toBe(true)
        })

        test('does not earn a shield at other streak lengths', async () => {
            getISOWeekString.mockReturnValue('2026-W44')
            const user = makeUser({ current: 4, lastIncrementedWeek: '2026-W43' })
            User.findById.mockResolvedValue(user)

            await checkAndIncreaseStreak('user123', 1)

            expect(user.streak.current).toBe(5)
            expect(user.streak.shield).toBe(false)
        })

        const setupMissedWeek = (user, weeksBetween, completedWorkouts) => {
            getISOWeekString.mockReturnValue('2026-W44')
            getPreviousISOWeekString.mockReturnValue('2026-W43')
            getPreviousWeekRange.mockReturnValue({ start: new Date(0), end: new Date() })
            getWeeksBetween.mockReturnValue(weeksBetween)
            Workout.countDocuments.mockResolvedValue(completedWorkouts)
            User.findById.mockResolvedValue(user)
        }

        test('a shield protects the streak when one week is missed', async () => {
            const user = makeUser({ current: 4, shield: true, lastIncrementedWeek: '2026-W42' })
            setupMissedWeek(user, 2, 0)

            await checkAndBreakStreak('user123')

            expect(user.streak.current).toBe(4)
            expect(user.streak.shield).toBe(false)
        })

        test('without a shield a missed week resets the streak', async () => {
            const user = makeUser({ current: 4, shield: false, lastIncrementedWeek: '2026-W42' })
            setupMissedWeek(user, 2, 0)

            await checkAndBreakStreak('user123')

            expect(user.streak.current).toBe(0)
        })

        test('one workout last week keeps the streak and shield even when below the weekly target', async () => {
            const user = makeUser({ current: 4, shield: true, lastIncrementedWeek: '2026-W43' }, 3)
            setupMissedWeek(user, 1, 1)

            await checkAndBreakStreak('user123')

            expect(user.streak.current).toBe(4)
            expect(user.streak.shield).toBe(true)
        })

        test('a shield does not cover more than one missed week', async () => {
            const user = makeUser({ current: 4, shield: true, lastIncrementedWeek: '2026-W40' })
            setupMissedWeek(user, 4, 0)

            await checkAndBreakStreak('user123')

            expect(user.streak.current).toBe(0)
            expect(user.streak.shield).toBe(true)
        })
    })
})
