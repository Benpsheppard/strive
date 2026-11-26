const express = require('express')
const request = require('supertest')
const { createIntegrationLimiter, createIntegrationFailureLimiter } = require('../middleware/integrationRateLimit.js')

// Small app: limiter, then a fake key check, then an OK route
const buildApp = (limiter) => {
    const app = express()
    app.use(limiter)
    app.get('/test', (req, res) => {
        if (req.headers['x-integration-key'] !== 'good') return res.status(401).json({ message: 'Not Authorised' })
        res.json({ ok: true })
    })
    return app
}

describe('createIntegrationLimiter', () => {
    it('returns 429 with rate limit headers once the limit is passed', async () => {
        const app = buildApp(createIntegrationLimiter({ limit: 2 }))
        await request(app).get('/test').set('x-integration-key', 'good').expect(200)
        await request(app).get('/test').set('x-integration-key', 'good').expect(200)
        const res = await request(app).get('/test').set('x-integration-key', 'good')
        expect(res.status).toBe(429)
        expect(res.body.message).toBe('Too many requests, please try again later')
        expect(res.headers).toHaveProperty('ratelimit-limit')
        expect(res.headers).toHaveProperty('retry-after')
    })

    it('has the planned defaults', async () => {
        const res = await request(buildApp(createIntegrationLimiter())).get('/test').set('x-integration-key', 'good')
        expect(res.headers['ratelimit-policy']).toContain('30')
    })
})

describe('createIntegrationFailureLimiter', () => {
    it('counts wrong-key requests and blocks after the limit', async () => {
        const app = buildApp(createIntegrationFailureLimiter({ limit: 2 }))
        await request(app).get('/test').set('x-integration-key', 'bad').expect(401)
        await request(app).get('/test').set('x-integration-key', 'bad').expect(401)
        await request(app).get('/test').set('x-integration-key', 'bad').expect(429)
    })

    it('does not count successful requests', async () => {
        const app = buildApp(createIntegrationFailureLimiter({ limit: 2 }))
        for (let i = 0; i < 5; i++) {
            await request(app).get('/test').set('x-integration-key', 'good').expect(200)
        }
    })
})
