const { startDatabase, stopDatabase, buildApp, request } = require('../../test-support/integration')
const mongoose = require('mongoose')

jest.setTimeout(120000)

let app

beforeAll(async () => {
    await startDatabase()
    app = buildApp()
})

afterAll(stopDatabase)

describe('health and routing', () => {
    test('/health says the process is up', async () => {
        const res = await request(app).get('/health')
        expect(res.status).toBe(200)
        expect(res.body.status).toBe('ok')
    })

    test('/ready is ok while the database is connected', async () => {
        const res = await request(app).get('/ready')
        expect(res.status).toBe(200)
        expect(res.body.status).toBe('ready')
    })

    test('unknown API routes return JSON 404', async () => {
        const res = await request(app).get('/api/does-not-exist')
        expect(res.status).toBe(404)
        expect(res.headers['content-type']).toMatch(/json/)
        expect(res.body.message).toBe('Not found')
    })

    test('malformed JSON is a 400, not a server error', async () => {
        const res = await request(app).post('/api/users/login').set('Content-Type', 'application/json').send('{"broken":')
        expect(res.status).toBe(400)
    })

    test('oversized request bodies are rejected', async () => {
        const res = await request(app).post('/api/users/login').send({ identifier: 'x'.repeat(200 * 1024), password: 'y' })
        expect(res.status).toBe(413)
    })

    test('/ready reports 503 when the database is gone', async () => {
        await mongoose.disconnect()
        const res = await request(app).get('/ready')
        expect(res.status).toBe(503)
    })
})
