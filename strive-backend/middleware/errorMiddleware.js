// errorHandler.js
// File to handle errors with custom status codes

// Function to set error code to custom or default to 500 (server error)
const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode ? res.statusCode : 500

    const isDevelopment = ['development'].includes(process.env.NODE_ENV)

    res.status(statusCode)

    res.json({
        message: err.message,
        stack: isDevelopment ? err.stack : null
    })
}

module.exports = { errorHandler }