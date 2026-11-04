// passwords.js

const bcrypt = require('bcryptjs')

const BCRYPT_COST = 12

const hashPassword = async (plain) => {
    const salt = await bcrypt.genSalt(BCRYPT_COST)
    return bcrypt.hash(plain, salt)
}

// A valid hash of a random value. Comparing against it when a user does not exist makes
// "unknown user" take as long as "wrong password", so login timing doesn't reveal accounts.
const DUMMY_HASH = '$2b$12$C6UzMDM.H6dfI/f/IKcEeO7zR8xX6ZkQ5rQ1zWb1xk8nX3q7oC9Ym'

module.exports = { hashPassword, DUMMY_HASH, BCRYPT_COST }
