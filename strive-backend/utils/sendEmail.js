// sendEmail.js

// Imports
const nodemailer = require('nodemailer')

const sendEmail = async (to, subject, html) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL
        }
    })
}