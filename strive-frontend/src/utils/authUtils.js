// authUtils.js

// Cryptographically secure random integer in [0, max) using rejection sampling (no modulo bias)
const secureRandomInt = (max) => {
  const limit = Math.floor(0x100000000 / max) * max
  const buffer = new Uint32Array(1)
  do {
    crypto.getRandomValues(buffer)
  } while (buffer[0] >= limit)
  return buffer[0] % max
}

const pick = (chars) => chars[secureRandomInt(chars.length)]

// Function to generate a random valid password for Guest accounts
export const generateRandomPassword = (length = 16) => {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lower = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const symbols = '!@#$%^&*()_+[]{}|:,.<>?'
  const all = upper + lower + numbers + symbols

  // Make sure we include at least one of each
  const chars = [pick(upper), pick(lower), pick(numbers), pick(symbols)]

  // Fill the rest with random characters
  while (chars.length < length) {
    chars.push(pick(all))
  }

  // Fisher-Yates shuffle so the guaranteed characters aren't always first
  for (let i = chars.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1)
    ;[chars[i], chars[j]] = [chars[j], chars[i]]
  }

  return chars.join('')
}
