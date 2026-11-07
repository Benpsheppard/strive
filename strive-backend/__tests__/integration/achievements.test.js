const { startDatabase, stopDatabase, clearDatabase, buildApp, registerUser, auth, request } = require('../../test-support/integration')
const User = require('../../models/userModel')
const Workout = require('../../models/workoutModel')
const Exercise = require('../../models/exerciseModel')
const mailer = require('../../utils/mailer')
const { ACHIEVEMENTS } = require('../../utils/achievements/definitions')

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
const idsOf = (badges) => badges.map(b => b.id)

describe('earning achievements from a workout', () => {
    test('the first workout unlocks the first milestone', async () => {
        const { token } = await registerUser(app)

        const res = await save(token, workoutBody())

        expect(res.status).toBe(201)
        expect(idsOf(res.body.gamification.newBadges)).toContain('workouts_1')
        expect(res.body.user.achievementCount).toBeGreaterThan(0)
    })

    test('an achievement is only awarded once', async () => {
        const { token } = await registerUser(app)

        await save(token, workoutBody())
        const second = await save(token, workoutBody())

        expect(idsOf(second.body.gamification.newBadges)).not.toContain('workouts_1')

        const user = await User.findOne()
        const ids = user.achievements.map(a => a.id)
        expect(new Set(ids).size).toBe(ids.length)
    })

    test('a repeated save (same clientId) does not award again', async () => {
        const { token } = await registerUser(app)
        const body = workoutBody({ clientId: 'client-badge-12345' })

        const first = await save(token, body)
        const before = (await User.findOne()).achievements.length
        const second = await save(token, body)

        expect(first.status).toBe(201)
        expect(second.status).toBe(200)
        expect((await User.findOne()).achievements.length).toBe(before)
    })

    test('time-of-day achievements use the timezone offset the app sends', async () => {
        const { token } = await registerUser(app)
        jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate', 'setTimeout', 'setInterval', 'queueMicrotask'] })
        jest.setSystemTime(new Date('2026-03-10T23:30:00Z'))

        // 23:30 UTC at UTC+2 (offset -120) is 01:30 local: Early Bird, not Night Owl
        const res = await save(token, workoutBody({ tzOffset: -120 }))
        jest.useRealTimers()

        const ids = idsOf(res.body.gamification.newBadges)
        expect(ids).toContain('early_bird')
        expect(ids).not.toContain('night_owl')
    })

    test('rejects a nonsense timezone offset', async () => {
        const { token } = await registerUser(app)

        const res = await save(token, workoutBody({ tzOffset: 99999 }))

        expect(res.status).toBe(400)
        expect(await Workout.countDocuments()).toBe(0)
    })
})

describe('GET /api/achievements', () => {
    test('requires auth', async () => {
        const res = await request(app).get('/api/achievements')
        expect(res.status).toBe(401)
    })

    test('omits locked secrets entirely', async () => {
        const { token } = await registerUser(app)

        const res = await request(app).get('/api/achievements').set(auth(token))

        expect(res.status).toBe(200)
        expect(res.body.total).toBe(res.body.achievements.length)

        expect(res.body.achievements.some(a => a.secret)).toBe(false)
        // The secret count stays hidden until they are all found
        expect(res.body.secrets).toEqual({ unlocked: 0, total: null })
    })

    test('reveals the secret total once every secret is unlocked', async () => {
        const { token } = await registerUser(app)
        const secrets = ACHIEVEMENTS.filter(a => a.secret)
        await User.updateOne({}, { $set: { achievements: secrets.map(a => ({ id: a.id, unlockedAt: new Date() })) } })

        const res = await request(app).get('/api/achievements').set(auth(token))

        expect(res.body.secrets).toEqual({ unlocked: secrets.length, total: secrets.length })
    })

    test('catches up muscle-focus achievements and only counts mostly-on-group workouts', async () => {
        const { token } = await registerUser(app)
        const user = await User.findOne()
        const squat = await Exercise.create({ name: 'Squat', muscleGroup: 'Legs', subMuscleGroup: 'Quads', equipment: ['Barbell'], trackingMode: 'weight_reps' })
        const entry = (ex) => ({ exercise: ex._id, selectedEquipment: 'Barbell', sets: [{ weight: 50, reps: 5 }] })

        // 10 chest-focused workouts (2 of 3 exercises are chest) and 9 that are only half legs
        for (let i = 0; i < 10; i++) {
            await Workout.create({ user: user._id, title: 'Push', duration: 20, exercises: [entry(bench), entry(bench), entry(squat)] })
        }
        for (let i = 0; i < 9; i++) {
            await Workout.create({ user: user._id, title: 'Mixed', duration: 20, exercises: [entry(squat), entry(bench)] })
        }

        const res = await request(app).get('/api/achievements').set(auth(token))
        const byId = Object.fromEntries(res.body.achievements.map(a => [a.id, a]))

        expect(byId.focus_chest.unlockedAt).not.toBeNull()
        expect(byId.focus_legs.unlockedAt).toBeNull()
    })

    test('catches up equipment explorer from distinct equipment used in history', async () => {
        const { token } = await registerUser(app)
        const user = await User.findOne()
        const entry = (equipment) => ({ exercise: bench._id, selectedEquipment: equipment, sets: [{ weight: 50, reps: 5 }] })

        await Workout.create({ user: user._id, title: 'A', duration: 20, exercises: [entry('Barbell'), entry('Dumbbell'), entry('Cable')] })
        await Workout.create({ user: user._id, title: 'B', duration: 20, exercises: [entry('Barbell'), entry('Machine')] })

        let res = await request(app).get('/api/achievements').set(auth(token))
        expect(res.body.achievements.find(a => a.id === 'equipment_5').unlockedAt).toBeNull()

        await Workout.create({ user: user._id, title: 'C', duration: 20, exercises: [entry('Kettlebell'), entry('Other')] })

        res = await request(app).get('/api/achievements').set(auth(token))
        expect(res.body.achievements.find(a => a.id === 'equipment_5').unlockedAt).not.toBeNull()
    })

    test('shows everything unlocked for dev accounts without storing it', async () => {
        const { token } = await registerUser(app)
        const user = await User.findOne()
        process.env.DEV_ACCOUNT_EMAILS = `other@example.com, ${user.email.toUpperCase()}`

        try {
            const res = await request(app).get('/api/achievements').set(auth(token))

            expect(res.body.achievements).toHaveLength(ACHIEVEMENTS.length)
            expect(res.body.achievements.every(a => a.unlockedAt)).toBe(true)
            expect(res.body.secrets.total).toBe(ACHIEVEMENTS.filter(a => a.secret).length)
            expect((await User.findOne()).achievements.length).toBeLessThan(ACHIEVEMENTS.length)
        } finally {
            delete process.env.DEV_ACCOUNT_EMAILS
        }
    })

    test('awards Completionist when the last other achievement is unlocked', async () => {
        const { token } = await registerUser(app)
        const others = ACHIEVEMENTS.filter(a => !a.completion && a.id !== 'logo_tapper')
        await User.updateOne({}, { $set: { achievements: others.map(a => ({ id: a.id, unlockedAt: new Date() })) } })

        const res = await request(app).post('/api/achievements/event').set(auth(token)).send({ event: 'logo_tap_10' })

        expect(res.body.unlocked.id).toBe('logo_tapper')
        const ids = (await User.findOne()).achievements.map(a => a.id)
        expect(ids).toContain('completionist')
    })

    test('catches up milestones for existing history', async () => {
        const { token } = await registerUser(app)
        const user = await User.findOne()
        // A workout saved before achievements existed
        await Workout.create({ user: user._id, title: 'Old', duration: 20, exercises: [], summary: { totalWeight: 500 } })

        const res = await request(app).get('/api/achievements').set(auth(token))

        const first = res.body.achievements.find(a => a.id === 'workouts_1')
        expect(first.unlockedAt).not.toBeNull()
    })
})

describe('POST /api/achievements/event', () => {
    test('unlocks a secret once and is safe to repeat', async () => {
        const { token } = await registerUser(app)

        const first = await request(app).post('/api/achievements/event').set(auth(token)).send({ event: 'logo_tap_10' })
        const second = await request(app).post('/api/achievements/event').set(auth(token)).send({ event: 'logo_tap_10' })

        expect(first.status).toBe(200)
        expect(first.body.unlocked.id).toBe('logo_tapper')
        expect(first.body.unlocked.name).toBe('Curious Cat')
        expect(second.status).toBe(200)
        expect(second.body.unlocked).toBeNull()
        expect((await User.findOne()).achievements.filter(a => a.id === 'logo_tapper')).toHaveLength(1)
    })

    test('rejects events that are not on the whitelist', async () => {
        const { token } = await registerUser(app)

        const res = await request(app).post('/api/achievements/event').set(auth(token)).send({ event: 'workouts_250' })

        expect(res.status).toBe(400)
        expect((await User.findOne()).achievements).toHaveLength(0)
    })

    test('a workout-based achievement cannot be claimed through an event', async () => {
        const { token } = await registerUser(app)

        const res = await request(app).post('/api/achievements/event').set(auth(token)).send({ event: 'hat_trick' })

        expect(res.status).toBe(400)
    })
})
