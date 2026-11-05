// app.js
// Builds the Express app. server.js starts it; tests import it directly.

const express = require('express')
const rateLimit = require('express-rate-limit')
const path = require('path')
const helmet = require('helmet')
const cors = require('cors')
const compression = require('compression')
const mongoose = require('mongoose')

const { errorHandler } = require('./middleware/errorMiddleware.js')
const { requestLogger } = require('./middleware/requestLogger.js')

const { workoutRouter } = require('./routes/workoutRoutes.js')
const { exerciseRouter } = require('./routes/exerciseRoutes.js')
const { userRouter } = require('./routes/userRoutes.js')
const { questRouter } = require('./routes/questRoutes.js')
const { leaderboardRouter } = require('./routes/leaderboardRoutes.js')
const { routineRouter } = require('./routes/routineRoutes.js')

const createApp = () => {
    const app = express()

    // Trust the first proxy hop (Render) so rate limiting sees the real client IP
    // and not the proxy's address, which would make every user share one limit
    app.set('trust proxy', 1)

    // Request logging (quiet in tests)
    if (process.env.NODE_ENV !== 'test') app.use(requestLogger)

    // Health checks: liveness never touches the database, readiness does
    app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }))
    app.get('/ready', (req, res) => {
        const ready = mongoose.connection.readyState === 1
        res.status(ready ? 200 : 503).json({ status: ready ? 'ready' : 'database unavailable' })
    })

    // Gzip responses (JS bundle and JSON payloads)
    app.use(compression())

    // Body parsing with an explicit size limit
    app.use(express.json({ limit: '100kb' }))
    app.use(express.urlencoded({ extended: false, limit: '100kb' }))

    // Helmet HTTP security
    app.use(helmet())

    // Custom Content Security Policy
    app.use(
        helmet.contentSecurityPolicy({
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'"],
                connectSrc: ["'self'"],
                imgSrc: ["'self'", 'data:'],
                styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
                fontSrc: ["'self'", 'https://fonts.gstatic.com'],
                objectSrc: ["'none'"]
            }
        })
    )

    // CORS
    app.use(cors({
        origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : 'http://localhost:3000',
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
        optionsSuccessStatus: 200
    }))

    // General rate limit for all API routes
    app.use('/api', rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: process.env.NODE_ENV === 'test' ? 100000 : 500,
        standardHeaders: true,
        legacyHeaders: false,
        message: { message: 'Too many requests, please try again later' }
    }))

    // Routes
    app.use('/api/workouts', workoutRouter)
    app.use('/api/exercises', exerciseRouter)
    app.use('/api/users', userRouter)
    app.use('/api/quests', questRouter)
    app.use('/api/leaderboard', leaderboardRouter)
    app.use('/api/routines', routineRouter)

    // Unknown API routes get a JSON 404 (not the frontend's HTML)
    app.use('/api', (req, res) => {
        res.status(404).json({ message: 'Not found' })
    })

    // Production: serve the built frontend
    if (process.env.NODE_ENV === 'production') {
        const distDir = path.join(__dirname, '..', 'strive-frontend', 'dist')
        // Vite content-hashes everything in /assets, so it can be cached for a year
        app.use('/assets', express.static(path.join(distDir, 'assets'), { maxAge: '1y', immutable: true }))
        app.use(express.static(distDir))
        app.get(/.*/, (req, res) => {
            res.setHeader('Cache-Control', 'no-cache')
            res.sendFile(path.resolve(__dirname, '..', 'strive-frontend', 'dist', 'index.html'))
        })
    }

    // Custom Error Handler
    app.use(errorHandler)

    return app
}

module.exports = { createApp }
