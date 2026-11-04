// duplicateKey.js
// Mongoose wraps MongoDB's duplicate-key error (code 11000) in its own error when the schema
// has a custom message, so look at both. Returns the field that was duplicated, or null.

const getDuplicateField = (error) => {
    const original = error?.code === 11000 ? error : error?.cause?.code === 11000 ? error.cause : null
    if (!original) return null

    const field = Object.keys(original.keyPattern || original.keyValue || {})[0]
    return field || 'unknown'
}

module.exports = { getDuplicateField }
