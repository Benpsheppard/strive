// errorHandler.js
// File to handle errors with custom status codes

// Function to set error code to custom or default to 500 (server error)
const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode >= 400 ? res.statusCode : 500

    const isDevelopment = ['development'].includes(process.env.NODE_ENV)

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