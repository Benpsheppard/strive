// requestLogger.js
// One line per request: id, method, path, status and time. Never logs bodies, headers or
// query strings, which can contain passwords and tokens.

const crypto = require('crypto')

const requestLogger = (req, res, next) => {
    const id = crypto.randomUUID().slice(0, 8)
    const start = process.hrtime.bigint()

    req.id = id
    res.setHeader('X-Request-Id', id)

    res.on('finish', () => {
        const ms = Number(process.hrtime.bigint() - start) / 1e6
        // req.originalUrl minus the query string
        const path = req.originalUrl.split('?')[0]
        console.log(`[${id}] ${req.method} ${path} ${res.statusCode} ${ms.toFixed(0)}ms`)
    })

    next()
}

module.exports = { requestLogger }
