// sanitiseMiddleware.js

// Imports
const sanitise = require('mongo-sanitize')

const sanitiseInput = (req, res, next) => {
    if (req.body) req.body = sanitise(req.body)
    if (req.params) req.params = sanitise(req.params)
    if (req.query) req.query = sanitise(req.query)
    next()
}

// Exports
module.exports = { sanitiseInput }