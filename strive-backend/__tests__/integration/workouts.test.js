const { startDatabase, stopDatabase, clearDatabase, buildApp, registerUser, auth, request } = require('../../test-support/integration')
const User = require('../../models/userModel')
const Workout = require('../../models/workoutModel')
const Quest = require('../../models/questModel')
const Exercise = require('../../models/exerciseModel')
const LeaderboardEntry = require('../../models/leaderboardEntryModel')
const mailer = require('../../utils/mailer')

jest.setTimeout(120000)

let app
let bench

beforeAll(async () => {
    await startDatabase()
    app = buildApp()
})

afterAll(stopDatabase)

beforeEach(async () => {
    await clearDatabase()
    jest.spyOn(mailer, 'sendMail').mockResolvedValue({ sent: false })
    bench = await Exercise.create({ name: 'Bench Press', muscleGroup: 'Chest', subMuscleGroup: 'Mid chest', equipment: ['Barbell'], trackingMode: 'weight_reps' })
})

afterEach(() => jest.restoreAllMocks())

// A workout big enough to earn Strive Points
const workoutBody = (overrides = {}) => ({
    title: 'Push',
    duration: 30,
    exercises: [{
        exercise: String(bench._id),
        selectedEquipment: 'Barbell',
        sets: [{ weight: 60, reps: 8 }, { weight: 60, reps: 8 }, { weight: 62.5, reps: 6 }]
    }],
    ...overrides
})

const save = (token, body) => request(app).post('/api/workouts').set(auth(token)).send(body)

const pointsOf = async (username) => (await User.findOne({ username })).strivepoints

describe('saving a workout', () => {
    test('saves, awards points and updates the user', async () => {
        const { token, credentials } = await registerUser(app)

        const res = await save(token, workoutBody())

        expect(res.status).toBe(201)
        expect(res.body.workout.summary.totalStrivePoints.total).toBeGreaterThan(0)
        expect(await Workout.countDocuments()).toBe(1)
        expect(await pointsOf(credentials.username)).toBe(res.body.workout.summary.totalStrivePoints.total)
    })

    test('sending the same clientId again returns the stored workout and awards nothing twice', async () => {
        const { token, credentials } = await registerUser(app)
        const body = workoutBody({ clientId: 'client-abc-12345' })

        const first = await save(token, body)
        const pointsAfterFirst = await pointsOf(credentials.username)
        const second = await save(token, body)

        expect(first.status).toBe(201)
        expect(second.status).toBe(200)
        expect(second.body.duplicate).toBe(true)
        expect(second.body.workout._id).toBe(first.body.workout._id)
        expect(await Workout.countDocuments()).toBe(1)
        expect(await pointsOf(credentials.username)).toBe(pointsAfterFirst)
    })

    test('five identical requests at the same moment save one workout and pay once', async () => {
        const { token, credentials } = await registerUser(app)
        const body = workoutBody({ clientId: 'client-race-12345' })

        const results = await Promise.all(Array.from({ length: 5 }, () => save(token, body)))
        const statuses = results.map(r => r.status).sort()

        expect(statuses.filter(s => s === 201)).toHaveLength(1)
        expect(statuses.filter(s => s === 200)).toHaveLength(4)
        expect(await Workout.countDocuments()).toBe(1)

        const only = await Workout.findOne()
        expect(await pointsOf(credentials.username)).toBe(only.summary.totalStrivePoints.total)
    })

    test('different workouts saved at the same moment all count, with no lost updates', async () => {
        const { token, credentials } = await registerUser(app)

        const results = await Promise.all([1, 2, 3].map(n => save(token, workoutBody({ clientId: `client-multi-${n}-xxxx`, title: `Workout ${n}` }))))

        expect(results.every(r => r.status === 201)).toBe(true)
        const workouts = await Workout.find()
        expect(workouts).toHaveLength(3)

        const total = workouts.reduce((sum, w) => sum + w.summary.totalStrivePoints.total, 0)
        expect(await pointsOf(credentials.username)).toBe(total)
    })

    test('a quest cannot be paid twice by two workouts saved together', async () => {
        const { token, credentials } = await registerUser(app)
        const user = await User.findOne({ username: credentials.username })

        await Quest.create({
            user: user._id, title: 'Bench 50', questType: 'strength', duration: 'daily', description: 'x',
            expiry: new Date(Date.now() + 1e8), reward: 100,
            completion: { exercise: 'Bench Press', selectedEquipment: 'Barbell', weight: 50, reps: 5 }
        })

        const results = await Promise.all([1, 2].map(n => save(token, workoutBody({ clientId: `client-quest-${n}-xxxx` }))))
        expect(results.every(r => r.status === 201)).toBe(true)

        const completedOn = results.filter(r => r.body.workout.summary.questsCompleted.length > 0)
        expect(completedOn).toHaveLength(1)
        expect((await Quest.findOne({ user: user._id })).status).toBe('completed')
    })

    test('a failure part-way undoes everything, and the retry then works once', async () => {
        const { token, credentials } = await registerUser(app)
        const user = await User.findOne({ username: credentials.username })
        const quest = await Quest.create({
            user: user._id, title: 'Bench 50', questType: 'strength', duration: 'daily', description: 'x',
            expiry: new Date(Date.now() + 1e8), reward: 100,
            completion: { exercise: 'Bench Press', selectedEquipment: 'Barbell', weight: 50, reps: 5 }
        })
        const body = workoutBody({ clientId: 'client-fail-12345' })

        jest.spyOn(console, 'error').mockImplementation(() => {})
        jest.spyOn(User, 'findByIdAndUpdate').mockRejectedValueOnce(new Error('database hiccup'))

        const failed = await save(token, body)
        expect(failed.status).toBe(500)

        // Nothing is left behind: no workout, quest back to active, no points
        expect(await Workout.countDocuments()).toBe(0)
        const afterFailure = await Quest.findById(quest._id)
        expect(afterFailure.status).toBe('active')
        expect(afterFailure.progressLog).toHaveLength(0)
        expect(await pointsOf(credentials.username)).toBe(0)

        // The retry (same clientId) succeeds and pays once
        const retry = await save(token, body)
        expect(retry.status).toBe(201)
        expect(retry.body.workout.summary.questsCompleted).toHaveLength(1)
        expect(await Workout.countDocuments()).toBe(1)
        expect((await Quest.findById(quest._id)).status).toBe('completed')
    })

    test('a leaderboard failure does not undo or fail the workout', async () => {
        const { token } = await registerUser(app)
        jest.spyOn(console, 'error').mockImplementation(() => {})
        jest.spyOn(LeaderboardEntry, 'findOneAndUpdate').mockRejectedValue(new Error('leaderboard down'))

        const res = await save(token, workoutBody())

        expect(res.status).toBe(201)
        expect(await Workout.countDocuments()).toBe(1)
    })

    test('rejects a malformed clientId', async () => {
        const { token } = await registerUser(app)

        expect((await save(token, workoutBody({ clientId: 'short' }))).status).toBe(400)
        expect((await save(token, workoutBody({ clientId: { $ne: null } }))).status).toBe(400)
        expect(await Workout.countDocuments()).toBe(0)
    })

    test('two people can use the same clientId', async () => {
        const a = await registerUser(app)
        const b = await registerUser(app)
        const body = workoutBody({ clientId: 'client-shared-1234' })

        expect((await save(a.token, body)).status).toBe(201)
        expect((await save(b.token, body)).status).toBe(201)
        expect(await Workout.countDocuments()).toBe(2)
    })
})

describe('rules around saving', () => {
    test('a workout that is too small is saved but earns nothing', async () => {
        const { token, credentials } = await registerUser(app)
        const tiny = workoutBody({ duration: 2, exercises: [{ exercise: String(bench._id), selectedEquipment: 'Barbell', sets: [{ weight: 20, reps: 5 }] }] })

        const res = await save(token, tiny)

        expect(res.status).toBe(201)
        expect(res.body.workout.summary.totalStrivePoints.total).toBe(0)
        expect(res.body.workout.summary.noSPReason).toBeTruthy()
        expect(await pointsOf(credentials.username)).toBe(0)
    })

    test('guests are limited to five workouts and kept off the leaderboard', async () => {
        const reg = await request(app).post('/api/users').send({ username: 'guesty', email: 'guesty@strive.com', password: 'Passw0rd!long', isGuest: true })
        const token = reg.body.token

        for (let i = 0; i < 5; i++) {
            expect((await save(token, workoutBody({ title: `W${i}` }))).status).toBe(201)
        }
        expect((await save(token, workoutBody())).status).toBe(403)
        expect(await Workout.countDocuments()).toBe(5)
        expect(await LeaderboardEntry.countDocuments()).toBe(0)
    })

    test('members appear on the leaderboard, guests do not', async () => {
        const member = await registerUser(app)
        await save(member.token, workoutBody())

        const res = await request(app).get('/api/leaderboard').set(auth(member.token))
        expect(res.status).toBe(200)
        expect(res.body.map(entry => entry.user.username)).toEqual([member.credentials.username])
    })

    test('cannot log another member\'s custom exercise', async () => {
        const owner = await registerUser(app)
        const other = await registerUser(app)
        const ownerDoc = await User.findOne({ username: owner.credentials.username })
        const custom = await Exercise.create({ name: 'Secret Lift', muscleGroup: 'Legs', equipment: ['Barbell'], trackingMode: 'weight_reps', isCustom: true, createdBy: ownerDoc._id })

        const body = workoutBody({ exercises: [{ exercise: String(custom._id), selectedEquipment: 'Barbell', sets: [{ weight: 50, reps: 5 }] }] })

        expect((await save(other.token, body)).status).toBe(400)
        expect((await save(owner.token, body)).status).toBe(201)
    })

    test('deleting a workout needs to be the owner (403) and removes the points', async () => {
        const owner = await registerUser(app)
        const other = await registerUser(app)
        const created = await save(owner.token, workoutBody())
        const id = created.body.workout._id

        expect((await request(app).delete(`/api/workouts/${id}`).set(auth(other.token))).status).toBe(403)
        expect(await Workout.countDocuments()).toBe(1)

        expect((await request(app).delete(`/api/workouts/${id}`).set(auth(owner.token))).status).toBe(200)
        expect(await Workout.countDocuments()).toBe(0)
        expect(await pointsOf(owner.credentials.username)).toBe(0)
    })

    test('workouts are listed for their owner only', async () => {
        const a = await registerUser(app)
        const b = await registerUser(app)
        await save(a.token, workoutBody({ title: 'Mine' }))

        const mine = await request(app).get('/api/workouts').set(auth(a.token))
        const theirs = await request(app).get('/api/workouts').set(auth(b.token))

        expect(mine.body.map(w => w.title)).toEqual(['Mine'])
        expect(theirs.body).toEqual([])
    })
})

describe('scoring against real history', () => {
    test('the daily Strive Points limit holds across real saves', async () => {
        const { token, credentials } = await registerUser(app)

        const totals = []
        let last
        for (let i = 0; i < 7; i++) {
            last = await save(token, workoutBody({
                clientId: `client-cap-${i}-xxxxxxxx`,
                exercises: [{ exercise: String(bench._id), selectedEquipment: 'Barbell', sets: [{ weight: 60 + i * 5, reps: 8 }, { weight: 60 + i * 5, reps: 8 }, { weight: 60 + i * 5, reps: 8 }] }]
            }))
            totals.push(last.body.workout.summary.totalStrivePoints.total)
        }

        expect(totals.reduce((a, b) => a + b, 0)).toBeLessThanOrEqual(1500)
        expect(totals[totals.length - 1]).toBe(0)
        expect(last.body.workout.summary.totalStrivePoints.dailyCapReached).toBe(true)
        expect(await pointsOf(credentials.username)).toBeLessThanOrEqual(1500)
    })

    test('personal bests compare with all-time history, even from long ago', async () => {
        const { token, credentials } = await registerUser(app)
        const user = await User.findOne({ username: credentials.username })
        const squat = await Exercise.create({ name: 'Squat', muscleGroup: 'Legs', equipment: ['Barbell'], trackingMode: 'weight_reps' })
        const day = 24 * 3600 * 1000

        // One old bench workout at 100 kg, then lots of newer workouts that don't include bench
        await Workout.create({
            user: user._id, title: 'Old bench', duration: 30, createdAt: new Date(Date.now() - 400 * day),
            exercises: [{ exercise: bench._id, selectedEquipment: 'Barbell', sets: [{ weight: 100, reps: 5 }] }]
        })
        await Workout.insertMany(Array.from({ length: 40 }, (_, i) => ({
            user: user._id, title: `Squat ${i}`, duration: 30, createdAt: new Date(Date.now() - (i + 2) * day),
            exercises: [{ exercise: squat._id, selectedEquipment: 'Barbell', sets: [{ weight: 80, reps: 5 }] }]
        })))

        const beat = await save(token, workoutBody({
            exercises: [{ exercise: String(bench._id), selectedEquipment: 'Barbell', sets: [{ weight: 105, reps: 5 }, { weight: 105, reps: 5 }, { weight: 105, reps: 5 }] }]
        }))

        expect(beat.status).toBe(201)
        expect(beat.body.workout.summary.personalBests).toHaveLength(1)
        expect(beat.body.workout.summary.personalBests[0]).toMatchObject({ previousValue: 100, newValue: 105 })
        expect(beat.body.workout.summary.firstLifts).toHaveLength(0)
    })
})
