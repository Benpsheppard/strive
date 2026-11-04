const jwt = require('jsonwebtoken')
const { startDatabase, stopDatabase, clearDatabase, buildApp, registerUser, auth, request } = require('../../test-support/integration')
const mailer = require('../../utils/mailer')
const loginThrottle = require('../../utils/loginThrottle')
const User = require('../../models/userModel')
const Workout = require('../../models/workoutModel')
const Quest = require('../../models/questModel')
const LeaderboardEntry = require('../../models/leaderboardEntryModel')
const Exercise = require('../../models/exerciseModel')

jest.setTimeout(120000)

let app
let sendMail

// Pulls the single-use token out of the most recent email
const lastToken = () => {
    const calls = sendMail.mock.calls
    const text = calls[calls.length - 1][0].text
    return text.match(/token=([a-f0-9]{64})/)[1]
}

beforeAll(async () => {
    await startDatabase()
    app = buildApp()
})

afterAll(stopDatabase)

beforeEach(async () => {
    await clearDatabase()
    loginThrottle.reset()
    sendMail = jest.spyOn(mailer, 'sendMail').mockResolvedValue({ sent: false })
})

afterEach(() => jest.restoreAllMocks())

describe('registration', () => {
    const body = { username: 'ben', email: 'ben@example.com', password: 'Passw0rd!long' }

    test('members must accept the terms', async () => {
        const res = await request(app).post('/api/users').send(body)
        expect(res.status).toBe(400)
        expect(res.body.message).toMatch(/accept the terms/)
        expect(await User.countDocuments()).toBe(0)
    })

    test('accepting the terms records consent and sends a verification email', async () => {
        const res = await request(app).post('/api/users').send({ ...body, acceptedTerms: true })

        expect(res.status).toBe(201)
        expect(res.body.emailVerified).toBe(false)
        expect(res.body.password).toBeUndefined()

        const user = await User.findOne({ username: 'ben' })
        expect(user.acceptedTermsAt).toBeInstanceOf(Date)
        expect(user.termsVersion).toBeTruthy()
        expect(sendMail).toHaveBeenCalledTimes(1)
        expect(sendMail.mock.calls[0][0].to).toBe('ben@example.com')
    })

    test('guests need no consent and get no email', async () => {
        const res = await request(app).post('/api/users').send({ ...body, isGuest: true })
        expect(res.status).toBe(201)
        expect(sendMail).not.toHaveBeenCalled()
    })

    test('two sign-ups at the same moment: one wins, the other gets a clean 400', async () => {
        const send = () => request(app).post('/api/users').send({ ...body, acceptedTerms: true })
        const results = await Promise.all([send(), send(), send()])
        const statuses = results.map(r => r.status).sort()

        expect(statuses.filter(s => s === 201)).toHaveLength(1)
        expect(statuses.filter(s => s === 500)).toHaveLength(0)
        expect(await User.countDocuments()).toBe(1)
    })

    test('a failing email provider does not block sign-up', async () => {
        sendMail.mockRejectedValue(new Error('provider down'))
        jest.spyOn(console, 'error').mockImplementation(() => {})

        const res = await request(app).post('/api/users').send({ ...body, acceptedTerms: true })
        expect(res.status).toBe(201)
    })
})

describe('email verification', () => {
    test('the emailed link confirms the address, once', async () => {
        const { token } = await registerUser(app)
        const verifyToken = lastToken()

        const res = await request(app).post('/api/users/verify-email').send({ token: verifyToken })
        expect(res.status).toBe(200)

        const me = await request(app).get('/api/users/me').set(auth(token))
        expect(me.body.emailVerified).toBe(true)

        const again = await request(app).post('/api/users/verify-email').send({ token: verifyToken })
        expect(again.status).toBe(400)
    })

    test('an expired or made-up token is rejected', async () => {
        const { user } = await registerUser(app)
        const verifyToken = lastToken()

        await User.updateOne({ username: user.username }, { emailVerifyExpires: new Date(Date.now() - 1000) })

        expect((await request(app).post('/api/users/verify-email').send({ token: verifyToken })).status).toBe(400)
        expect((await request(app).post('/api/users/verify-email').send({ token: 'a'.repeat(64) })).status).toBe(400)
        expect((await request(app).post('/api/users/verify-email').send({})).status).toBe(400)
    })

    test('tokens are stored hashed, never in plain text', async () => {
        const { user } = await registerUser(app)
        const verifyToken = lastToken()

        const stored = await User.findOne({ username: user.username }).select('+emailVerifyTokenHash')
        expect(stored.emailVerifyTokenHash).toBeTruthy()
        expect(stored.emailVerifyTokenHash).not.toBe(verifyToken)
    })

    test('the email can be sent again, but not once confirmed', async () => {
        const { token } = await registerUser(app)
        sendMail.mockClear()

        const resend = await request(app).post('/api/users/resend-verification').set(auth(token))
        expect(resend.status).toBe(200)
        expect(sendMail).toHaveBeenCalledTimes(1)

        await request(app).post('/api/users/verify-email').send({ token: lastToken() })
        sendMail.mockClear()

        const after = await request(app).post('/api/users/resend-verification').set(auth(token))
        expect(after.body.message).toMatch(/already confirmed/)
        expect(sendMail).not.toHaveBeenCalled()
    })
})

describe('password reset', () => {
    test('always answers the same way, and only emails real members', async () => {
        const { user } = await registerUser(app)
        sendMail.mockClear()

        const unknown = await request(app).post('/api/users/forgot-password').send({ email: 'nobody@example.com' })
        const known = await request(app).post('/api/users/forgot-password').send({ email: user.email })

        expect(unknown.status).toBe(200)
        expect(known.status).toBe(200)
        expect(known.body.message).toBe(unknown.body.message)
        expect(sendMail).toHaveBeenCalledTimes(1)
    })

    test('does not email guests', async () => {
        await request(app).post('/api/users').send({ username: 'g1', email: 'g1@strive.com', password: 'Passw0rd!long', isGuest: true })
        sendMail.mockClear()

        await request(app).post('/api/users/forgot-password').send({ email: 'g1@strive.com' })
        expect(sendMail).not.toHaveBeenCalled()
    })

    test('a failing email provider still gives the same answer', async () => {
        const { user } = await registerUser(app)
        sendMail.mockRejectedValue(new Error('provider down'))
        jest.spyOn(console, 'error').mockImplementation(() => {})

        const res = await request(app).post('/api/users/forgot-password').send({ email: user.email })
        expect(res.status).toBe(200)
    })

    test('the link sets a new password, works once and signs out other sessions', async () => {
        const { token: oldSession, credentials } = await registerUser(app)
        await request(app).post('/api/users/forgot-password').send({ email: credentials.email })
        const resetToken = lastToken()

        const reset = await request(app).post('/api/users/reset-password').send({ token: resetToken, password: 'Brand-New1!pass' })
        expect(reset.status).toBe(200)

        // The old session is dead
        const me = await request(app).get('/api/users/me').set(auth(oldSession))
        expect(me.status).toBe(401)
        expect(me.body.message).toMatch(/Session expired/)

        // Old password fails, new one works
        expect((await request(app).post('/api/users/login').send({ email: credentials.email, password: credentials.password })).status).toBe(400)
        expect((await request(app).post('/api/users/login').send({ email: credentials.email, password: 'Brand-New1!pass' })).status).toBe(200)

        // The link cannot be reused
        const again = await request(app).post('/api/users/reset-password').send({ token: resetToken, password: 'Another-1!pass' })
        expect(again.status).toBe(400)
    })

    test('resetting by email also confirms the address', async () => {
        const { credentials } = await registerUser(app)
        await request(app).post('/api/users/forgot-password').send({ email: credentials.email })
        await request(app).post('/api/users/reset-password').send({ token: lastToken(), password: 'Brand-New1!pass' })

        const user = await User.findOne({ email: credentials.email })
        expect(user.emailVerified).toBe(true)
    })

    test('rejects weak passwords and expired links', async () => {
        const { credentials } = await registerUser(app)
        await request(app).post('/api/users/forgot-password').send({ email: credentials.email })
        const resetToken = lastToken()

        const weak = await request(app).post('/api/users/reset-password').send({ token: resetToken, password: 'weak' })
        expect(weak.status).toBe(400)

        await User.updateOne({ email: credentials.email }, { passwordResetExpires: new Date(Date.now() - 1000) })
        const expired = await request(app).post('/api/users/reset-password').send({ token: resetToken, password: 'Brand-New1!pass' })
        expect(expired.status).toBe(400)
    })

    test('rejects malformed input', async () => {
        expect((await request(app).post('/api/users/forgot-password').send({})).status).toBe(400)
        expect((await request(app).post('/api/users/forgot-password').send({ email: { $ne: null } })).status).toBe(400)
        expect((await request(app).post('/api/users/reset-password').send({ token: { $ne: null }, password: 'Brand-New1!pass' })).status).toBe(400)
    })
})

describe('changing password and email', () => {
    test('change password needs the current password and keeps this session alive', async () => {
        const { token, credentials } = await registerUser(app)

        const wrong = await request(app).put('/api/users/password').set(auth(token)).send({ currentPassword: 'nope', newPassword: 'Brand-New1!pass' })
        expect(wrong.status).toBe(400)

        const same = await request(app).put('/api/users/password').set(auth(token)).send({ currentPassword: credentials.password, newPassword: credentials.password })
        expect(same.status).toBe(400)

        const ok = await request(app).put('/api/users/password').set(auth(token)).send({ currentPassword: credentials.password, newPassword: 'Brand-New1!pass' })
        expect(ok.status).toBe(200)
        expect(ok.body.token).toBeTruthy()

        // Old token dead, new token alive
        expect((await request(app).get('/api/users/me').set(auth(token))).status).toBe(401)
        expect((await request(app).get('/api/users/me').set(auth(ok.body.token))).status).toBe(200)
    })

    test('change email needs the password, resets verification and blocks duplicates', async () => {
        const { token, credentials } = await registerUser(app)
        const other = await registerUser(app)
        await request(app).post('/api/users/verify-email').send({ token: lastToken() })
        sendMail.mockClear()

        const noPassword = await request(app).put('/api/users/email').set(auth(token)).send({ password: 'wrong', newEmail: 'new@example.com' })
        expect(noPassword.status).toBe(400)

        const taken = await request(app).put('/api/users/email').set(auth(token)).send({ password: credentials.password, newEmail: other.credentials.email })
        expect(taken.status).toBe(400)

        const ok = await request(app).put('/api/users/email').set(auth(token)).send({ password: credentials.password, newEmail: 'new@example.com' })
        expect(ok.status).toBe(200)
        expect(ok.body.email).toBe('new@example.com')
        expect(ok.body.emailVerified).toBe(false)
        expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({ to: 'new@example.com' }))
    })
})

describe('sessions and sign-in protection', () => {
    test('a token signed with the "none" algorithm is refused', async () => {
        const { user } = await registerUser(app)
        const forged = [
            Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url'),
            Buffer.from(JSON.stringify({ id: user._id, v: 0 })).toString('base64url'),
            ''
        ].join('.')

        const res = await request(app).get('/api/users/me').set(auth(forged))
        expect(res.status).toBe(401)
    })

    test('a token signed with the wrong secret is refused', async () => {
        const { user } = await registerUser(app)
        const forged = jwt.sign({ id: user._id, v: 0 }, 'a-different-secret')

        expect((await request(app).get('/api/users/me').set(auth(forged))).status).toBe(401)
    })

    test('getMe does not hand the token back', async () => {
        const { token } = await registerUser(app)
        const me = await request(app).get('/api/users/me').set(auth(token))
        expect(me.body.token).toBeUndefined()
    })

    test('repeated wrong passwords lock the account for a while', async () => {
        const { credentials } = await registerUser(app)

        for (let i = 0; i < loginThrottle.MAX_FAILURES; i++) {
            const res = await request(app).post('/api/users/login').send({ username: credentials.username, password: 'wrong-password' })
            expect(res.status).toBe(400)
        }

        // Even the right password is refused while locked
        const locked = await request(app).post('/api/users/login').send({ username: credentials.username, password: credentials.password })
        expect(locked.status).toBe(429)
    })

    test('login by username is case-insensitive and signing in clears the failure count', async () => {
        const { credentials } = await registerUser(app, { username: 'MixedCase' })

        await request(app).post('/api/users/login').send({ username: 'mixedcase', password: 'wrong' })
        const ok = await request(app).post('/api/users/login').send({ username: 'MIXEDCASE', password: credentials.password })
        expect(ok.status).toBe(200)
    })
})

describe('data export and account deletion', () => {
    const seedData = async (user) => {
        const exercise = await Exercise.create({ name: 'Bench Press', muscleGroup: 'Chest', subMuscleGroup: 'Mid chest', equipment: ['Barbell'], trackingMode: 'weight_reps' })
        const custom = await Exercise.create({ name: 'Zercher Squat', muscleGroup: 'Legs', equipment: ['Barbell'], trackingMode: 'weight_reps', isCustom: true, createdBy: user._id })
        await Workout.create({ user: user._id, title: 'Push', duration: 40, exercises: [{ exercise: exercise._id, selectedEquipment: 'Barbell', sets: [{ weight: 60, reps: 8 }] }] })
        await Quest.create({ user: user._id, title: 'Quest', questType: 'consistency', duration: 'daily', description: 'x', expiry: new Date(Date.now() + 1e8), reward: 100, completion: { targetCount: 1, currentCount: 0 } })
        await LeaderboardEntry.create({ user: user._id, weekStart: new Date(), totalSP: 100, workoutCount: 1 })
        return { exercise, custom }
    }

    test('export contains the user\'s data and no secrets or other people\'s data', async () => {
        const mine = await registerUser(app)
        const theirs = await registerUser(app)
        const mineDoc = await User.findOne({ username: mine.credentials.username })
        const theirDoc = await User.findOne({ username: theirs.credentials.username })
        await seedData(mineDoc)
        await Workout.create({ user: theirDoc._id, title: 'Their private workout', duration: 10, exercises: [] })

        const res = await request(app).get('/api/users/export').set(auth(mine.token))

        expect(res.status).toBe(200)
        expect(res.headers['content-disposition']).toMatch(/attachment/)
        expect(res.body.profile.username).toBe(mine.credentials.username)
        expect(res.body.workouts).toHaveLength(1)
        expect(res.body.workouts[0].exercises[0].exercise.name).toBe('Bench Press')
        expect(res.body.quests).toHaveLength(1)
        expect(res.body.leaderboardEntries).toHaveLength(1)
        expect(res.body.customExercises.map(e => e.name)).toEqual(['Zercher Squat'])

        const text = JSON.stringify(res.body)
        expect(text).not.toMatch(/Their private workout/)
        expect(text).not.toMatch(/\$2[aby]\$/)               // no bcrypt hash anywhere
        expect(res.body.profile.password).toBeUndefined()
    })

    test('export needs a session', async () => {
        expect((await request(app).get('/api/users/export')).status).toBe(401)
    })

    test('deleting needs the right password and leaves everything alone otherwise', async () => {
        const { token, user, credentials } = await registerUser(app)
        const doc = await User.findOne({ username: credentials.username })
        await seedData(doc)

        const noPassword = await request(app).delete(`/api/users/${user._id}`).set(auth(token))
        const wrong = await request(app).delete(`/api/users/${user._id}`).set(auth(token)).send({ password: 'nope' })

        expect(noPassword.status).toBe(400)
        expect(wrong.status).toBe(400)
        expect(await User.countDocuments({ _id: doc._id })).toBe(1)
        expect(await Workout.countDocuments({ user: doc._id })).toBe(1)
    })

    test('deleting removes the account and everything attached, and nobody else\'s data', async () => {
        const mine = await registerUser(app)
        const theirs = await registerUser(app)
        const mineDoc = await User.findOne({ username: mine.credentials.username })
        const theirDoc = await User.findOne({ username: theirs.credentials.username })
        await seedData(mineDoc)
        await Workout.create({ user: theirDoc._id, title: 'Keep me', duration: 10, exercises: [] })

        const res = await request(app).delete(`/api/users/${mine.user._id}`).set(auth(mine.token)).send({ password: mine.credentials.password })

        expect(res.status).toBe(200)
        expect(await User.countDocuments({ _id: mineDoc._id })).toBe(0)
        expect(await Workout.countDocuments({ user: mineDoc._id })).toBe(0)
        expect(await Quest.countDocuments({ user: mineDoc._id })).toBe(0)
        expect(await LeaderboardEntry.countDocuments({ user: mineDoc._id })).toBe(0)
        expect(await Exercise.countDocuments({ createdBy: mineDoc._id })).toBe(0)

        // The library and other users are untouched
        expect(await Exercise.countDocuments({ name: 'Bench Press' })).toBe(1)
        expect(await Workout.countDocuments({ user: theirDoc._id })).toBe(1)
        expect(await User.countDocuments({ _id: theirDoc._id })).toBe(1)
    })

    test('nobody can delete someone else\'s account', async () => {
        const mine = await registerUser(app)
        const theirs = await registerUser(app)

        const res = await request(app).delete(`/api/users/${theirs.user._id}`).set(auth(mine.token)).send({ password: mine.credentials.password })
        expect(res.status).toBe(403)
        expect(await User.countDocuments()).toBe(2)
    })

    test('guests can delete without a password', async () => {
        const res = await request(app).post('/api/users').send({ username: 'guest1', email: 'guest1@strive.com', password: 'Passw0rd!long', isGuest: true })
        const del = await request(app).delete(`/api/users/${res.body._id}`).set(auth(res.body.token))
        expect(del.status).toBe(200)
        expect(await User.countDocuments()).toBe(0)
    })
})
