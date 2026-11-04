// EmailBanner.jsx
// A gentle nudge to confirm the email address (needed to recover the account). Never blocks anything.

import { useState } from 'react'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import Button from '../ui/Button.jsx'
import authService from '../../features/auth/authService.js'
import { getErrorMessage } from '../../utils/getErrorMessage.js'

const DISMISS_KEY = 'Strive:emailBannerDismissed'

const readDismissed = () => {
    try { return sessionStorage.getItem(DISMISS_KEY) === '1' } catch { return false }
}

const EmailBanner = () => {
    const { user } = useSelector((state) => state.auth)
    const [dismissed, setDismissed] = useState(readDismissed)
    const [sending, setSending] = useState(false)

    if (!user || user.isGuest || user.emailVerified || dismissed) return null

    const resend = async () => {
        setSending(true)
        try {
            const { message } = await authService.resendVerification(user.token)
            toast.success(message)
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setSending(false)
        }
    }

    const dismiss = () => {
        try { sessionStorage.setItem(DISMISS_KEY, '1') } catch { /* private mode: it just comes back next visit */ }
        setDismissed(true)
    }

    return (
        <div role="status" className="mb-4 flex flex-col gap-3 rounded-xl border border-line bg-surface p-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted">
                <span className="font-semibold text-fg">Confirm your email</span> so you can recover your account if you forget your password.
            </p>
            <div className="flex shrink-0 gap-2">
                <Button size="sm" loading={sending} onClick={resend}>Resend email</Button>
                <Button size="sm" variant="ghost" onClick={dismiss}>Not now</Button>
            </div>
        </div>
    )
}

export default EmailBanner
