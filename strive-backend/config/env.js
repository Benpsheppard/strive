// env.js
// Checks the environment before the server starts. Returns problems instead of exiting
// so it can be tested; server.js decides what to do with them.

const REQUIRED = ['NODE_ENV', 'PORT', 'MONGO_URI', 'JWT_SECRET', 'FRONTEND_URL']

const validateEnv = (env = process.env) => {
    const errors = []
    const warnings = []

    const missing = REQUIRED.filter(key => !env[key])
    if (missing.length > 0) {
        errors.push(`Missing .env keys: ${missing.join(', ')}`)
        return { errors, warnings }
    }

    if (!['development', 'production', 'test'].includes(env.NODE_ENV)) {
        errors.push(`NODE_ENV invalid: ${env.NODE_ENV}`)
    }

    if (env.NODE_ENV === 'production' && !/^https?:\/\/.+/.test(env.FRONTEND_URL)) {
        errors.push(`FRONTEND_URL invalid: ${env.FRONTEND_URL}`)
    }

    if (env.JWT_SECRET.length < 32) {
        const message = 'JWT_SECRET should be at least 32 characters long'
        if (env.NODE_ENV === 'production') errors.push(message)
        else warnings.push(message)
    }

    if (!env.ANTHROPIC_API_KEY) {
        warnings.push('ANTHROPIC_API_KEY is not set, so AI quests are unavailable')
    }

    if (!env.RESEND_API_KEY) {
        warnings.push(
            env.NODE_ENV === 'production'
                ? 'RESEND_API_KEY is not set: password reset and verification emails will NOT be sent'
                : 'RESEND_API_KEY is not set: emails are printed to the console instead of sent'
        )
    }

    return { errors, warnings }
}

module.exports = { validateEnv }
