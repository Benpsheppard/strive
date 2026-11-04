// SecurityCard.jsx
// Email status, change email and password, and your data (download)

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { FaCheckCircle, FaExclamationCircle } from 'react-icons/fa'
import Card, { CardTitle } from '../ui/Card.jsx'
import Button from '../ui/Button.jsx'
import ChangePasswordDialog from './ChangePasswordDialog.jsx'
import ChangeEmailDialog from './ChangeEmailDialog.jsx'
import authService from '../../features/auth/authService.js'
import { getErrorMessage } from '../../utils/getErrorMessage.js'

// Saves JSON to the user's device
const downloadJson = (data, filename) => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
}

const SecurityCard = () => {
    const { user } = useSelector((state) => state.auth)
    const [dialog, setDialog] = useState(null) // 'password' | 'email' | null
    const [resending, setResending] = useState(false)
    const [exporting, setExporting] = useState(false)

    const resend = async () => {
        setResending(true)
        try {
            const { message } = await authService.resendVerification(user.token)
            toast.success(message)
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setResending(false)
        }
    }

    const exportData = async () => {
        setExporting(true)
        try {
            const data = await authService.exportData(user.token)
            downloadJson(data, `strive-data-${new Date().toISOString().slice(0, 10)}.json`)
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setExporting(false)
        }
    }

    return (
        <>
            {!user.isGuest && (
                <Card as="section" aria-labelledby="security-title" className="space-y-4">
                    <CardTitle id="security-title" accent="and email">Security</CardTitle>

                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-bg/60 p-3">
                        <div className="min-w-0">
                            <p className="truncate font-semibold text-fg">{user.email}</p>
                            {user.emailVerified ? (
                                <p className="flex items-center gap-1.5 text-sm text-success"><FaCheckCircle aria-hidden="true" /> Email confirmed</p>
                            ) : (
                                <p className="flex items-center gap-1.5 text-sm text-warning"><FaExclamationCircle aria-hidden="true" /> Not confirmed yet</p>
                            )}
                        </div>
                        {!user.emailVerified && <Button variant="secondary" size="sm" loading={resending} onClick={resend}>Resend email</Button>}
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                        <Button variant="secondary" fullWidth onClick={() => setDialog('password')}>Change password</Button>
                        <Button variant="secondary" fullWidth onClick={() => setDialog('email')}>Change email</Button>
                    </div>
                </Card>
            )}

            <Card as="section" aria-labelledby="data-title" className="space-y-3">
                <CardTitle id="data-title" accent="data">Your</CardTitle>
                <p className="text-sm text-muted">Download a copy of everything Strive holds about you, as a file you can keep.</p>
                <Button variant="secondary" fullWidth loading={exporting} onClick={exportData}>Download my data</Button>
                <p className="text-center text-sm text-muted">
                    <Link to="/privacy" className="underline hover:text-fg">Privacy</Link>{' · '}
                    <Link to="/terms" className="underline hover:text-fg">Terms</Link>{' · '}
                    <Link to="/support" className="underline hover:text-fg">Support</Link>
                </p>
            </Card>

            <ChangePasswordDialog open={dialog === 'password'} onClose={() => setDialog(null)} />
            <ChangeEmailDialog open={dialog === 'email'} onClose={() => setDialog(null)} />
        </>
    )
}

export default SecurityCard
