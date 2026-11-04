// emails.js
// The text of the emails Strive sends

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

const layout = (heading, intro, buttonLabel, link, outro) => ({
    html: `<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;color:#1b1d2e">
<h1 style="font-size:22px">${escapeHtml(heading)}</h1>
<p>${escapeHtml(intro)}</p>
<p><a href="${escapeHtml(link)}" style="display:inline-block;background:#d90429;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold">${escapeHtml(buttonLabel)}</a></p>
<p style="font-size:13px;color:#555">Or copy this link into your browser:<br>${escapeHtml(link)}</p>
<p style="font-size:13px;color:#555">${escapeHtml(outro)}</p>
</div>`,
    text: `${heading}\n\n${intro}\n\n${link}\n\n${outro}`
})

const passwordResetEmail = (link) => ({
    subject: 'Reset your Strive password',
    ...layout(
        'Reset your password',
        'We received a request to reset the password for your Strive account. This link works once and expires in 1 hour.',
        'Choose a new password',
        link,
        'If you did not ask for this, you can ignore this email. Your password will not change.'
    )
})

const verifyEmail = (link) => ({
    subject: 'Confirm your email for Strive',
    ...layout(
        'Confirm your email',
        'Please confirm this email address for your Strive account. The link expires in 24 hours.',
        'Confirm my email',
        link,
        'If you did not create a Strive account, you can ignore this email.'
    )
})

module.exports = { passwordResetEmail, verifyEmail }
