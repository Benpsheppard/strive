// server.js
// Starts the API: check the environment, connect to the database, then listen.

require('dotenv').config()

const mongoose = require('mongoose')
const connectDB = require('./config/db.js')
const { validateEnv } = require('./config/env.js')
const { createApp } = require('./app.js')

const { errors, warnings } = validateEnv()
warnings.forEach(message => console.warn(`Warning: ${message}`))
if (errors.length > 0) {
    errors.forEach(message => console.error(message))
    process.exit(1)
}

const port = process.env.PORT || 5050
const SHUTDOWN_TIMEOUT_MS = 10000

const start = async () => {
    // Only start listening once the database is available, so the first requests don't fail
    await connectDB()

    const app = createApp()
    const server = app.listen(port, () => {
        console.log(`Server running on port ${port}`)
    })

    // Graceful shutdown: stop taking new requests, let in-flight ones finish, close the database
    let shuttingDown = false
    const shutdown = (signal) => {
        if (shuttingDown) return
        shuttingDown = true
        console.log(`${signal} received, shutting down`)

        const force = setTimeout(() => {
            console.error('Shutdown timed out, forcing exit')
            process.exit(1)
        }, SHUTDOWN_TIMEOUT_MS)
        force.unref()

        server.close(async () => {
            try {
                await mongoose.disconnect()
            } finally {
                process.exit(0)
            }
        })
    }

    process.on('SIGTERM', () => shutdown('SIGTERM'))
    process.on('SIGINT', () => shutdown('SIGINT'))
}

process.on('unhandledRejection', (reason) => {
    console.error('Unhandled promise rejection:', reason instanceof Error ? reason.stack : reason)
})

process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error.stack)
    process.exit(1)
})

start().catch((error) => {
    console.error('Failed to start server:', error.message)
    process.exit(1)
})
