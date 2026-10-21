jest.mock('../models/userModel.js')
jest.mock('../models/workoutModel.js')
jest.mock('../models/leaderboardEntryModel.js')
jest.mock('../utils/dateFormat.js', () => ({
    getPreviousISOWeekString: jest.fn(),
    getISOWeekString: jest.fn(),
    getPreviousWeekRange: jest.fn(),
    getStartOfWeek: jest.fn(),
    getEndOfWeek: jest.fn()
}))
jest.mock('../utils/momentum.js', () => ({
    calculateMomentum: jest.fn()
}))

const User = require('../models/userModel.js')
const Workout = require('../models/workoutModel.js')
const LeaderboardEntry = require('../models/leaderboardEntryModel.js')
const { getISOWeekString } = require('../utils/dateFormat.js')
const { resetWorkoutData, checkAndIncreaseStreak } = require('../utils/workoutServices.js')

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
})
