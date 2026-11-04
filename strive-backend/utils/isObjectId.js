// isObjectId.js
// mongoose's ObjectId.isValid also accepts any 12-character string, so require 24 hex characters

const isObjectId = (value) => typeof value === 'string' && /^[0-9a-fA-F]{24}$/.test(value)

module.exports = { isObjectId }
