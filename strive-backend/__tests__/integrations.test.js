jest.mock('../models/userModel.js')
jest.mock('../models/workoutModel.js')

const request = require('supertest')
const User = require('../models/userModel.js')
const Workout = require('../models/workoutModel.js')
const { requireIntegrationKey, keysMatch } = require('../middleware/integrationKeyMiddleware.js')
const { toSummary } = require('../controllers/integrationController.js')
const { createApp } = require('../app.js')

const KEY = 'a-long-shared-secret'
const OWNER_ID = '507f1f77bcf86cd799439011'
const URL = '/api/integrations/life/workouts'
const SINCE = '2026-11-24T10:00:00.000Z'

const createRes = () => ({ status: jest.fn(function () { return this }), json: jest.fn() })

// Makes Workout.find().sort().limit().lean() resolve to the given workouts
const mockWorkouts = (workouts) => {
    const lean = jest.fn().mockResolvedValue(workouts)
    const limit = jest.fn().mockReturnValue({ lean })
    const sort = jest.fn().mockReturnValue({ limit })
    Workout.find.mockReturnValue({ sort })
    return { sort, limit, lean }
}

const mockOwner = (owner = { _id: OWNER_ID }) => {
    User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(owner) })
}

const savedWorkout = (overrides = {}) => ({
    _id: '507f1f77bcf86cd7994390aa',
    title: 'Push day',
    date: new Date('2026-11-24T09:00:00.000Z'),
    createdAt: new Date('2026-11-24T10:05:00.000Z'),
    summary: {
        personalBests: [{ exercise: 'Bench' }, { exercise: 'Dips' }],
        questsCompleted: [{ title: 'Lift three times' }],
        totalStrivePoints: { total: 420 }
    },
    ...overrides
})

describe('keysMatch', () => {
    test('matches only the same key', () => {
        expect(keysMatch(KEY, KEY)).toBe(true)
        expect(keysMatch('wrong', KEY)).toBe(false)
        expect(keysMatch('', KEY)).toBe(false)
    })
})

describe('requireIntegrationKey', () => {
    beforeEach(() => {
        process.env.LIFE_API_KEY = KEY
        process.env.LIFE_USER_EMAIL = 'ben@example.com'
    })

    afterEach(() => {
        delete process.env.LIFE_API_KEY
        delete process.env.LIFE_USER_EMAIL
    })

    test('lets a request with the right key through', () => {
        const next = jest.fn()
        requireIntegrationKey({ headers: { 'x-integration-key': KEY } }, createRes(), next)

        expect(next).toHaveBeenCalled()
    })

    test('rejects a missing key', () => {
        const res = createRes()
        const next = jest.fn()
        requireIntegrationKey({ headers: {} }, res, next)

        expect(res.status).toHaveBeenCalledWith(401)
        expect(next).not.toHaveBeenCalled()
    })

    test('rejects a wrong key', () => {
        const res = createRes()
        requireIntegrationKey({ headers: { 'x-integration-key': 'nope' } }, res, jest.fn())

        expect(res.status).toHaveBeenCalledWith(401)
    })

    test('is switched off, even for the right key, when the key is not configured', () => {
        delete process.env.LIFE_API_KEY
        const res = createRes()
        const next = jest.fn()
        requireIntegrationKey({ headers: { 'x-integration-key': 'undefined' } }, res, next)

        expect(res.status).toHaveBeenCalledWith(503)
        expect(next).not.toHaveBeenCalled()
    })

    test('is switched off when no account is named', () => {
        delete process.env.LIFE_USER_EMAIL
        const res = createRes()
        requireIntegrationKey({ headers: { 'x-integration-key': KEY } }, res, jest.fn())

        expect(res.status).toHaveBeenCalledWith(503)
    })
})

describe('toSummary', () => {
    test('keeps only what the other app needs', () => {
        expect(toSummary(savedWorkout())).toEqual({
            id: '507f1f77bcf86cd7994390aa',
            title: 'Push day',
            finishedAt: new Date('2026-11-24T09:00:00.000Z'),
            savedAt: new Date('2026-11-24T10:05:00.000Z'),
            countsAsWorkout: true,
            personalBests: 2,
            questsCompleted: 1,
            strivePoints: 420
        })
    })

    test('says a workout that earned no Strive points does not count', () => {
        const summary = toSummary(savedWorkout({ summary: { noSPReason: 'Too small' } }))

        expect(summary.countsAsWorkout).toBe(false)
        expect(summary.personalBests).toBe(0)
        expect(summary.strivePoints).toBe(0)
    })

    test('copes with a workout that has no summary at all', () => {
        expect(toSummary(savedWorkout({ summary: undefined })).countsAsWorkout).toBe(true)
    })
})

describe('GET /api/integrations/life/workouts', () => {
    let app

    beforeAll(() => {
        app = createApp()
    })

    beforeEach(() => {
        jest.clearAllMocks()
        process.env.LIFE_API_KEY = KEY
        process.env.LIFE_USER_EMAIL = ' Ben@Example.com '
    })

    afterEach(() => {
        delete process.env.LIFE_API_KEY
        delete process.env.LIFE_USER_EMAIL
    })

    test('rejects a request without the key and never reads workouts', async () => {
        const res = await request(app).get(URL).query({ since: SINCE })

        expect(res.status).toBe(401)
        expect(Workout.find).not.toHaveBeenCalled()
    })

    test('does not accept a member login token in place of the key', async () => {
        const res = await request(app).get(URL).query({ since: SINCE }).set('Authorization', 'Bearer abc')

        expect(res.status).toBe(401)
    })

    test('asks for a since date', async () => {
        const res = await request(app).get(URL).set('x-integration-key', KEY)

        expect(res.status).toBe(400)
        expect(res.body.message).toMatch(/since/)
    })

    test('rejects a since that is not a date', async () => {
        const res = await request(app).get(URL).query({ since: 'yesterday-ish' }).set('x-integration-key', KEY)

        expect(res.status).toBe(400)
    })

    test('returns 404 when the named account does not exist', async () => {
        mockOwner(null)
        const res = await request(app).get(URL).query({ since: SINCE }).set('x-integration-key', KEY)

        expect(res.status).toBe(404)
    })

    test("returns the owner's workouts saved after since, oldest first", async () => {
        mockOwner()
        const { sort, limit } = mockWorkouts([savedWorkout()])

        const res = await request(app).get(URL).query({ since: SINCE }).set('x-integration-key', KEY)

        expect(res.status).toBe(200)
        expect(User.findOne).toHaveBeenCalledWith({ email: 'ben@example.com' })
        expect(Workout.find).toHaveBeenCalledWith({ user: OWNER_ID, createdAt: { $gt: new Date(SINCE) } })
        expect(sort).toHaveBeenCalledWith({ createdAt: 1 })
        expect(limit).toHaveBeenCalledWith(51)
        expect(res.body.hasMore).toBe(false)
        expect(res.body.workouts).toHaveLength(1)
        expect(res.body.workouts[0]).toMatchObject({ id: '507f1f77bcf86cd7994390aa', countsAsWorkout: true, personalBests: 2 })
    })

    test('says when there are more workouts than one page', async () => {
        mockOwner()
        mockWorkouts(Array.from({ length: 51 }, (_, i) => savedWorkout({ _id: `id${i}` })))

        const res = await request(app).get(URL).query({ since: SINCE }).set('x-integration-key', KEY)

        expect(res.body.workouts).toHaveLength(50)
        expect(res.body.hasMore).toBe(true)
    })
})
