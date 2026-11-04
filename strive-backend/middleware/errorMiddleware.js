// errorHandler.js
// File to handle errors with custom status codes

// Function to set error code to custom or default to 500 (server error)
const errorHandler = (err, req, res, next) => {
    // Errors from middleware (e.g. body-parser's 413 or 400) carry their own status
    const errorStatus = Number(err.status || err.statusCode)
    const statusCode = res.statusCode >= 400
        ? res.statusCode
        : (errorStatus >= 400 && errorStatus < 600 ? errorStatus : 500)

    const isDevelopment = ['development'].includes(process.env.NODE_ENV)

    // Server errors are hidden from clients, so they must at least be visible in the logs
    if (statusCode >= 500) {
        console.error(`[${req.id || '-'}] ${req.method} ${(req.originalUrl || '').split('?')[0]} failed:`, err.stack || err.message)
    }

    res.status(statusCode)

    // Don't leak internal error details for server errors outside development
    const message = statusCode >= 500 && !isDevelopment
        ? 'Internal server error'
        : err.message

    res.json({
        message,
        stack: isDevelopment ? err.stack : null
    })
}

module.exports = { errorHandler }