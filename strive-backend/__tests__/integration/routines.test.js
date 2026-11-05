const { startDatabase, stopDatabase, clearDatabase, buildApp, registerUser, auth, request } = require('../../test-support/integration')
const User = require('../../models/userModel')
const Routine = require('../../models/routineModel')
const Exercise = require('../../models/exerciseModel')
const mailer = require('../../utils/mailer')
const { MAX_ROUTINES, MAX_ROUTINES_GUEST, MAX_EXERCISES } = require('../../controllers/routineController')

jest.setTimeout(120000)

let app
let bench
let squat

beforeAll(async () => {
    await startDatabase()
    app = buildApp()
})

afterAll(stopDatabase)

beforeEach(async () => {
    await clearDatabase()
    jest.spyOn(mailer, 'sendMail').mockResolvedValue({ sent: false })
    bench = await Exercise.create({ name: 'Bench Press', muscleGroup: 'Chest', subMuscleGroup: 'Mid chest', equipment: ['Barbell', 'Dumbbell'], trackingMode: 'weight_reps' })
    squat = await Exercise.create({ name: 'Squat', muscleGroup: 'Legs', subMuscleGroup: 'Quads', equipment: ['Barbell'], trackingMode: 'weight_reps' })
})

afterEach(() => jest.restoreAllMocks())

const body = (overrides = {}) => ({
    name: 'Push day',
    exercises: [{ exercise: String(bench._id), selectedEquipment: 'Barbell' }, { exercise: String(squat._id) }],
    ...overrides
})

const create = (token, payload) => request(app).post('/api/routines').set(auth(token)).send(payload)

describe('creating routines', () => {
    test('saves a routine, keeping the exercise order and populating the exercises', async () => {
        const { token } = await registerUser(app)

        const res = await create(token, body())

        expect(res.status).toBe(201)
        expect(res.body.name).toBe('Push day')
        expect(res.body.exercises.map(e => e.exercise.name)).toEqual(['Bench Press', 'Squat'])
        expect(res.body.exercises[0].selectedEquipment).toBe('Barbell')
        expect(res.body.exercises[1].selectedEquipment).toBeUndefined()
        expect(res.body.exercises[0].exercise.equipment).toEqual(['Barbell', 'Dumbbell'])
    })

    test('stores no sets, weights or reps', async () => {
        const { token } = await registerUser(app)
        const payload = body({ exercises: [{ exercise: String(bench._id), sets: [{ weight: 100, reps: 5 }], weight: 100 }] })

        const res = await create(token, payload)

        expect(res.status).toBe(201)
        const stored = await Routine.findById(res.body._id).lean()
        expect(Object.keys(stored.exercises[0]).sort()).toEqual(['_id', 'exercise'])
    })

    // Each case is a function so it can use the exercises created in beforeEach
    test.each([
        ['no name', () => ({ name: '' })],
        ['whitespace name', () => ({ name: '   ' })],
        ['name too long', () => ({ name: 'x'.repeat(61) })],
        ['name not text', () => ({ name: { $ne: null } })],
        ['no exercises', () => ({ exercises: [] })],
        ['exercises not a list', () => ({ exercises: 'bench' })],
        ['bad exercise id', () => ({ exercises: [{ exercise: 'nope' }] })],
        ['unknown exercise', () => ({ exercises: [{ exercise: '507f1f77bcf86cd799439011' }] })],
        ['equipment the exercise lacks', () => ({ exercises: [{ exercise: String(squat._id), selectedEquipment: 'Dumbbell' }] })],
        ['non-text equipment', () => ({ exercises: [{ exercise: String(bench._id), selectedEquipment: { $ne: null } }] })],
        ['the same exercise twice', () => ({ exercises: [{ exercise: String(bench._id) }, { exercise: String(bench._id) }] })],
        ['too many exercises', () => ({ exercises: Array.from({ length: MAX_EXERCISES + 1 }, () => ({ exercise: String(bench._id) })) })]
    ])('rejects %s', async (_label, makeOverride) => {
        const { token } = await registerUser(app)

        const res = await create(token, body(makeOverride()))

        expect(res.status).toBe(400)
        expect(await Routine.countDocuments()).toBe(0)
    })

    test('names are unique per member, ignoring capitals, but two members can share one', async () => {
        const a = await registerUser(app)
        const b = await registerUser(app)

        expect((await create(a.token, body())).status).toBe(201)
        expect((await create(a.token, body({ name: 'PUSH DAY' }))).status).toBe(409)
        expect((await create(b.token, body())).status).toBe(201)
    })

    test('needs a session', async () => {
        expect((await request(app).post('/api/routines').send(body())).status).toBe(401)
        expect((await request(app).get('/api/routines')).status).toBe(401)
    })

    test('members are capped, guests have a smaller cap', async () => {
        const member = await registerUser(app)
        const memberDoc = await User.findOne({ username: member.credentials.username })
        await Routine.insertMany(Array.from({ length: MAX_ROUTINES }, (_, i) => ({
            user: memberDoc._id,
            name: `Routine ${i}`,
            exercises: [{ exercise: bench._id }]
        })))
        expect((await create(member.token, body({ name: 'One too many' }))).status).toBe(403)

        const guest = await request(app).post('/api/users').send({ username: 'guesty', email: 'guesty@strive.com', password: 'Passw0rd!long', isGuest: true })
        for (let i = 0; i < MAX_ROUTINES_GUEST; i++) {
            expect((await create(guest.body.token, body({ name: `G${i}` }))).status).toBe(201)
        }
        const blocked = await create(guest.body.token, body({ name: 'G-extra' }))
        expect(blocked.status).toBe(403)
        expect(blocked.body.message).toMatch(/Guest accounts/)
    })

    test("someone else's custom exercise looks like one that doesn't exist", async () => {
        const owner = await registerUser(app)
        const other = await registerUser(app)
        const ownerDoc = await User.findOne({ username: owner.credentials.username })
        const custom = await Exercise.create({ name: 'Secret Lift', muscleGroup: 'Legs', equipment: ['Barbell'], trackingMode: 'weight_reps', isCustom: true, createdBy: ownerDoc._id })
        const payload = body({ exercises: [{ exercise: String(custom._id) }] })

        const stolen = await create(other.token, payload)
        expect(stolen.status).toBe(400)
        expect(stolen.body.message).toBe('One of the exercises was not found')

        expect((await create(owner.token, payload)).status).toBe(201)
    })
})

describe('listing, renaming, changing and deleting', () => {
    test('lists only your own routines, newest change first', async () => {
        const a = await registerUser(app)
        const b = await registerUser(app)

        const first = await create(a.token, body({ name: 'First' }))
        await create(a.token, body({ name: 'Second' }))
        await create(b.token, body({ name: 'Not mine' }))

        // Touching the first one moves it to the top
        await request(app).put(`/api/routines/${first.body._id}`).set(auth(a.token)).send({ name: 'First renamed' })

        const list = await request(app).get('/api/routines').set(auth(a.token))
        expect(list.body.map(r => r.name)).toEqual(['First renamed', 'Second'])
    })

    test('can rename, and replace the exercises (including their order)', async () => {
        const { token } = await registerUser(app)
        const created = await create(token, body())
        const id = created.body._id

        const renamed = await request(app).put(`/api/routines/${id}`).set(auth(token)).send({ name: 'Upper' })
        expect(renamed.status).toBe(200)
        expect(renamed.body.name).toBe('Upper')
        expect(renamed.body.exercises).toHaveLength(2)

        const reordered = await request(app).put(`/api/routines/${id}`).set(auth(token)).send({
            exercises: [{ exercise: String(squat._id), selectedEquipment: 'Barbell' }, { exercise: String(bench._id) }]
        })
        expect(reordered.body.exercises.map(e => e.exercise.name)).toEqual(['Squat', 'Bench Press'])
        expect(reordered.body.name).toBe('Upper')
    })

    test('update validates like create, and refuses an empty change or a name already used', async () => {
        const { token } = await registerUser(app)
        await create(token, body({ name: 'Taken' }))
        const mine = await create(token, body({ name: 'Mine' }))
        const url = `/api/routines/${mine.body._id}`

        expect((await request(app).put(url).set(auth(token)).send({})).status).toBe(400)
        expect((await request(app).put(url).set(auth(token)).send({ name: '' })).status).toBe(400)
        expect((await request(app).put(url).set(auth(token)).send({ exercises: [] })).status).toBe(400)
        expect((await request(app).put(url).set(auth(token)).send({ name: 'taken' })).status).toBe(409)
        // Saving the same name again is fine
        expect((await request(app).put(url).set(auth(token)).send({ name: 'Mine' })).status).toBe(200)
    })

    test("other members' routines can't be seen, changed or deleted (404, not 403)", async () => {
        const owner = await registerUser(app)
        const other = await registerUser(app)
        const created = await create(owner.token, body())
        const url = `/api/routines/${created.body._id}`

        expect((await request(app).put(url).set(auth(other.token)).send({ name: 'Hacked' })).status).toBe(404)
        expect((await request(app).delete(url).set(auth(other.token))).status).toBe(404)

        const stillThere = await Routine.findById(created.body._id)
        expect(stillThere.name).toBe('Push day')
        expect((await request(app).get('/api/routines').set(auth(other.token))).body).toEqual([])
    })

    test('deleting removes it, and a bad id is a 400', async () => {
        const { token } = await registerUser(app)
        const created = await create(token, body())

        expect((await request(app).delete(`/api/routines/${created.body._id}`).set(auth(token))).status).toBe(200)
        expect(await Routine.countDocuments()).toBe(0)
        expect((await request(app).delete(`/api/routines/${created.body._id}`).set(auth(token))).status).toBe(404)
        expect((await request(app).delete('/api/routines/not-an-id').set(auth(token))).status).toBe(400)
    })

    test('a routine survives its exercise being removed from the library without breaking the list', async () => {
        const { token } = await registerUser(app)
        await create(token, body())
        await Exercise.deleteOne({ _id: squat._id })

        const list = await request(app).get('/api/routines').set(auth(token))
        expect(list.status).toBe(200)
        expect(list.body).toHaveLength(1)
    })
})

describe('routines and the account', () => {
    test('are included in the data export, and deleted with the account', async () => {
        const { token, user, credentials } = await registerUser(app)
        const other = await registerUser(app)
        await create(token, body())
        await create(other.token, body({ name: 'Theirs' }))

        const exported = await request(app).get('/api/users/export').set(auth(token))
        expect(exported.body.routines.map(r => r.name)).toEqual(['Push day'])
        expect(JSON.stringify(exported.body)).not.toMatch(/Theirs/)

        const deleted = await request(app).delete(`/api/users/${user._id}`).set(auth(token)).send({ password: credentials.password })
        expect(deleted.status).toBe(200)

        const left = await Routine.find().lean()
        expect(left.map(r => r.name)).toEqual(['Theirs'])
    })

    test('resetting workout data keeps routines', async () => {
        const { token, user } = await registerUser(app)
        await create(token, body())

        const reset = await request(app).delete(`/api/users/${user._id}/reset`).set(auth(token))

        expect(reset.status).toBe(200)
        expect(await Routine.countDocuments()).toBe(1)
    })
})
