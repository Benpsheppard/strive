// mailer.js
// Sends email through Resend (https://resend.com) using plain fetch, so there is no SDK to install.
// Without RESEND_API_KEY the email is printed to the console instead (development and tests),
// which lets every flow be tried without an account.

const RESEND_URL = 'https://api.resend.com/emails'

const sendMail = async ({ to, subject, text, html }) => {
    const apiKey = process.env.RESEND_API_KEY

    if (!apiKey) {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('RESEND_API_KEY is not set, so the email was not sent')
        }

        console.log(`\n--- Email (not sent: no RESEND_API_KEY) ---\nTo: ${to}\nSubject: ${subject}\n\n${text}\n--- end email ---\n`)
        return { sent: false }
    }

    const response = await fetch(RESEND_URL, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            from: process.env.MAIL_FROM || 'Strive <onboarding@resend.dev>',
            to: [to],
            subject,
            text,
            html
        })
    })

    if (!response.ok) {
        // Don't include the response body: providers sometimes echo the request
        throw new Error(`Email provider responded with ${response.status}`)
    }

    return { sent: true }
}

module.exports = { sendMail }
