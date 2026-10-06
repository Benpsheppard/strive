// Mock dependencies before importing controller
jest.mock('express-async-handler', () => {
    return jest.fn((fn) => {
        return async (...args) => {
            return await fn(...args)
        }
    })
})

jest.mock('../models/workoutModel.js')
jest.mock('../models/userModel.js')
jest.mock('../models/exerciseModel.js')

jest.mock('../utils/formatUser.js')

jest.mock('../utils/workoutSummary.js', () => ({
    calculateWorkoutSummary: jest.fn()
}))

jest.mock('../utils/leaderboard.js', () => ({
    updateLeaderboardEntry: jest.fn()
}))

jest.mock('../utils/workoutServices.js', () => ({
    updateUserPointsAndMomentum: jest.fn(),
    checkAndIncreaseStreak: jest.fn(),
    getWorkoutsThisWeek: jest.fn(),
    calculateLevel: jest.fn()
}))

const Workout = require('../models/workoutModel.js')
const User = require('../models/userModel.js')
const Exercise = require('../models/exerciseModel.js')

const formatUser = require('../utils/formatUser.js')

const { calculateWorkoutSummary } = require('../utils/workoutSummary.js')
const { updateLeaderboardEntry } = require('../utils/leaderboard.js')
const {
    updateUserPointsAndMomentum,
    checkAndIncreaseStreak,
    getWorkoutsThisWeek,
    calculateLevel
} = require('../utils/workoutServices.js')
const {
    getWorkouts,
    setWorkout,
    updateWorkout,
    deleteWorkout,
    deleteAllWorkouts,
    addExercise,
    updateExercise,
    deleteExercise
} = require('../controllers/workoutController.js')

const createUser = (overrides = {}) => ({
    _id: '123',
    id: '123',
    isGuest: false,
    workouts: [],
    streak: {
        current: 2,
        oldShield: false,
        shield: false
    },
    momentum: {
        current: 50
    },
    level: 3,
    ...overrides
})

const createUpdatedUser = (overrides = {}) => ({
    _id: '123',
    level: 3,
    streak: {
        current: 2,
        shield: false
    },
    momentum: {
        current: 50
    },
    ...overrides
})
 
const defaultSummary = {
    totalStrivePoints: { total: 20 },
    personalBests: [],
    questsCompleted: 0
}

describe('workoutController', () => {
    let req
    let res
 
    afterAll(() => {
        jest.restoreAllMocks()
    })
 
    beforeEach(() => {
        jest.clearAllMocks()
    
        req = {
            body: {},
            params: {},
            user: {}
        }
    
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }
    
        formatUser.mockImplementation((user) => ({ id: user._id }))
    
        getWorkoutsThisWeek.mockResolvedValue(1)
        checkAndIncreaseStreak.mockResolvedValue({})
        updateLeaderboardEntry.mockResolvedValue({})
        updateUserPointsAndMomentum.mockResolvedValue(createUpdatedUser())
    })

    // Get Workouts
    describe('getWorkouts', () => {
        test('gets workouts for the authenticated user', async () => {
            req.user = {
                id: '123'
            }

            const workouts = [
                {
                    _id: 'workout1',
                    user:'123'
                },
                {
                    _id: 'workout2',
                    user:'123'
                }
            ]

            const populate = jest.fn().mockResolvedValue(workouts)

            Workout.find.mockReturnValue({
                populate
            })

            await getWorkouts(req, res)

            expect(Workout.find).toHaveBeenCalledWith({
                user: '123'
            })
            expect(populate).toHaveBeenCalledWith(
                'exercises.exercise'
            )
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith(workouts)
        })
    })

    // Set Workout
    describe('setWorkout', () => {
        const createWorkout = () => ({
            _id: 'workout123',
            user: '123',
            title: 'Chest Workout',
            duration: 45,
            exercises: [],
            summary: {},
            populate: jest.fn(),
            save: jest.fn()
        })
 
        const arrangeWorkout = ({ summary = defaultSummary, populatedExercises = [] } = {}) => {
            const workout = createWorkout()
            const populatedWorkout = { ...workout, exercises: populatedExercises }
    
            workout.populate.mockResolvedValue(populatedWorkout)
            workout.save.mockResolvedValue(workout)
    
            Workout.mockImplementation(() => workout)
            calculateWorkoutSummary.mockResolvedValue(summary)
            User.findByIdAndUpdate.mockResolvedValue({})
    
            return { workout, populatedWorkout }
        }
 
        const baseBody = () => ({
            title: 'Chest Workout',
            duration: 45,
            exercises: []
        })
 
        test('rejects workout when title missing', async () => {
            req.body = {
                duration: 45,
                exercises: []
            }
    
            await expect(setWorkout(req, res))
                .rejects
                .toThrow('Please add a title field')
    
            expect(res.status).toHaveBeenCalledWith(400)
            expect(Workout).not.toHaveBeenCalled()
        })
    
        test('rejects guest user after reaching five workouts', async () => {
            // Guest limit now comes from req.user.workouts.length, not Workout.countDocuments
            req.user = createUser({
                isGuest: true,
                workouts: new Array(5).fill('workoutId')
            })
            req.body = baseBody()
    
            await expect(setWorkout(req, res))
                .rejects
                .toThrow('Guest accounts are limited to 5 workouts. Create a free Strive account for unlimited access!')
    
            expect(res.status).toHaveBeenCalledWith(403)
            expect(Workout).not.toHaveBeenCalled()
            expect(calculateWorkoutSummary).not.toHaveBeenCalled()
        })
 
        test('allows guest user with fewer than five workouts', async () => {
            req.user = createUser({
                isGuest: true,
                workouts: new Array(4).fill('workoutId')
            })
            req.body = baseBody()
    
            arrangeWorkout()
    
            await setWorkout(req, res)
    
            expect(Workout).toHaveBeenCalledWith({
                user: '123',
                title: 'Chest Workout',
                duration: 45,
                exercises: [],
                createdAt: expect.any(Date),
                updatedAt: expect.any(Date)
            })
            expect(res.status).toHaveBeenCalledWith(201)
        })
 
        test('does not apply the workout limit to non-guest users', async () => {
            req.user = createUser({
                isGuest: false,
                workouts: new Array(20).fill('workoutId')
            })
            req.body = baseBody()
    
            arrangeWorkout()
    
            await setWorkout(req, res)
    
            expect(res.status).toHaveBeenCalledWith(201)
        })
 
        test('creates a workout successfully', async () => {
            req.user = createUser()
            req.body = {
                title: 'Chest Workout',
                duration: 45,
                exercises: [
                    {
                        exercise: 'exercise123',
                        selectedEquipment: 'barbell',
                        sets: [{ weight: 80, reps: 10 }]
                    }
                ]
            }
    
            const populatedExercises = [
                {
                    exercise: {
                        name: 'Bench Press',
                        muscleGroup: 'Chest',
                        subMuscleGroup: 'Upper Chest',
                        trackingMode: 'weight_reps'
                    },
                    selectedEquipment: 'barbell',
                    sets: [{ weight: 80, reps: 10 }]
                }
            ]
    
            const summary = {
                totalStrivePoints: { total: 25 },
                personalBests: ['Bench Press'],
                questsCompleted: 1
            }
    
            const { workout } = arrangeWorkout({ summary, populatedExercises })
    
            const updatedUser = createUpdatedUser({
                level: 4,
                streak: { current: 3, shield: true },
                momentum: { current: 60 }
            })
            updateUserPointsAndMomentum.mockResolvedValue(updatedUser)
            getWorkoutsThisWeek.mockResolvedValue(2)
    
            await setWorkout(req, res)
    
            // Workout is built with `new Workout(...)`
            expect(Workout).toHaveBeenCalledWith({
                user: '123',
                title: 'Chest Workout',
                duration: 45,
                exercises: req.body.exercises,
                createdAt: expect.any(Date),
                updatedAt: expect.any(Date)
            })
    
            expect(workout.populate).toHaveBeenCalledWith('exercises.exercise')
    
            expect(calculateWorkoutSummary).toHaveBeenCalledWith(
                req.user,
                populatedExercises.map(ex => ({
                    name: ex.exercise.name,
                    muscleGroup: ex.exercise.muscleGroup,
                    subMuscleGroup: ex.exercise.subMuscleGroup,
                    trackingMode: ex.exercise.trackingMode,
                    selectedEquipment: ex.selectedEquipment,
                    sets: ex.sets
                })),
                workout
            )
    
            expect(workout.summary).toEqual(summary)
            expect(workout.save).toHaveBeenCalled()
    
            expect(User.findByIdAndUpdate).toHaveBeenCalledWith('123', {
                $push: { workouts: 'workout123' },
                $max: { lastWorkout: expect.any(Date) }
            })
    
            expect(updateLeaderboardEntry).toHaveBeenCalledWith(req.user, workout)
    
            expect(getWorkoutsThisWeek).toHaveBeenCalledWith('123', expect.any(Date))
            expect(checkAndIncreaseStreak).toHaveBeenCalledWith('123', 2)
    
            // One combined call replaces addPointsToUser + updateUserMomentum
            expect(updateUserPointsAndMomentum).toHaveBeenCalledWith('123', 25, {
                workoutCompleted: true,
                personalBests: 1,
                quests: 1
            })
    
            expect(formatUser).toHaveBeenCalledWith(updatedUser)
    
            expect(res.status).toHaveBeenCalledWith(201)
            expect(res.json).toHaveBeenCalledWith({
                workout,
                user: { id: '123' },
                gamification: {
                    levelUp: 4, // NOTE: needs the controller fix described in the notes
                    streakIncreased: true,
                    shieldEarned: true,
                    shieldUsed: false,
                    streakBroken: false,
                    momentumGained: 10
                }
            })
        })
 
        test('passes zero points when workout earns none', async () => {
            req.user = createUser()
            req.body = { title: 'Easy Workout', duration: 20, exercises: [] }
    
            arrangeWorkout({
                summary: {
                    totalStrivePoints: { total: 0 },
                    personalBests: [],
                    questsCompleted: 0
                }
            })
    
            await setWorkout(req, res)
    
            // updateUserPointsAndMomentum is now ALWAYS called, with 0 points
            expect(updateUserPointsAndMomentum).toHaveBeenCalledWith('123', 0, {
                workoutCompleted: true,
                personalBests: 0,
                quests: 0
            })
            expect(res.status).toHaveBeenCalledWith(201)
        })
 
        test('defaults points and personal bests when summary fields are missing', async () => {
            req.user = createUser()
            req.body = baseBody()
    
            arrangeWorkout({ summary: {} })
    
            await setWorkout(req, res)
    
            expect(updateUserPointsAndMomentum).toHaveBeenCalledWith('123', 0, {
                workoutCompleted: true,
                personalBests: 0,
                quests: undefined
            })
        })
 
        describe('gamification flags', () => {
            const run = async ({ before, after }) => {
                req.user = createUser(before)
                req.body = baseBody()
                arrangeWorkout()
                updateUserPointsAndMomentum.mockResolvedValue(createUpdatedUser(after))
    
                await setWorkout(req, res)
    
                return res.json.mock.calls[0][0].gamification
            }
    
            test('reports a level up when the level increases', async () => {
                const gamification = await run({
                    before: { level: 3 },
                    after: { level: 4 }
                })
    
                expect(gamification.levelUp).toBe(4)
            })
    
            test('reports no level up when the level is unchanged', async () => {
                const gamification = await run({
                    before: { level: 3 },
                    after: { level: 3 }
                })
    
                expect(gamification.levelUp).toBeNull()
            })
    
            test('reports a broken streak when the streak resets to zero', async () => {
                const gamification = await run({
                    before: { streak: { current: 5, oldShield: false, shield: false } },
                    after: { streak: { current: 0, shield: false } }
                })
    
                expect(gamification.streakBroken).toBe(true)
                expect(gamification.streakIncreased).toBe(false)
            })
    
            test('reports a shield used when the shield is consumed and the streak holds', async () => {
                const gamification = await run({
                    before: { streak: { current: 4, oldShield: true, shield: true } },
                    after: { streak: { current: 4, shield: false } }
                })
    
                expect(gamification.shieldUsed).toBe(true)
                expect(gamification.shieldEarned).toBe(false)
                expect(gamification.streakBroken).toBe(false)
            })
    
            test('reports negative momentum when momentum drops', async () => {
                const gamification = await run({
                    before: { momentum: { current: 50 } },
                    after: { momentum: { current: 45 } }
                })
    
                expect(gamification.momentumGained).toBe(-5)
            })
        })
    })

    // Update Workout
    describe('updateWorkout', () => {
        test('updates a workout successfully', async () => {
            req.params.id = 'workout123'
            req.user = {
                id: '123'
            } 

            const workout = {
                _id: 'workout123',
                user: '123'
            }

            const updatedWorkout = {
                _id: 'workout123',
                user: '123',
                title: 'Updated Workout'
            }

            Workout.findById.mockResolvedValue(workout)
            Workout.findByIdAndUpdate.mockResolvedValue(updatedWorkout)

            await updateWorkout(req, res)

            expect(Workout.findById).toHaveBeenCalledWith(
                'workout123'
            )

            expect (Workout.findByIdAndUpdate).toHaveBeenCalledWith(
                'workout123',
                req.body,
                {
                    returnDocument: 'after'
                }
            )

            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith(updatedWorkout)
        })

        test('returns 404 when workout does not exist', async () => {
            req.params.id = 'workout123'
            req.user = {
                id: '123'
            }

            Workout.findById.mockResolvedValue(null)

            await expect(updateWorkout(req, res))
                .rejects
                .toThrow('Workout with the id: workout123 was not found')
            
            expect(res.status).toHaveBeenCalledWith(404)
            expect(Workout.findByIdAndUpdate).not.toHaveBeenCalled()
        })

        test('returns 404 when user doe not exist', async () => {
            req.params.id = 'workout123'
            req.user = null

            Workout.findById.mockResolvedValue({
                _id: 'workout123',
                user: '123'
            })

            await expect(updateWorkout(req, res))
                .rejects
                .toThrow('User not found')

            expect(res.status).toHaveBeenCalledWith(404)
        })

        test('rejects updating another users workout', async () => {
            req.params.id = 'workout123'
            req.user = {
                id: '456'
            }

            Workout.findById.mockResolvedValue({
                _id: 'workout123',
                user: '123'
            })

            await expect(updateWorkout(req, res))
                .rejects
                .toThrow('User not authorised')

            expect(res.status).toHaveBeenCalledWith(401)
            expect(Workout.findByIdAndUpdate).not.toHaveBeenCalled()    
        })
    })

    // Delete Workout
    describe('deleteWorkout', () => {
        test('deletes a workout successfully', async () => {
            req.params.id = 'workout123'
            req.user = {
                id: '123'
            }
        
            const workout = {
                _id: 'workout123',
                user: '123',
                summary: {
                    totalStrivePoints: {
                        total: 50
                    }
                },
                deleteOne: jest.fn().mockResolvedValue({})
            }
        
            const user = {
                _id: '123',
                strivepoints: 250
            }
        
            const updatedUser = {
                _id: '123',
                strivepoints: 200,
                level: 2
            }
        
            Workout.findById.mockResolvedValue(workout)
        
            User.findById
                .mockResolvedValueOnce(user)
                .mockResolvedValueOnce(updatedUser)
        
            User.findByIdAndUpdate.mockResolvedValue({})
        
            calculateLevel.mockReturnValue(2)
        
            await deleteWorkout(req, res)
        
            expect(Workout.findById).toHaveBeenCalledWith('workout123')
            expect(User.findById).toHaveBeenCalledWith('123')
        
            expect(calculateLevel).toHaveBeenCalledWith(200)
        
            expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
                '123',
                {
                    strivepoints: 200,
                    level: 2,
                    $pull: {
                        workouts: 'workout123'
                    }
                }
            )
        
            expect(workout.deleteOne).toHaveBeenCalled()
        
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith({
                user: updatedUser,
                message: 'Workout deleted successfully'
            })
        })
 
        test('never lets strivepoints drop below zero', async () => {
            req.params.id = 'workout123'
            req.user = {
                id: '123'
            }
        
            const workout = {
                _id: 'workout123',
                user: '123',
                summary: {
                    totalStrivePoints: {
                        total: 50
                    }
                },
                deleteOne: jest.fn().mockResolvedValue({})
            }
        
            Workout.findById.mockResolvedValue(workout)
        
            User.findById
                .mockResolvedValueOnce({ _id: '123', strivepoints: 30 })
                .mockResolvedValueOnce({ _id: '123', strivepoints: 0, level: 1 })
        
            User.findByIdAndUpdate.mockResolvedValue({})
            calculateLevel.mockReturnValue(1)
        
            await deleteWorkout(req, res)
        
            // 30 - 50 would be -20, so it is clamped to 0 before calculating the level
            expect(calculateLevel).toHaveBeenCalledWith(0)
        
            expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
                '123',
                {
                    strivepoints: 0,
                    level: 1,
                    $pull: {
                        workouts: 'workout123'
                    }
                }
            )
        
            expect(res.status).toHaveBeenCalledWith(200)
        })

        test('returns 404 when workout does not exist', async () => {
            req.params.id = 'workout123'
            req.user = {
                id: '123'
            }

            Workout.findById.mockResolvedValue(null)

            await expect(deleteWorkout(req, res))
                .rejects
                .toThrow('Workout with the id: workout123 was not found')

            expect(res.status).toHaveBeenCalledWith(404)
        })

        test('returns 404 when user is missing', async () => {
            req.params.id = 'workout123'
            req.user = null

            Workout.findById.mockResolvedValue({
                _id: 'workout123',
                user: '123'
            })

            await expect(deleteWorkout(req, res))
                .rejects
                .toThrow('User not found')

            expect(res.status).toHaveBeenCalledWith(404)
        })

        test('rejects deleting another users workout', async () => {
            req.params.id = 'workout123'
            req.user = {
                id: '456'
            }

            Workout.findById.mockResolvedValue({
                _id: 'workout123',
                user: '123'
            })

            await expect(deleteWorkout(req, res))
                .rejects
                .toThrow('User not authorised')

            expect(res.status).toHaveBeenCalledWith(401)
            expect(User.findById).not.toHaveBeenCalled()
            expect(User.findByIdAndUpdate).not.toHaveBeenCalled()
        })

        test('returns 404 when workout owner cannot be found', async () => {
            req.params.id = 'workout123'
            req.user = {
                id: '123'
            }

            Workout.findById.mockResolvedValue({
                _id: 'workout123',
                user: '123',
                summary: {
                    totalStrivePoints: 50
                }
            })

            User.findById.mockResolvedValue(null)

            await expect(deleteWorkout(req, res))
                .rejects
                .toThrow('User not found')

            expect(res.status).toHaveBeenCalledWith(404)
            expect(User.findByIdAndUpdate).not.toHaveBeenCalled()
        })
    })

    // Delete All Workouts
    describe('deleteAllWorkouts', () => {
        test('deletes all workouts for the authenticated user', async () => {
            req.params.id = '123'
            req.user = {
                _id: '123'
            }

            const user = {
                _id: '123'
            }

            User.findById.mockResolvedValue(user)
            Workout.deleteMany.mockResolvedValue({
                acknowledged: true,
                deletedCount: 3
            })

            await deleteAllWorkouts(req, res)

            expect(User.findById).toHaveBeenCalledWith('123')

            expect(Workout.deleteMany).toHaveBeenCalledWith({
                user: '123'
            })

            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith({
                message: 'All workouts deleted successfully'
            })
        })

        test('returns 404 when user does not exist', async () => {
            req.params.id = '123'
            req.user = {
                _id: '123'
            }

            User.findById.mockResolvedValue(null)

            await expect(deleteAllWorkouts(req, res))
                .rejects
                .toThrow('User not found')

            expect(User.findById).toHaveBeenCalledWith('123')
            expect(res.status).toHaveBeenCalledWith(404)

            expect(Workout.deleteMany).not.toHaveBeenCalled()
            expect(res.json).not.toHaveBeenCalled()
        })

        test('rejects user from deleting another users workouts', async () => {
            req.params.id = '123'
            req.user = {
                _id: '456'
            }

            User.findById.mockResolvedValue({
                _id: '123'
            })

            await expect(deleteAllWorkouts(req, res))
                .rejects
                .toThrow('User not authorized to reset this account')

            expect(User.findById).toHaveBeenCalledWith('123')
            expect(res.status).toHaveBeenCalledWith(401)

            expect(Workout.deleteMany).not.toHaveBeenCalled()
            expect(res.json).not.toHaveBeenCalled()
        })
    })

    // Add Exercise
    describe('addExercise', () => {
        const createWorkout = () => ({
            _id: 'workout123',
            user: '123',
            exercises: [],
            save: jest.fn()
        })

        const createExercise = (trackingMode = 'weight_reps') => ({
            _id: 'exercise123',
            name: 'Bench Press',
            trackingMode,
            equipment: ['barbell', 'dumbbell']
        })

        test('adds a weight/reps exercise successfully', async () => {
            req.params.id = 'workout123'

            req.user = {
                id: '123'
            }

            req.body = {
                exercise: 'exercise123',
                selectedEquipment: 'barbell',
                sets: [
                    {
                        weight: 80,
                        reps: 10
                    },
                    {
                        weight: 85,
                        reps: 8
                    }
                ]
            }

            const workout = createWorkout()
            const exercise = createExercise()

            const updatedWorkout = {
                ...workout,
                exercises: [
                    {
                        exercise: 'exercise123',
                        selectedEquipment: 'barbell',
                        sets: req.body.sets
                    }
                ]
            }

            Workout.findById.mockResolvedValue(workout)
            Exercise.findById.mockResolvedValue(exercise)
            workout.save.mockResolvedValue(updatedWorkout)

            await addExercise(req, res)

            expect(Workout.findById).toHaveBeenCalledWith('workout123')
            expect(Exercise.findById).toHaveBeenCalledWith('exercise123')

            expect(workout.exercises).toHaveLength(1)
            expect(workout.exercises[0]).toEqual({
                exercise: 'exercise123',
                selectedEquipment: 'barbell',
                sets: req.body.sets
            })

            expect(workout.save).toHaveBeenCalled()

            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith(updatedWorkout)
        })

        test('adds a duration exercise successfully', async () => {
            req.params.id = 'workout123'

            req.user = {
                id: '123'
            }

            req.body = {
                exercise: 'exercise123',
                sets: [
                    {
                        duration: 60
                    },
                    {
                        duration: 90
                    }
                ]
            }

            const workout = createWorkout()
            const exercise = createExercise('duration')

            Workout.findById.mockResolvedValue(workout)
            Exercise.findById.mockResolvedValue(exercise)
            workout.save.mockResolvedValue(workout)

            await addExercise(req, res)

            expect(workout.exercises).toHaveLength(1)
            expect(workout.exercises[0]).toEqual({
                exercise: 'exercise123',
                selectedEquipment: undefined,
                sets: req.body.sets
            })

            expect(workout.save).toHaveBeenCalled()
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith(workout)
        })

        test('adds a distance/duration exercise successfully', async () => {
            req.params.id = 'workout123'

            req.user = {
                id: '123'
            }

            req.body = {
                exercise: 'exercise123',
                sets: [
                    {
                        distance: 5,
                        duration: 30
                    }
                ]
            }

            const workout = createWorkout()
            const exercise = createExercise('distance_duration')

            Workout.findById.mockResolvedValue(workout)
            Exercise.findById.mockResolvedValue(exercise)
            workout.save.mockResolvedValue(workout)

            await addExercise(req, res)

            expect(workout.exercises[0]).toEqual({
                exercise: 'exercise123',
                selectedEquipment: undefined,
                sets: req.body.sets
            })

            expect(workout.save).toHaveBeenCalled()
            expect(res.status).toHaveBeenCalledWith(200)
        })

        test('returns 404 when workout does not exist', async () => {
            req.params.id = 'workout123'

            Workout.findById.mockResolvedValue(null)

            await expect(addExercise(req, res))
                .rejects
                .toThrow('Workout not found')

            expect(res.status).toHaveBeenCalledWith(404)
            expect(Exercise.findById).not.toHaveBeenCalled()
        })

        test('returns 404 when exercise does not exist', async () => {
            req.params.id = 'workout123'
            req.body.exercise = 'exercise123'

            Workout.findById.mockResolvedValue({
                _id: 'workout123',
                user: '123',
                exercises: []
            })

            Exercise.findById.mockResolvedValue(null)

            await expect(addExercise(req, res))
                .rejects
                .toThrow('Exercise not found')

            expect(res.status).toHaveBeenCalledWith(404)
            expect(res.json).not.toHaveBeenCalled()
        })

        test('rejects user who does not own the workout', async () => {
            req.params.id = 'workout123'

            req.user = {
                id: '456'
            }

            req.body = {
                exercise: 'exercise123'
            }

            Workout.findById.mockResolvedValue({
                _id: 'workout123',
                user: '123',
                exercises: []
            })

            Exercise.findById.mockResolvedValue({
                _id: 'exercise123',
                trackingMode: 'weight_reps',
                equipment: []
            })

            await expect(addExercise(req, res))
                .rejects
                .toThrow('User not authorised')

            expect(res.status).toHaveBeenCalledWith(401)
            expect(Workout.findById).toHaveBeenCalledWith('workout123')
            expect(Exercise.findById).toHaveBeenCalledWith('exercise123')
        })

        test('rejects when user is missing', async () => {
            req.params.id = 'workout123'
            req.user = null

            Workout.findById.mockResolvedValue({
                _id: 'workout123',
                user: '123',
                exercises: []
            })

            Exercise.findById.mockResolvedValue({
                _id: 'exercise123',
                trackingMode: 'weight_reps',
                equipment: []
            })

            await expect(addExercise(req, res))
                .rejects
                .toThrow('User not authorised')

            expect(res.status).toHaveBeenCalledWith(401)
        })

        test('rejects sets when sets is not an array', async () => {
            req.params.id = 'workout123'

            req.user = {
                id: '123'
            }

            req.body = {
                exercise: 'exercise123',
                sets: {
                    weight: 80,
                    reps: 10
                }
            }

            Workout.findById.mockResolvedValue({
                _id: 'workout123',
                user: '123',
                exercises: []
            })

            Exercise.findById.mockResolvedValue(
                createExercise('weight_reps')
            )

            await expect(addExercise(req, res))
                .rejects
                .toThrow('Sets must be an array')

            expect(res.status).toHaveBeenCalledWith(400)
        })

        test('rejects weight/reps sets with non-numeric values', async () => {
            req.params.id = 'workout123'

            req.user = {
                id: '123'
            }

            req.body = {
                exercise: 'exercise123',
                sets: [
                    {
                        weight: '80',
                        reps: 10
                    }
                ]
            }

            Workout.findById.mockResolvedValue({
                _id: 'workout123',
                user: '123',
                exercises: []
            })

            Exercise.findById.mockResolvedValue(
                createExercise('weight_reps')
            )

            await expect(addExercise(req, res))
                .rejects
                .toThrow('Each set must include numeric weight and reps')

            expect(res.status).toHaveBeenCalledWith(400)
        })

        test('rejects duration sets without numeric duration', async () => {
            req.params.id = 'workout123'

            req.user = {
                id: '123'
            }

            req.body = {
                exercise: 'exercise123',
                sets: [
                    {
                        duration: '60'
                    }
                ]
            }

            Workout.findById.mockResolvedValue({
                _id: 'workout123',
                user: '123',
                exercises: []
            })

            Exercise.findById.mockResolvedValue(
                createExercise('duration')
            )

            await expect(addExercise(req, res))
                .rejects
                .toThrow('Each set must include duration')

            expect(res.status).toHaveBeenCalledWith(400)
        })

        test('rejects distance/duration sets with missing values', async () => {
            req.params.id = 'workout123'

            req.user = {
                id: '123'
            }

            req.body = {
                exercise: 'exercise123',
                sets: [
                    {
                        distance: 5
                    }
                ]
            }

            Workout.findById.mockResolvedValue({
                _id: 'workout123',
                user: '123',
                exercises: []
            })

            Exercise.findById.mockResolvedValue(
                createExercise('distance_duration')
            )

            await expect(addExercise(req, res))
                .rejects
                .toThrow('Each set must include distance and duration')

            expect(res.status).toHaveBeenCalledWith(400)
        })

        test('rejects non-string selected equipment', async () => {
            req.params.id = 'workout123'

            req.user = {
                id: '123'
            }

            req.body = {
                exercise: 'exercise123',
                selectedEquipment: 123,
                sets: []
            }

            Workout.findById.mockResolvedValue({
                _id: 'workout123',
                user: '123',
                exercises: []
            })

            Exercise.findById.mockResolvedValue(
                createExercise()
            )

            await expect(addExercise(req, res))
                .rejects
                .toThrow('Equipment must be a string')

            expect(res.status).toHaveBeenCalledWith(400)
        })

        test('rejects equipment that is not available for the exercise', async () => {
            req.params.id = 'workout123'

            req.user = {
                id: '123'
            }

            req.body = {
                exercise: 'exercise123',
                selectedEquipment: 'cable',
                sets: []
            }

            Workout.findById.mockResolvedValue({
                _id: 'workout123',
                user: '123',
                exercises: []
            })

            Exercise.findById.mockResolvedValue(
                createExercise()
            )

            await expect(addExercise(req, res))
                .rejects
                .toThrow('Invalid equipment for this exercise')

            expect(res.status).toHaveBeenCalledWith(400)
        })

        test('allows an exercise to be added without sets', async () => {
            req.params.id = 'workout123'

            req.user = {
                id: '123'
            }

            req.body = {
                exercise: 'exercise123'
            }

            const workout = createWorkout()
            const exercise = createExercise()

            Workout.findById.mockResolvedValue(workout)
            Exercise.findById.mockResolvedValue(exercise)
            workout.save.mockResolvedValue(workout)

            await addExercise(req, res)

            expect(workout.exercises[0]).toEqual({
                exercise: 'exercise123',
                selectedEquipment: undefined,
                sets: []
            })

            expect(workout.save).toHaveBeenCalled()
            expect(res.status).toHaveBeenCalledWith(200)
        })
    })

    // Update Exercise
    describe('updateExercise', () => {
        const createWorkout = () => {
            const exercise = {
                _id: 'exerciseInstance123',
                name: 'Bench Press',
                musclegroup: 'Chest',
                description: 'Original description',
                sets: [
                    {
                        weight: 80,
                        reps: 10
                    }
                ]
            }

            return {
                _id: 'workout123',
                user: '123',
                exercises: {
                    id: jest.fn().mockReturnValue(exercise)
                },
                save: jest.fn(),
                _exercise: exercise
            }
        }

        test('updates an exercise successfully', async () => {
            req.params.id = 'workout123'
            req.params.exerciseId = 'exerciseInstance123'

            req.user = {
                id: '123'
            }

            req.body = {
                name: 'Incline Bench Press',
                musclegroup: 'Chest',
                description: 'Updated description',
                sets: [
                    {
                        weight: 90,
                        reps: 8
                    }
                ]
            }

            const workout = createWorkout()
            Workout.findById.mockResolvedValue(workout)
            workout.save.mockResolvedValue(workout)

            await updateExercise(req, res)

            expect(Workout.findById).toHaveBeenCalledWith('workout123')

            expect(workout.exercises.id)
                .toHaveBeenCalledWith('exerciseInstance123')

            expect(workout._exercise.name)
                .toBe('Incline Bench Press')

            expect(workout._exercise.musclegroup)
                .toBe('Chest')

            expect(workout._exercise.description)
                .toBe('Updated description')

            expect(workout._exercise.sets)
                .toEqual([
                    {
                        weight: 90,
                        reps: 8
                    }
                ])

            expect(workout.save).toHaveBeenCalled()

            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith(workout)
        })

        test('updates only supplied fields', async () => {
            req.params.id = 'workout123'
            req.params.exerciseId = 'exerciseInstance123'

            req.user = {
                id: '123'
            }

            req.body = {
                name: 'Updated Bench Press'
            }

            const workout = createWorkout()
            Workout.findById.mockResolvedValue(workout)
            workout.save.mockResolvedValue(workout)

            await updateExercise(req, res)

            expect(workout._exercise.name)
                .toBe('Updated Bench Press')

            expect(workout._exercise.musclegroup)
                .toBe('Chest')

            expect(workout._exercise.description)
                .toBe('Original description')

            expect(workout._exercise.sets)
                .toEqual([
                    {
                        weight: 80,
                        reps: 10
                    }
                ])

            expect(workout.save).toHaveBeenCalled()
            expect(res.status).toHaveBeenCalledWith(200)
        })

        test('updates sets when sets are provided', async () => {
            req.params.id = 'workout123'
            req.params.exerciseId = 'exerciseInstance123'

            req.user = {
                id: '123'
            }

            req.body = {
                sets: [
                    {
                        weight: 100,
                        reps: 5
                    }
                ]
            }

            const workout = createWorkout()
            Workout.findById.mockResolvedValue(workout)
            workout.save.mockResolvedValue(workout)

            await updateExercise(req, res)

            expect(workout._exercise.sets).toEqual([
                {
                    weight: 100,
                    reps: 5
                }
            ])

            expect(workout.save).toHaveBeenCalled()
            expect(res.status).toHaveBeenCalledWith(200)
        })

        test('returns 404 when workout does not exist', async () => {
            req.params.id = 'workout123'
            req.params.exerciseId = 'exerciseInstance123'

            Workout.findById.mockResolvedValue(null)

            await expect(updateExercise(req, res))
                .rejects
                .toThrow('Workout not found')

            expect(res.status).toHaveBeenCalledWith(404)
        })

        test('rejects update when user is missing', async () => {
            req.params.id = 'workout123'
            req.params.exerciseId = 'exerciseInstance123'
            req.user = null

            Workout.findById.mockResolvedValue({
                _id: 'workout123',
                user: '123'
            })

            await expect(updateExercise(req, res))
                .rejects
                .toThrow('User not authorised')

            expect(res.status).toHaveBeenCalledWith(401)
        })

        test('rejects user from updating another users workout', async () => {
            req.params.id = 'workout123'
            req.params.exerciseId = 'exerciseInstance123'

            req.user = {
                id: '456'
            }

            Workout.findById.mockResolvedValue({
                _id: 'workout123',
                user: '123'
            })

            await expect(updateExercise(req, res))
                .rejects
                .toThrow('User not authorised')

            expect(res.status).toHaveBeenCalledWith(401)
        })

        test('returns 404 when exercise does not exist in workout', async () => {
            req.params.id = 'workout123'
            req.params.exerciseId = 'missingExercise'

            req.user = {
                id: '123'
            }

            const workout = {
                _id: 'workout123',
                user: '123',
                exercises: {
                    id: jest.fn().mockReturnValue(null)
                }
            }

            Workout.findById.mockResolvedValue(workout)

            await expect(updateExercise(req, res))
                .rejects
                .toThrow('Exercise not found')

            expect(res.status).toHaveBeenCalledWith(404)
            expect(workout.exercises.id)
                .toHaveBeenCalledWith('missingExercise')
        })
    })

    // Delete Exercise
    describe('deleteExercise', () => {
        test('deletes an exercise successfully', async () => {
            req.params.id = 'workout123'
            req.params.exerciseId = 'exercise123'

            req.user = {
                id: '123'
            }

            const workout = {
                _id: 'workout123',
                user: '123',
                exercises: [
                    {
                        _id: 'exercise123',
                        name: 'Bench Press'
                    },
                    {
                        _id: 'exercise456',
                        name: 'Squat'
                    }
                ],
                save: jest.fn()
            }

            Workout.findById.mockResolvedValue(workout)
            workout.save.mockResolvedValue(workout)

            await deleteExercise(req, res)

            expect(Workout.findById).toHaveBeenCalledWith('workout123')

            expect(workout.exercises).toEqual([
                {
                    _id: 'exercise456',
                    name: 'Squat'
                }
            ])

            expect(workout.save).toHaveBeenCalled()

            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith(workout)
        })

        test('returns 404 when workout does not exist', async () => {
            req.params.id = 'workout123'
            req.params.exerciseId = 'exercise123'

            Workout.findById.mockResolvedValue(null)

            await expect(deleteExercise(req, res))
                .rejects
                .toThrow('Workout not found')

            expect(res.status).toHaveBeenCalledWith(404)
        })

        test('rejects user from deleting exercise from another users workout', async () => {
            req.params.id = 'workout123'
            req.params.exerciseId = 'exercise123'

            req.user = {
                id: '456'
            }

            Workout.findById.mockResolvedValue({
                _id: 'workout123',
                user: '123',
                exercises: []
            })

            await expect(deleteExercise(req, res))
                .rejects
                .toThrow('User not authorised')

            expect(res.status).toHaveBeenCalledWith(401)
        })

        test('rejects deletion when user is missing', async () => {
            req.params.id = 'workout123'
            req.params.exerciseId = 'exercise123'
            req.user = null

            Workout.findById.mockResolvedValue({
                _id: 'workout123',
                user: '123',
                exercises: []
            })

            await expect(deleteExercise(req, res))
                .rejects
                .toThrow('User not authorised')

            expect(res.status).toHaveBeenCalledWith(401)
        })

        test('saves the workout after removing the exercise', async () => {
            req.params.id = 'workout123'
            req.params.exerciseId = 'exercise123'

            req.user = {
                id: '123'
            }

            const workout = {
                _id: 'workout123',
                user: '123',
                exercises: [
                    {
                        _id: 'exercise123',
                        name: 'Bench Press'
                    }
                ],
                save: jest.fn()
            }

            Workout.findById.mockResolvedValue(workout)
            workout.save.mockResolvedValue(workout)

            await deleteExercise(req, res)

            expect(workout.exercises).toEqual([])
            expect(workout.save).toHaveBeenCalledTimes(1)

            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith(workout)
        })

        test('does not remove another exercise when deleting a specific exercise', async () => {
            req.params.id = 'workout123'
            req.params.exerciseId = 'exercise456'

            req.user = {
                id: '123'
            }

            const workout = {
                _id: 'workout123',
                user: '123',
                exercises: [
                    {
                        _id: 'exercise123',
                        name: 'Bench Press'
                    },
                    {
                        _id: 'exercise456',
                        name: 'Squat'
                    },
                    {
                        _id: 'exercise789',
                        name: 'Deadlift'
                    }
                ],
                save: jest.fn()
            }

            Workout.findById.mockResolvedValue(workout)
            workout.save.mockResolvedValue(workout)

            await deleteExercise(req, res)

            expect(workout.exercises).toEqual([
                {
                    _id: 'exercise123',
                    name: 'Bench Press'
                },
                {
                    _id: 'exercise789',
                    name: 'Deadlift'
                }
            ])

            expect(workout.save).toHaveBeenCalled()
            expect(res.status).toHaveBeenCalledWith(200)
        })
    })
})