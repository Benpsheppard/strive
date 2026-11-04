// accountController.js
// Password reset, email verification, changing credentials and data export

const asyncHandler = require('express-async-handler')
const bcrypt = require('bcryptjs')
const validator = require('validator')

const User = require('../models/userModel.js')
const formatUser = require('../utils/formatUser.js')
const mailer = require('../utils/mailer.js')
const { passwordResetEmail } = require('../utils/emails.js')
const { hashPassword } = require('../utils/passwords.js')
const { createToken, hashToken, RESET_TOKEN_TTL_MS } = require('../utils/tokens.js')
const { collectUserData } = require('../utils/accountData.js')
const { getDuplicateField } = require('../utils/duplicateKey.js')
const { genToken, sendVerificationEmail } = require('./userController.js')

const GENERIC_RESET_MESSAGE = 'If an account exists for that email, we have sent a link to reset the password.'

const isString = (value) => typeof value === 'string'

// Same rule as sign-up
const assertStrongPassword = (password, res) => {
    if (!isString(password) || !validator.isStrongPassword(password)) {
        res.status(400)
        throw new Error('Password must satisfy all criteria.')
    }
}

/**
 * @desc    Email a password reset link. Always answers the same way so it can't be used
 *          to find out which emails have accounts.
 * @route   POST /api/users/forgot-password
 * @access  Public
 */
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body || {}

    if (!isString(email) || !validator.isEmail(email)) {
        res.status(400)
        throw new Error('Please enter a valid email address')
    }

    const user = await User.findOne({ email: validator.normalizeEmail(email) })

    // Guests have placeholder emails and no way to receive mail
    if (user && !user.isGuest) {
        const { token, hash, expires } = createToken(RESET_TOKEN_TTL_MS)
        await User.updateOne({ _id: user._id }, { passwordResetTokenHash: hash, passwordResetExpires: expires })

        try {
            await mailer.sendMail({ to: user.email, ...passwordResetEmail(`${process.env.FRONTEND_URL}/reset-password?token=${token}`) })
        } catch (error) {
            // The answer must not change, or failures would reveal which emails exist
            console.error('Password reset email failed:', error.message)
        }
    }

    res.status(200).json({ message: GENERIC_RESET_MESSAGE })
})

/**
 * @desc    Set a new password using an emailed token. Signs out every other session.
 * @route   POST /api/users/reset-password
 * @access  Public
 */
const resetPassword = asyncHandler(async (req, res) => {
    const { token, password } = req.body || {}

    if (!isString(token) || token.length < 20) {
        res.status(400)
        throw new Error('This reset link is invalid or has expired')
    }
    assertStrongPassword(password, res)

    const user = await User.findOne({
        passwordResetTokenHash: hashToken(token),
        passwordResetExpires: { $gt: new Date() }
    }).select('+passwordResetTokenHash +passwordResetExpires')

    if (!user) {
        res.status(400)
        throw new Error('This reset link is invalid or has expired')
    }

    user.password = await hashPassword(password)
    user.tokenVersion = (user.tokenVersion || 0) + 1
    // Using a link sent to the address proves it belongs to them
    user.emailVerified = true
    user.passwordResetTokenHash = undefined
    user.passwordResetExpires = undefined
    await user.save()

    res.status(200).json({ message: 'Your password has been changed. Please sign in.' })
})

/**
 * @desc    Confirm an email address from the emailed link
 * @route   POST /api/users/verify-email
 * @access  Public
 */
const verifyEmailToken = asyncHandler(async (req, res) => {
    const { token } = req.body || {}

    if (!isString(token) || token.length < 20) {
        res.status(400)
        throw new Error('This confirmation link is invalid or has expired')
    }

    const user = await User.findOne({
        emailVerifyTokenHash: hashToken(token),
        emailVerifyExpires: { $gt: new Date() }
    }).select('+emailVerifyTokenHash +emailVerifyExpires')

    if (!user) {
        res.status(400)
        throw new Error('This confirmation link is invalid or has expired')
    }

    user.emailVerified = true
    user.emailVerifyTokenHash = undefined
    user.emailVerifyExpires = undefined
    await user.save()

    res.status(200).json({ message: 'Your email has been confirmed.' })
})

/**
 * @desc    Send the confirmation email again
 * @route   POST /api/users/resend-verification
 * @access  Private
 */
const resendVerification = asyncHandler(async (req, res) => {
    if (req.user.isGuest) {
        res.status(400)
        throw new Error('Create an account first to confirm an email address')
    }

    if (req.user.emailVerified) {
        return res.status(200).json({ message: 'Your email is already confirmed.' })
    }

    try {
        await sendVerificationEmail(req.user)
    } catch (error) {
        console.error('Verification email failed:', error.message)
        res.status(502)
        throw new Error('We could not send the email right now. Please try again later.')
    }

    res.status(200).json({ message: 'We have sent you a confirmation email.' })
})

/**
 * @desc    Change password (needs the current one). Other sessions are signed out.
 * @route   PUT /api/users/password
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body || {}

    if (!isString(currentPassword) || !isString(newPassword)) {
        res.status(400)
        throw new Error('Please enter your current and new password')
    }

    const user = await User.findById(req.user.id)

    if (!user || user.isGuest) {
        res.status(400)
        throw new Error('Create an account first to set a password')
    }

    if (!(await bcrypt.compare(currentPassword, user.password))) {
        res.status(400)
        throw new Error('Your current password is incorrect')
    }

    assertStrongPassword(newPassword, res)

    if (currentPassword === newPassword) {
        res.status(400)
        throw new Error('Your new password must be different')
    }

    user.password = await hashPassword(newPassword)
    user.tokenVersion = (user.tokenVersion || 0) + 1
    await user.save()

    // This session carries on with a fresh token; all others stop working
    res.status(200).json(formatUser(user, genToken(user)))
})

/**
 * @desc    Change email (needs the password). The new address must be confirmed again.
 * @route   PUT /api/users/email
 * @access  Private
 */
const changeEmail = asyncHandler(async (req, res) => {
    const { password, newEmail } = req.body || {}

    if (!isString(password) || !isString(newEmail) || !validator.isEmail(newEmail)) {
        res.status(400)
        throw new Error('Please enter your password and a valid new email address')
    }

    const user = await User.findById(req.user.id)

    if (!user || user.isGuest) {
        res.status(400)
        throw new Error('Create an account first to set an email address')
    }

    if (!(await bcrypt.compare(password, user.password))) {
        res.status(400)
        throw new Error('Your password is incorrect')
    }

    const email = validator.normalizeEmail(newEmail)

    const taken = await User.findOne({ email, _id: { $ne: user._id } })
    if (taken) {
        res.status(400)
        throw new Error('Email already exists')
    }

    user.email = email
    user.emailVerified = false

    try {
        await user.save()
    } catch (error) {
        if (getDuplicateField(error)) {
            res.status(400)
            throw new Error('Email already exists')
        }
        throw error
    }

    await sendVerificationEmail(user).catch(error => console.error('Verification email failed:', error.message))

    res.status(200).json(formatUser(user))
})

/**
 * @desc    Download everything Strive holds about you
 * @route   GET /api/users/export
 * @access  Private
 */
const exportData = asyncHandler(async (req, res) => {
    const data = await collectUserData(req.user)

    res.setHeader('Content-Disposition', 'attachment; filename="strive-data.json"')
    res.status(200).json(data)
})

module.exports = {
    forgotPassword,
    resetPassword,
    verifyEmailToken,
    resendVerification,
    changePassword,
    changeEmail,
    exportData
}
