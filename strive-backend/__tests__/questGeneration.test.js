// Covers how getQuests decides what to generate; quest generation itself is mocked

jest.mock('../models/questModel')
jest.mock('../models/userModel')
jest.mock('../utils/quests/generate', () => ({
    genQuests: jest.fn()
}))

const Quest = require('../models/questModel')
const User = require('../models/userModel')
const { genQuests } = require('../utils/quests/generate')
const { getQuests } = require('../controllers/questController')

const createRes = () => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis()
})

const sortedResult = (quests) => ({ sort: jest.fn().mockResolvedValue(quests) })

describe('getQuests generation', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        User.findById.mockResolvedValue({ _id: 'user123' })
        Quest.updateMany.mockResolvedValue({})
    })

    test('only generates the durations that have no current quests', async () => {
        const daily = { _id: 'd1', duration: 'daily' }
        const weekly = { _id: 'w1', duration: 'weekly' }
        const monthly = { _id: 'm1', duration: 'monthly' }

        Quest.find
            .mockReturnValueOnce(sortedResult([daily]))
            .mockReturnValueOnce(sortedResult([daily, weekly, monthly]))
        genQuests.mockResolvedValue([])

        const res = createRes()
        await getQuests({ user: { id: 'user123' } }, res)

        expect(genQuests).toHaveBeenCalledTimes(2)
        expect(genQuests.mock.calls.map(call => call[1]).sort()).toEqual(['monthly', 'weekly'])
        expect(Quest.find).toHaveBeenCalledTimes(2)
        expect(res.json).toHaveBeenCalledWith({
            quests: { daily: [daily], weekly: [weekly], monthly: [monthly] }
        })
    })

    test('starts the missing generations at the same time', async () => {
        Quest.find
            .mockReturnValueOnce(sortedResult([]))
            .mockReturnValueOnce(sortedResult([]))

        let running = 0
        let maxRunning = 0
        genQuests.mockImplementation(async () => {
            running++
            maxRunning = Math.max(maxRunning, running)
            await new Promise(resolve => setTimeout(resolve, 10))
            running--
            return []
        })

        await getQuests({ user: { id: 'user123' } }, createRes())

        expect(genQuests).toHaveBeenCalledTimes(3)
        expect(maxRunning).toBe(3)
    })

    test('concurrent requests share one generation per duration', async () => {
        Quest.find.mockReturnValue(sortedResult([]))
        genQuests.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve([]), 10)))

        await Promise.all([
            getQuests({ user: { id: 'user123' } }, createRes()),
            getQuests({ user: { id: 'user123' } }, createRes())
        ])

        expect(genQuests).toHaveBeenCalledTimes(3)
    })

    test('carries on when quest generation has no credits', async () => {
        Quest.find.mockReturnValue(sortedResult([]))
        genQuests.mockRejectedValue(new Error('ANTHROPIC_CREDIT_EXHAUSTED'))

        const res = createRes()
        await getQuests({ user: { id: 'user123' } }, res)

        expect(res.status).toHaveBeenCalledWith(200)
    })
})
