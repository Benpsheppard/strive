// questControllerV2.test.js

// --------------------------------------------------
// Mock Anthropic
// --------------------------------------------------

const mockCreate = jest.fn()

jest.mock('@anthropic-ai/sdk', () => {
    return jest.fn().mockImplementation(() => ({
        messages: {
            create: mockCreate
        }
    }))
})

// --------------------------------------------------
// Mock models
// --------------------------------------------------

jest.mock('../models/questModel')
jest.mock('../models/userModel')
jest.mock('../models/workoutModel')

const Quest = require('../models/questModel')
const User = require('../models/userModel')
const Workout = require('../models/workoutModel')

const {
    getQuests,
    generateQuests
} = require('../controllers/questControllerV2')

// --------------------------------------------------
// Helpers
// --------------------------------------------------

const createRes = () => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis()
})

const createReq = (overrides = {}) => ({
    user: {
        id: 'user123'
    },
    params: {
        duration: 'daily'
    },
    ...overrides
})

const mockWorkoutQuery = (workouts = []) => {
    Workout.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
                populate: jest.fn().mockResolvedValue(workouts)
            })
        })
    })
}

const mockAIResponse = (quests) => {
    mockCreate.mockResolvedValue({
        content: [
            {
                text: JSON.stringify({ quests })
            }
        ]
    })
}

// --------------------------------------------------
// Test data
// --------------------------------------------------

const user = {
    _id: 'user123',
    useImperial: false
}

const workouts = [
    {
        date: new Date('2026-09-09'),
        exercises: [
            {
                exercise: {
                    name: 'Bench Press',
                    muscleGroup: 'Chest',
                    subMuscleGroup: 'Upper Chest',
                    trackingMode: 'weight_reps'
                },
                selectedEquipment: 'Barbell',
                sets: [
                    {
                        weight: 60,
                        reps: 10
                    }
                ]
            },
            {
                exercise: {
                    name: 'Squat',
                    muscleGroup: 'Legs',
                    subMuscleGroup: 'Quads',
                    trackingMode: 'weight_reps'
                },
                selectedEquipment: 'Barbell',
                sets: [
                    {
                        weight: 80,
                        reps: 8
                    }
                ]
            }
        ]
    }
]

// --------------------------------------------------
// Tests
// --------------------------------------------------

describe('questControllerV2', () => {

    beforeEach(() => {
        jest.clearAllMocks()

        mockCreate.mockReset()

        User.findById.mockReset()
        Quest.find.mockReset()
        Quest.updateMany.mockReset()
        Quest.countDocuments.mockReset()
        Quest.insertMany.mockReset()
        Workout.find.mockReset()
    })

    describe('generateQuests', () => {

        test('rejects request when user does not exist', async () => {
            User.findById.mockResolvedValue(null)

            const req = createReq({
                params: {
                    duration: 'daily'
                }
            })

            const res = createRes()
            const next = jest.fn()

            await generateQuests(req, res, next)

            expect(User.findById).toHaveBeenCalledWith('user123')
            expect(res.status).toHaveBeenCalledWith(404)

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'User not found'
                })
            )

            expect(mockCreate).not.toHaveBeenCalled()
        })

        test('generates daily quests without calling the real AI', async () => {
            User.findById.mockResolvedValue(user)

            mockWorkoutQuery(workouts)

            Quest.find
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([])

            const aiQuests = [
                {
                    title: 'Bench Press Strength',
                    questType: 'strength',
                    duration: 'daily',
                    description: 'Hit a stronger bench press.',
                    completion: {
                        exercise: 'Bench Press',
                        weight: 65,
                        reps: 8
                    }
                },
                {
                    title: 'Squat Strength',
                    questType: 'strength',
                    duration: 'daily',
                    description: 'Improve your squat.',
                    completion: {
                        exercise: 'Squat',
                        weight: 85,
                        reps: 6
                    }
                },
                {
                    title: 'Bench Press Consistency',
                    questType: 'consistency',
                    duration: 'daily',
                    description: 'Complete a bench press workout.',
                    completion: {
                        targetCount: 1,
                        currentCount: 0,
                        filterTag: 'Bench Press'
                    }
                }
            ]

            mockAIResponse(aiQuests)

            const savedQuests = aiQuests.map((quest, index) => ({
                _id: `quest${index + 1}`,
                user: 'user123',
                ...quest
            }))

            Quest.insertMany.mockResolvedValue(savedQuests)

            const req = createReq({
                params: {
                    duration: 'daily'
                }
            })

            const res = createRes()

            await generateQuests(req, res)

            expect(User.findById).toHaveBeenCalledWith('user123')

            expect(Workout.find).toHaveBeenCalledWith({
                user: 'user123'
            })

            // The AI SDK is mocked.
            expect(mockCreate).toHaveBeenCalledTimes(1)

            expect(Quest.insertMany).toHaveBeenCalledTimes(1)

            expect(res.status).toHaveBeenCalledWith(200)

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'daily quests generated!',
                    quests: savedQuests
                })
            )
        })

        test('does not call AI when there are no workouts', async () => {
            User.findById.mockResolvedValue(user)

            mockWorkoutQuery([])

            const req = createReq({
                params: {
                    duration: 'daily'
                }
            })

            const res = createRes()

            await expect(
                generateQuests(req, res)
            ).rejects.toThrow('No workouts found for this user')

            expect(mockCreate).not.toHaveBeenCalled()
            expect(Quest.insertMany).not.toHaveBeenCalled()
        })

        test('handles invalid AI response', async () => {
            User.findById.mockResolvedValue(user)

            mockWorkoutQuery(workouts)

            Quest.find
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([])

            mockAIResponse([
                {
                    title: 'Invalid Quest',
                    questType: 'strength',
                    duration: 'daily',
                    description: 'Invalid exercise.',
                    completion: {
                        exercise: 'Deadlift',
                        weight: 100,
                        reps: 5
                    }
                },
                {
                    title: 'Another Quest',
                    questType: 'strength',
                    duration: 'daily',
                    description: 'Another quest.',
                    completion: {
                        exercise: 'Bench Press',
                        weight: 65,
                        reps: 8
                    }
                },
                {
                    title: 'Third Quest',
                    questType: 'strength',
                    duration: 'daily',
                    description: 'Third quest.',
                    completion: {
                        exercise: 'Squat',
                        weight: 85,
                        reps: 6
                    }
                }
            ])

            const req = createReq({
                params: {
                    duration: 'daily'
                }
            })

            const res = createRes()

            await expect(
                generateQuests(req, res)
            ).rejects.toThrow('Invalid quest completion data')

            expect(Quest.insertMany).not.toHaveBeenCalled()
        })

        test('handles AI returning wrong number of quests', async () => {
            User.findById.mockResolvedValue(user)

            mockWorkoutQuery(workouts)

            Quest.find
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([])

            mockAIResponse([
                {
                    title: 'Bench Press',
                    questType: 'strength',
                    duration: 'daily',
                    description: 'Bench press quest.',
                    completion: {
                        exercise: 'Bench Press',
                        weight: 65,
                        reps: 8
                    }
                }
            ])

            const req = createReq({
                params: {
                    duration: 'daily'
                }
            })

            const res = createRes()

            await expect(
                generateQuests(req, res)
            ).rejects.toThrow('AI response has wrong quest count')

            expect(Quest.insertMany).not.toHaveBeenCalled()
        })

        test('handles Anthropic credit exhaustion', async () => {
            User.findById.mockResolvedValue(user)

            mockWorkoutQuery(workouts)

            Quest.find
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([])

            const error = new Error('Bad request')

            error.status = 400
            error.error = {
                error: {
                    type: 'invalid_request_error'
                }
            }

            mockCreate.mockRejectedValue(error)

            const req = createReq({
                params: {
                    duration: 'daily'
                }
            })

            const res = createRes()

            await generateQuests(req, res)

            expect(res.status).toHaveBeenCalledWith(502)

            expect(res.json).toHaveBeenCalledWith({
                message: 'Quest generation is currently unavailable'
            })

            expect(Quest.insertMany).not.toHaveBeenCalled()
        })
    })

    describe('getQuests', () => {

        test('rejects request when user does not exist', async () => {
            User.findById.mockResolvedValue(null)

            const req = createReq()
            const res = createRes()

            await expect(
                getQuests(req, res)
            ).rejects.toThrow('User not found')

            expect(User.findById).toHaveBeenCalledWith('user123')
            expect(res.status).toHaveBeenCalledWith(404)

            expect(mockCreate).not.toHaveBeenCalled()
        })

        test('returns existing quests without calling AI', async () => {
            User.findById.mockResolvedValue(user)

            Quest.updateMany.mockResolvedValue({
                modifiedCount: 0
            })

            // All three counts are greater than zero.
            // Therefore getQuests does not call genQuests.
            Quest.countDocuments
                .mockResolvedValueOnce(3)
                .mockResolvedValueOnce(2)
                .mockResolvedValueOnce(1)

            const quests = [
                {
                    _id: 'quest1',
                    duration: 'daily',
                    status: 'active'
                },
                {
                    _id: 'quest2',
                    duration: 'weekly',
                    status: 'active'
                },
                {
                    _id: 'quest3',
                    duration: 'monthly',
                    status: 'active'
                }
            ]

            Quest.find.mockReturnValue({
                sort: jest.fn().mockResolvedValue(quests)
            })

            const req = createReq()
            const res = createRes()

            await getQuests(req, res)

            expect(User.findById).toHaveBeenCalledWith('user123')

            expect(Quest.updateMany).toHaveBeenCalledTimes(1)

            expect(Quest.countDocuments).toHaveBeenCalledTimes(3)

            // No AI call needed.
            expect(mockCreate).not.toHaveBeenCalled()

            expect(res.status).toHaveBeenCalledWith(200)

            expect(res.json).toHaveBeenCalledWith({
                quests: {
                    daily: [quests[0]],
                    weekly: [quests[1]],
                    monthly: [quests[2]]
                }
            })
        })

        test('expires old quests before returning current quests', async () => {
            User.findById.mockResolvedValue(user)

            Quest.updateMany.mockResolvedValue({
                modifiedCount: 2
            })

            Quest.countDocuments
                .mockResolvedValueOnce(1)
                .mockResolvedValueOnce(1)
                .mockResolvedValueOnce(1)

            const quests = [
                {
                    _id: 'quest1',
                    duration: 'daily',
                    status: 'active'
                }
            ]

            Quest.find.mockReturnValue({
                sort: jest.fn().mockResolvedValue(quests)
            })

            const req = createReq()
            const res = createRes()

            await getQuests(req, res)

            expect(Quest.updateMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    user: 'user123',
                    status: {
                        $in: ['active', 'completed']
                    },
                    expiry: expect.any(Object)
                }),
                {
                    status: 'expired'
                }
            )

            expect(res.status).toHaveBeenCalledWith(200)

            expect(mockCreate).not.toHaveBeenCalled()
        })

        test('groups daily, weekly and monthly quests correctly', async () => {
            User.findById.mockResolvedValue(user)

            Quest.updateMany.mockResolvedValue({
                modifiedCount: 0
            })

            Quest.countDocuments
                .mockResolvedValueOnce(1)
                .mockResolvedValueOnce(1)
                .mockResolvedValueOnce(1)

            const dailyQuest = {
                _id: 'daily1',
                duration: 'daily',
                status: 'active'
            }

            const weeklyQuest = {
                _id: 'weekly1',
                duration: 'weekly',
                status: 'completed'
            }

            const monthlyQuest = {
                _id: 'monthly1',
                duration: 'monthly',
                status: 'active'
            }

            const quests = [
                dailyQuest,
                weeklyQuest,
                monthlyQuest
            ]

            Quest.find.mockReturnValue({
                sort: jest.fn().mockResolvedValue(quests)
            })

            const req = createReq()
            const res = createRes()

            await getQuests(req, res)

            expect(res.json).toHaveBeenCalledWith({
                quests: {
                    daily: [dailyQuest],
                    weekly: [weeklyQuest],
                    monthly: [monthlyQuest]
                }
            })

            expect(mockCreate).not.toHaveBeenCalled()
        })
    })
})