jest.mock('jsonwebtoken')
jest.mock('../models/userModel.js')
jest.mock('../models/leaderboardEntryModel.js')
jest.mock('../utils/dateFormat', () => ({ getStartOfWeek: jest.fn(() => new Date(0)) }))

const jwt = require('jsonwebtoken')
const User = require('../models/userModel.js')
const LeaderboardEntry = require('../models/leaderboardEntryModel.js')
const { protect } = require('../middleware/authMiddleware.js')
const { errorHandler } = require('../middleware/errorMiddleware.js')
const { getLeaderboard } = require('../controllers/leaderboardController.js')
const { validateWorkoutInput } = require('../utils/validateWorkoutInput.js')

const createRes = () => ({ statusCode: 200, status: jest.fn(function (c) { this.statusCode = c; return this }), json: jest.fn() })

describe('protect middleware', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        process.env.JWT_SECRET = 'test-secret'
    })

    test('rejects a valid token whose user no longer exists', async () => {
        jwt.verify.mockReturnValue({ id: 'deletedUser' })
        User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(null) })

        const req = { headers: { authorization: 'Bearer good.token' } }
        const res = createRes()
        const next = jest.fn()

        // express-async-handler forwards thrown errors to next(err)
        await protect(req, res, next)
        expect(res.status).toHaveBeenCalledWith(401)
        expect(next).toHaveBeenCalledTimes(1)
        expect(next.mock.calls[0][0]).toEqual(expect.objectContaining({ message: 'Not Authorised - User no longer exists' }))
    })

    test('rejects a header without the "Bearer " scheme', async () => {
        const req = { headers: { authorization: 'Bearerfoo' } }
        const res = createRes()
        const next = jest.fn()

        await protect(req, res, next)
        expect(res.status).toHaveBeenCalledWith(401)
        expect(next.mock.calls[0][0]).toEqual(expect.objectContaining({ message: 'Not Authorised - No token' }))
    })

    test('calls next for a valid token and existing user', async () => {
        jwt.verify.mockReturnValue({ id: 'u1' })
        User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue({ id: 'u1' }) })

        const req = { headers: { authorization: 'Bearer good.token' } }
        const next = jest.fn()

        await protect(req, createRes(), next)
        expect(req.user).toEqual({ id: 'u1' })
        expect(next).toHaveBeenCalled()
    })
})

describe('errorHandler', () => {
    afterEach(() => { process.env.NODE_ENV = 'test' })

    test('hides internal 500 messages outside development', () => {
        process.env.NODE_ENV = 'production'
        const res = createRes()
        errorHandler(new Error('Mongo connection string leaked'), {}, res, jest.fn())
        expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error', stack: null })
    })

    test('keeps client error messages', () => {
        process.env.NODE_ENV = 'production'
        const res = createRes()
        res.statusCode = 400
        errorHandler(new Error('Invalid input'), {}, res, jest.fn())
        expect(res.json).toHaveBeenCalledWith({ message: 'Invalid input', stack: null })
    })
})

describe('getLeaderboard', () => {
    const chain = (result) => {
        const q = { sort: jest.fn().mockReturnThis(), limit: jest.fn().mockReturnThis(), populate: jest.fn().mockResolvedValue(result) }
        LeaderboardEntry.find.mockReturnValue(q)
        return q
    }

    beforeEach(() => jest.clearAllMocks())

    test('defaults to totalSP', async () => {
        const q = chain([])
        await getLeaderboard({ query: {} }, createRes())
        expect(q.sort).toHaveBeenCalledWith({ totalSP: -1 })
    })

    test.each(['user', '__proto__', '$where', 'password'])('rejects metric %s', async (metric) => {
        const res = createRes()
        await expect(getLeaderboard({ query: { metric } }, res)).rejects.toThrow('Invalid metric')
        expect(res.status).toHaveBeenCalledWith(400)
        expect(LeaderboardEntry.find).not.toHaveBeenCalled()
    })

    test('rejects non-string metric (query-string objects/arrays)', async () => {
        const res = createRes()
        await expect(getLeaderboard({ query: { metric: ['totalSP'] } }, res)).rejects.toThrow('Invalid metric')
    })
})

describe('validateWorkoutInput', () => {
    test('strips unknown fields from exercises and sets', () => {
        const { value } = validateWorkoutInput({
            title: ' Push ',
            duration: '30',
            user: 'someoneElse',
            exercises: [{
                exercise: '507f1f77bcf86cd799439011',
                selectedEquipment: 'Barbell',
                isAdmin: true,
                sets: [{ weight: '80', reps: 5, _id: 'x', evil: 1 }]
            }]
        })

        expect(value).toEqual({
            title: 'Push',
            duration: 30,
            exercises: [{ exercise: '507f1f77bcf86cd799439011', selectedEquipment: 'Barbell', sets: [{ weight: 80, reps: 5 }] }]
        })
    })

    test('rejects NaN, Infinity-like and negative durations', () => {
        for (const duration of ['abc', -1, 99999, null, {}]) {
            expect(validateWorkoutInput({ title: 'x', duration, exercises: [] }).error).toBeDefined()
        }
    })
})
