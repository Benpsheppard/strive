jest.mock('../models/leaderboardEntryModel')
jest.mock('../models/workoutModel')
jest.mock('../utils/dateFormat', () => ({
    getStartOfWeek: jest.fn()
}))

const LeaderboardEntry = require('../models/leaderboardEntryModel')
const Workout = require('../models/workoutModel')
const { getStartOfWeek } = require('../utils/dateFormat')
const { updateLeaderboardEntry } = require('../utils/leaderboard')

describe('updateLeaderboardEntry', () => {
    const weekStart = new Date('2026-10-19T00:00:00.000Z')
    const workout = {
        createdAt: new Date('2026-10-21T12:00:00.000Z'),
        summary: {
            totalStrivePoints: {
                total: 250,
                volume: { reward: 50 },
                strength: { reward: 60 },
                progression: { reward: 70 }
            }
        }
    }

    beforeEach(() => {
        jest.clearAllMocks()
        getStartOfWeek.mockReturnValue(weekStart)
        LeaderboardEntry.findOneAndUpdate.mockResolvedValue({})
        LeaderboardEntry.deleteMany.mockResolvedValue({})
    })

    const mockWeeklyWorkoutQuery = (workouts) => {
        const lean = jest.fn().mockResolvedValue(workouts)
        const select = jest.fn().mockReturnValue({ lean })
        Workout.find.mockReturnValue({ select })
        return select
    }

    test('calculates weekly totals and count from the user’s workouts', async () => {
        const select = mockWeeklyWorkoutQuery([workout, workout])

        await updateLeaderboardEntry('user123', workout)

        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekEnd.getDate() + 7)
        expect(Workout.find).toHaveBeenCalledWith({
            user: 'user123',
            createdAt: { $gte: weekStart, $lt: weekEnd }
        })
        expect(select).toHaveBeenCalledWith('summary.totalStrivePoints')
        expect(LeaderboardEntry.findOneAndUpdate).toHaveBeenCalledWith(
            { user: 'user123', weekStart },
            { $set: {
                totalSP: 500,
                totalVolumeSP: 100,
                totalStrengthSP: 120,
                totalProgressionSP: 140,
                workoutCount: 2
            } },
            {
                upsert: true,
                returnDocument: 'after',
                setDefaultsOnInsert: false
            },
        )
        expect(LeaderboardEntry.deleteMany).not.toHaveBeenCalled()
    })

    test('removes the weekly entry when the user has no remaining workouts', async () => {
        mockWeeklyWorkoutQuery([])

        await updateLeaderboardEntry('user123', workout)

        expect(LeaderboardEntry.deleteMany).toHaveBeenCalledWith({
            user: 'user123',
            weekStart
        })
        expect(LeaderboardEntry.findOneAndUpdate).not.toHaveBeenCalled()
    })

    test('creates a row for the first workout of a week', async () => {
        mockWeeklyWorkoutQuery([workout])

        await updateLeaderboardEntry('user123', workout)

        expect(LeaderboardEntry.findOneAndUpdate).toHaveBeenCalledWith(
            { user: 'user123', weekStart },
            { $set: {
                totalSP: 250,
                totalVolumeSP: 50,
                totalStrengthSP: 60,
                totalProgressionSP: 70,
                workoutCount: 1
            } },
            {
                upsert: true,
                returnDocument: 'after',
                setDefaultsOnInsert: false
            }
        )
    })
})
