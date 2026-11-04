// integration.js
// Starts a real (in-memory) MongoDB and the real Express app for integration tests.

process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = process.env.JWT_SECRET || 'integration-test-secret-integration-test-secret'
process.env.FRONTEND_URL = 'http://localhost:3000'

const mongoose = require('mongoose')
const request = require('supertest')
const { MongoMemoryServer } = require('mongodb-memory-server')

let mongod

const startDatabase = async () => {
    mongod = await MongoMemoryServer.create()
    await mongoose.connect(mongod.getUri('strive_integration'))

    // Build indexes now so unique constraints behave as in production
    await Promise.all(Object.values(mongoose.models).map(model => model.init()))
}

const stopDatabase = async () => {
    await mongoose.disconnect()
    await mongod?.stop()
}

const clearDatabase = async () => {
    await Promise.all(Object.values(mongoose.connection.collections).map(c => c.deleteMany({})))
}

const buildApp = () => {
    const { createApp } = require('../app.js')
    return createApp()
}

// Registers a user and returns { token, user }
const registerUser = async (app, overrides = {}) => {
    const n = Math.random().toString(36).slice(2, 8)
    const body = {
        username: `user_${n}`,
        email: `user_${n}@example.com`,
        password: 'Passw0rd!long',
        acceptedTerms: true,
        ...overrides
    }
    const res = await request(app).post('/api/users').send(body)
    if (res.status !== 201) throw new Error(`register failed: ${res.status} ${res.body.message}`)
    return { token: res.body.token, user: res.body, credentials: body }
}

const auth = (token) => ({ Authorization: `Bearer ${token}` })

module.exports = { startDatabase, stopDatabase, clearDatabase, buildApp, registerUser, auth, request }
