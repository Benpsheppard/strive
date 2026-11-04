// credentials.js
// Sign-up validation shared by Register and guest migration (the server checks these too)

const USERNAME_REGEX = /^[A-Za-z0-9_.-]{3,30}$/

export const getPasswordRules = (password) => [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'A lowercase letter', met: /[a-z]/.test(password) },
    { label: 'An uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'A number', met: /[0-9]/.test(password) },
    { label: 'A symbol', met: /[^A-Za-z0-9]/.test(password) }
]

// Returns { [field]: message } for anything invalid
export const validateCredentials = ({ email, username, password, password2, acceptedTerms }) => {
    const errors = {}

    if (!/^\S+@\S+\.\S+$/.test(email.trim())) errors.email = 'Enter a valid email address'
    if (!USERNAME_REGEX.test(username.trim())) errors.username = '3-30 characters: letters, numbers, . _ or -'
    if (getPasswordRules(password).some(rule => !rule.met)) errors.password = 'Your password does not meet all the rules below'
    if (password !== password2) errors.password2 = 'Passwords do not match'
    if (acceptedTerms !== true) errors.acceptedTerms = 'Please accept the terms and privacy policy to continue'

    return errors
}
