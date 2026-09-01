const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const validator = require('validator')

// Mock dependencies before importing controller
jest.mock('express-async-handler', () => {
    return jest.fn((fn) => {
        return async (...args) => {
            return await fn(...args)
        }
    })
})

jest.mock('bcryptjs')
jest.mock('jsonwebtoken')
jest.mock('validator')

jest.mock('../models/userModel.js')
jest.mock('../models/workoutModel.js')
jest.mock('../models/questModel.js')

jest.mock('../utils/formatUser.js')

jest.mock('../utils/workoutServices.js', () => ({
    addPointsToUser: jest.fn(),
    updateUserMomentum: jest.fn(),
    checkAndBreakStreak: jest.fn(),
    checkAndIncreaseStreak: jest.fn()
}))

jest.mock('../utils/dateFormat.js', () => ({
    getStartOfWeek: jest.fn(),
    getEndOfWeek: jest.fn(),
    getPreviousWeekRange: jest.fn(),
    getISOWeekString: jest.fn(),
    getPreviousISOWeekString: jest.fn(),
    getWeeksBetween: jest.fn(),
    isoWeekToDate: jest.fn()
}))

jest.mock('../utils/momentum.js', () => ({
    calculateMomentum: jest.fn()
}))

const User = require('../models/userModel.js')
const Workout = require('../models/workoutModel.js')
const Quest = require('../models/questModel.js')

const formatUser = require('../utils/formatUser.js')

const {
    addPointsToUser,
    updateUserMomentum,
    checkAndBreakStreak,
    checkAndIncreaseStreak
} = require('../utils/workoutServices.js')

const {
    registerUser,
    loginUser,
    migrateUser,
    getMe,
    deleteUser,
    resetUser,
    updateUnitPreference,
    addPoints,
    updateProfile,
    checkIfStreakBroken,
    checkIfStreakIncreased,
    updateMomentum
} = require('../controllers/userController.js')

describe('userController', () => {
    let req
    let res
    beforeEach(() => {
        jest.clearAllMocks()

        req = {
            body: {},
            params: {},
            headers: {},
            user: {}
        }

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        formatUser.mockImplementation((user, token) => ({
            id: user._id,
            token
        }))

        jwt.sign.mockReturnValue('test-jwt-token')
        bcrypt.genSalt.mockResolvedValue('test-salt')
        bcrypt.hash.mockResolvedValue('hashed-password')
        bcrypt.compare.mockResolvedValue(true)

        validator.isEmail.mockReturnValue(true)
        validator.normalizeEmail.mockImplementation((email) => email)
        validator.isStrongPassword.mockReturnValue(true)
    })

    // Register User
    describe('registerUser', () => {
        test('register a user successfully', async () => {
            req.body = {
                username: 'john',
                email: 'john@example.com',
                password: 'Password123!'
            }

            User.findOne
                .mockResolvedValueOnce(null)
                .mockResolvedValueOnce(null)

            const user = {
                _id: '123',
                username: 'john',
                email: 'john@example.com',
                password: 'hashed-password'
            }

            User.create.mockResolvedValue(user)

            await registerUser(req, res)

            expect(User.findOne).toHaveBeenCalledTimes(2)
            expect(User.create).toHaveBeenCalledWith({
                username: 'john',
                email: 'john@example.com',
                password: 'hashed-password',
                useImperial: false,
                isGuest: false
            })
            expect(bcrypt.genSalt).toHaveBeenCalledWith(10)
            expect(bcrypt.hash).toHaveBeenCalledWith(
                'Password123!',
                'test-salt'
            )
            expect(jwt.sign).toHaveBeenCalledWith(
                { id: '123' },
                process.env.JWT_SECRET,
                { expiresIn: '14d' }
            )
            expect(res.status).toHaveBeenCalledWith(201)
            expect(res.json).toHaveBeenCalled()
    
        })

        test('rejects registration when fields are missing', async () => { 
            req.body = { 
                username: 'john', 
                email: 'john@example.com' 
            } 
            
            await expect(registerUser(req, res)) 
                .rejects 
                .toThrow('Please add all fields') 
                
            expect(res.status).toHaveBeenCalledWith(400)
            expect(User.findOne).not.toHaveBeenCalled() 
        })

        test('rejects invalid email', async () => { 
            req.body = { 
                username: 'john', 
                email: 'not-an-email', 
                password: 'Password123!' 
            } 
            
            validator.isEmail.mockReturnValue(false) 
            
            await expect(registerUser(req, res)) 
                .rejects 
                .toThrow('Invalid email address') 
                
            expect(res.status).toHaveBeenCalledWith(400) 
        })

        test('rejects weak password', async () => { 
            req.body = { 
                username: 'john', 
                email: 'john@example.com', 
                password: 'password' 
            } 
            
            validator.isStrongPassword.mockReturnValue(false) 
            
            await expect(registerUser(req, res)) 
                .rejects 
                .toThrow('Password must satisfy all criteria.') 
                
            expect(res.status).toHaveBeenCalledWith(400) 
        })

        test('rejects duplicate email', async () => { 
            req.body = { 
                username: 'john', 
                email: 'john@example.com', 
                password: 'Password123!' 
            } 
            
            User.findOne.mockResolvedValueOnce({ _id: 'existing-user' }) 
            
            await expect(registerUser(req, res)) 
                .rejects 
                .toThrow('Email already exists') 
                
            expect(res.status).toHaveBeenCalledWith(400) 
        })

        test('rejects duplicate username', async () => { 
            req.body = { 
                username: 'john', 
                email: 'john@example.com', 
                password: 'Password123!' 
            } 
            
            User.findOne 
                .mockResolvedValueOnce(null) 
                .mockResolvedValueOnce({ _id: 'existing-user' }) 
                
            await expect(registerUser(req, res)) 
                .rejects 
                .toThrow('Username already exists') 
                
            expect(res.status).toHaveBeenCalledWith(400) 
        })
    })

    // Login User
    describe('loginUser', () => {
        test('logs in using username', async () => {
            req.body = {
                username: 'john',
                password: 'Password123!'
            }

            validator.isEmail.mockReturnValue(false)

            const user = {
                _id: '123',
                username: 'john',
                password: 'hashed-password'
            }

            User.findOne.mockResolvedValue(user)

            await loginUser(req, res)

            expect(User.findOne).toHaveBeenCalledWith({
                username: 'john'
            })
            expect(bcrypt.compare).toHaveBeenCalledWith(
                'Password123!',
                'hashed-password'
            )

            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalled()
        })

        test('logs in using email', async () => {
            req.body = {
                email:'john@example.com',
                password: 'Password123!'
            }

            const user = {
                _id: '123',
                email: 'john@example.com',
                password: 'hashed-password'
            }

            User.findOne.mockResolvedValue(user)

            await loginUser(req, res)

            expect(User.findOne).toHaveBeenCalledWith({
                email: 'john@example.com'
            })
            expect(res.status).toHaveBeenCalledWith(200)
        })

        test('rejects missing identifier', async () => {
            req.body = {
                password: 'Password123!'
            }

            await expect(loginUser(req, res))
                .rejects
                .toThrow('Please provide username/email and password')

            expect(res.status).toHaveBeenCalledWith(400)
        })

        test('rejects invalid credentials when user does not exist', async () => {
            req.body = {
                username: 'john',
                password: 'Password123!'
            }

            User.findOne.mockResolvedValue(null)

            await expect(loginUser(req, res))
                .rejects
                .toThrow('Invalid user credentials')

            expect(res.status).toHaveBeenCalledWith(400)
        })

        test('rejects invalid credentials when password is incorrect', async () => {
            req.body = {
                username: 'john',
                password: 'WrongPassword123!'
            }

            User.findOne.mockResolvedValue({
                _id: '123',
                password: 'hashed-password'
            })

            bcrypt.compare.mockResolvedValue(false)

            await expect(loginUser(req, res))
                .rejects
                .toThrow('Invalid user credentials')

            expect(res.status).toHaveBeenCalledWith(400)
        })
    })

    // Migrate User
    describe('migrateUser', () => {
        test('migrates a guest account successfully', async () => {
            req.user = {
                id: '123'
            }

            req.body = {
                username: 'newusername',
                email: 'new@example.com',
                password: 'Password123!'
            }

            const user = {
                _id: '123',
                isGuest: true,
                save: jest.fn().mockResolvedValue(true)
            }

            User.findById.mockResolvedValue(user)

            User.findOne
                .mockResolvedValueOnce(null)
                .mockResolvedValueOnce(null)

            await migrateUser(req, res)
            
            expect(user.username).toBe('newusername')
            expect(user.email).toBe('new@example.com')
            expect(user.password).toBe('hashed-password')
            expect(user.isGuest).toBe(false)

            expect(user.save).toHaveBeenCalled()

            expect(res.status).toHaveBeenCalledWith(201)
            expect(res.json).toHaveBeenCalled()
        })

        test('rejects migration when user does not exist', async () => {
            req.user = {
                id: '123'
            }

            User.findById.mockResolvedValue(null)

            await expect(migrateUser(req, res))
                .rejects
                .toThrow('User not found')

            expect(res.status).toHaveBeenCalledWith(404)
        })

        test('rejects migration for non-guest user', async () => {
            req.user ={ 
                id: '123'
            }

            User.findById.mockResolvedValue({
                _id: '123',
                isGuest: false
            })

            await expect(migrateUser(req, res))
                .rejects
                .toThrow('Only guest accounts can migrate')

            expect(res.status).toHaveBeenCalledWith(400)
        })

        test('rejects migration when fields are missing', async () => {
            req.user = {
                id: '123'
            }

            req.body = {
                username: 'john'
            }

            User.findById.mockResolvedValue({
                _id: '123',
                isGuest: true
            })

            await expect(migrateUser(req, res))
                .rejects
                .toThrow('Please add all fields')

            expect(res.status).toHaveBeenCalledWith(400)
        })

        test('rejects duplicate email belonging to another user', async () => {
            req.user = {
                id: '123'
            }

            req.body = { 
                username: 'john',
                email: 'john@example.com',
                password: 'Password123!'
            }

            User.findById.mockResolvedValue({
                _id: '123',
                isGuest: true
            })

            User.findOne.mockResolvedValueOnce({
                _id: '456'
            })

            await expect(migrateUser(req, res))
                .rejects
                .toThrow('Email already exists')

            expect(res.status).toHaveBeenCalledWith(400)
        })

        test('rejects duplicate username belonging to another user', async () => {
            req.user = {
                id: '123'
            }

            req.body = {
                username: 'john',
                email: 'john@example.com',
                password: 'Password123!'
            }

            User.findById.mockResolvedValue({
                _id: '123',
                isGuest: true
            })

            User.findOne
                .mockResolvedValueOnce(null)
                .mockResolvedValueOnce({
                    _id: '456'
                })
            
                await expect(migrateUser(req, res))
                    .rejects
                    .toThrow('Username already exists')

                expect(res.status).toHaveBeenCalledWith(400)
        })
    })

    // Get Me
    describe('getMe', () => {
        test('returns current user with token', async () => {
            req.user = {
                _id: '123',
                username: 'john'
            }

            req.headers.authorization = 'Bearer test-token'

            await getMe(req, res)

            expect(formatUser).toHaveBeenCalledWith(
                req.user,
                'test-token'
            )

            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalled()
        })
    })

    // Delete User
    describe('deleteUser', () => {
        test('deletes user and associated workouts/quests', async () => {
            req.params.id = '123'
            req.user = {
                _id:'123'
            }

            const user = {
                _id: '123',
                deleteOne: jest.fn().mockResolvedValue(true)
            }

            User.findById.mockResolvedValue(user)
            Workout.deleteMany.mockResolvedValue({})
            Quest.deleteMany.mockResolvedValue({})

            await deleteUser(req, res)

            expect(Workout.deleteMany).toHaveBeenCalledWith({
                user: '123'
            })

            expect(Quest.deleteMany).toHaveBeenCalledWith({
                user: '123'
            })

            expect(user.deleteOne).toHaveBeenCalled()

            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith({
                id: '123',
                message: 'User and associated data deleted successfully'
            })
        })

        test('returns 404 when user does not exist', async () => {
            req.params.id = '123'

            User.findById.mockResolvedValue(null)

            await expect(deleteUser(req, res))
                .rejects
                .toThrow('User not found')

            expect(res.status).toHaveBeenCalledWith(404)
        })

        test('rejects deleting another user account', async () => {
            req.params.id = '123'
            req.user = {
                _id: '456'
            }

            User.findById.mockResolvedValue({
                _id: '123'
            })

            await expect(deleteUser(req, res))
                .rejects
                .toThrow('User not authorized to delete this account')

            expect(res.status).toHaveBeenCalledWith(401)

            expect(Workout.deleteMany).not.toHaveBeenCalled()
            expect(Quest.deleteMany).not.toHaveBeenCalled()
        })
    })

    // Reset User
    describe('resetUser', () => {
        test('resets own workout data', async () => {
            req.params.id = '123'
            req.user = {
                id: '123',
                isAdmin: false
            }

            Workout.deleteMany.mockResolvedValue({})

            await resetUser(req, res)

            expect(Workout.deleteMany).toHaveBeenCalledWith({ 
                user: '123'
            })

            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith({ message: 'All user workout data has been reset successfully' })
        })

        test('allows admin to reset another user', async () => {
            req.params.id = '123'
            req.user = {
                id: '456',
                isAdmin: true
            }

            Workout.deleteMany.mockResolvedValue({})

            await resetUser(req, res)

            expect(Workout.deleteMany).toHaveBeenCalledWith({
                user: '123'
            })

            expect(res.status).toHaveBeenCalledWith(200)
        })

        test('rejects unauthorised reset', async () => {
            req.params.id = '123'
            req.user = {
                id: '456',
                isAdmin: false
            }

            await expect(resetUser(req, res))
                .rejects
                .toThrow('Not authorized to reset this user')

            expect(res.status).toHaveBeenCalledWith(401)
            expect(Workout.deleteMany).not.toHaveBeenCalled()
        })
    })

    // Update Unit Preference
    describe('updateUnitPreference', () => {
        test('updated unit preference', async () => {
            req.user = {
                id: '123'
            }

            req.body = {
                useImperial: true
            }

            const user = {
                _id: '123',
                useImperial: false,
                save: jest.fn().mockResolvedValue({
                    _id: '123',
                    useImperial: true
                })
            }

            User.findById.mockResolvedValue(user)

            await updateUnitPreference(req, res)

            expect(user.useImperial).toBe(true)
            expect(user.save).toHaveBeenCalled()

            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalled()
        })

        test('returns 404 when user does not exist', async () => {
            req.user ={
                id: '123'
            }

            User.findById.mockResolvedValue(null)

            await expect(updateUnitPreference(req, res))
                .rejects
                .toThrow('User not found')

            expect(res.status).toHaveBeenCalledWith(404)
        })
    })

    // Add Points
    describe('addPoints', () => {
        test('adds points to user', async () => {
            req.params.id = '123'
            req.body = {
                amount: 50
            }

            const user = {
                _id: '123',
                points: 150
            }

            addPointsToUser.mockResolvedValue(user)

            await addPoints(req, res)

            expect(addPointsToUser).toHaveBeenCalledWith(
                '123',
                50
            )

            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalled()
        })
    })

    // Update Profile
    describe('updateProfile', () => {
        test('updates target, height and weight', async () => {
            req.user = {
                id: '123'
            }

            req.body = {
                target: 5,
                height: {
                    feet: 6,
                    inches: 2
                },
                weight: 80
            }

            const user = {
                _id: '123',
                save: jest.fn().mockResolvedValue({
                    _id: '123',
                    target: 5,
                    height: {
                        feet: 6,
                        inches: 2
                    },
                    weight: 80
                })
            }

            User.findById.mockResolvedValue(user)

            await updateProfile(req, res)

            expect(user.target).toBe(5)
            expect(user.height).toEqual({
                feet: 6,
                inches: 2
            })
            expect(user.weight).toBe(80)

            expect(user.save).toHaveBeenCalled()

            expect(res.status).toHaveBeenCalledWith(200)
        })

        test('allows partial profile updates', async () => {
            req.user = {
                id: '123'
            }

            req.body = {
                weight: 75
            }

            const user = {
                _id: '123',
                target:  5,
                height: {
                    feet: 6,
                    inches: 0
                },
                save: jest.fn().mockResolvedValue(true)
            }

            User.findById.mockResolvedValue(user)

            await updateProfile(req, res)

            expect(user.weight).toBe(75)
            expect(user.save).toHaveBeenCalled()
        })

        test('rejects target below 1', async () => {
            req.user = {
                id: '123'
            }

            req.body = {
                target: 0
            }

            User.findById.mockResolvedValue({
                _id: '123'
            })

            try {
                await updateProfile(req, res)
            } catch (error) {
                expect(error.message).toBe('Target must be a number between 1 and 7')
            }

            expect(res.status).toHaveBeenCalledWith(400)
        })

        test('rejects target above 7', async () => {
            req.user = {
                id: '123'
            }

            req.body = {
                target: 8
            }

            User.findById.mockResolvedValue({
                _id: '123'
            })

            await expect(updateProfile(req, res))
                .rejects
                .toThrow('Target must be a number between 1 and 7')

            expect(res.status).toHaveBeenCalledWith(400)
        })

        test('rejects invalid height', async () => {
            req.user = {
                id: '123'
            }

            req.body = {
                height: {
                    feet: 'invalid',
                    inches: 2
                }
            }

            User.findById.mockResolvedValue({
                _id: '123'
            })

            await expect(updateProfile(req, res))
                .rejects
                .toThrow('Height must be an object with numeric feet and inches')

            expect(res.status).toHaveBeenCalledWith(400)
        })

        test('rejects invalid weight', async () => {
            req.user = {
                id: '123'
            }

            req.body = {
                weight: -10
            }

            User.findById.mockResolvedValue({
                _id: '123'
            })

            await expect(updateProfile(req, res))
                .rejects
                .toThrow('Weight must be a positive number')

            expect(res.status).toHaveBeenCalledWith(400)
        })

        test('returns 404 when updating profile for missing user', async () => {
            req.user = {
                id: '123'
            }

            User.findById.mockResolvedValue(null)
            
            await expect(updateProfile(req, res))
                .rejects
                .toThrow('User not found')

            expect(res.status).toHaveBeenCalledWith(404)
        })
    })

    // Check if Streak is Broken
    describe('checkIfStreakBroken', () => {
        test('checks and breaks streak successfully', async () => {
            req.params.id = '123'

            const user = {
                _id: '123',
                streak: 0
            }

            checkAndBreakStreak.mockResolvedValue(user)

            await checkIfStreakBroken(req, res)

            expect(checkAndBreakStreak).toHaveBeenCalledWith('123')

            expect(formatUser).toHaveBeenCalledWith(user)

            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalled()
        })
    })

    // Check if Streak is increased
    describe('checkIfStreakIncreased', () => {
        test('checks and increases streak successfully', async () => {
            req.params.id = '123'

            const user = {
                _id: '123',
                streak: 5
            }

            checkAndIncreaseStreak.mockResolvedValue(user)

            await checkIfStreakIncreased(req, res)

            expect(checkAndIncreaseStreak).toHaveBeenCalledWith('123')

            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalled()
        })
    })

    // Update Momentum
    describe('updateMomentum', () => {
        test('updates user momentum successfully', async () => {
            req.user = {
                id: '123'
            }

            req.body = {
                momentum: 75
            }

            const user = {
                _id: '123',
                momentum: 75
            }

            updateUserMomentum.mockResolvedValue(user)

            await updateMomentum(req, res)

            expect(updateUserMomentum).toHaveBeenCalledWith(
                '123',
                {
                    momentum: 75
                }
            )

            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalled()
        })
    })
})