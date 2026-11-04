// ResetPassword.jsx
// Reached from the link in the reset email: /reset-password?token=...

import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { FaCheckCircle, FaRegCircle } from 'react-icons/fa'
import PublicHeader from '../components/headers/PublicHeader.jsx'
import Card from '../components/ui/Card.jsx'
import Input from '../components/ui/Input.jsx'
import Button from '../components/ui/Button.jsx'
import authService from '../features/auth/authService.js'
import { getErrorMessage } from '../utils/getErrorMessage.js'
import { getPasswordRules } from '../utils/credentials.js'
import { cx } from '../utils/cx.js'

const ResetPassword = () => {
    const [params] = useSearchParams()
    const token = params.get('token') || ''
    const navigate = useNavigate()

    const [password, setPassword] = useState('')
    const [password2, setPassword2] = useState('')
    const [errors, setErrors] = useState({})
    const [linkError, setLinkError] = useState('')
    const [saving, setSaving] = useState(false)

    const rules = getPasswordRules(password)

    const submit = async (event) => {
        event.preventDefault()

        const found = {}
        if (rules.some(rule => !rule.met)) found.password = 'Your password does not meet all the rules below'
        if (password !== password2) found.password2 = 'Passwords do not match'
        setErrors(found)
        if (Object.keys(found).length > 0) return

        setSaving(true)
        try {
            await authService.resetPassword(token, password)
            toast.success('Password changed. Please sign in.')
            navigate('/login', { replace: true })
        } catch (err) {
            setLinkError(getErrorMessage(err))
        } finally {
            setSaving(false)
        }
    }

    const brokenLink = !token || linkError

    return (
        <>
            <PublicHeader />
            <main className="mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-md items-center px-4 py-8">
                <Card padding="lg" className="w-full space-y-6">
                    <div className="text-center">
                        <h1 className="font-display text-4xl font-bold">Choose a <span className="text-accent-fg">new password</span></h1>
                    </div>

                    {brokenLink ? (
                        <div role="alert" className="space-y-4 text-center">
                            <p className="rounded-xl bg-bg/60 p-4 text-fg">{linkError || 'This reset link is invalid or has expired.'}</p>
                            <Button as={Link} to="/forgot-password" fullWidth>Get a new link</Button>
                        </div>
                    ) : (
                        <form onSubmit={submit} className="space-y-4" noValidate>
                            <Input label="New password" type="password" autoComplete="new-password" value={password} error={errors.password} onChange={(e) => setPassword(e.target.value)} />

                            <ul className="grid grid-cols-1 gap-1 text-sm sm:grid-cols-2" aria-label="Password rules">
                                {rules.map(rule => (
                                    <li key={rule.label} className={cx('flex items-center gap-2', rule.met ? 'text-success' : 'text-muted')}>
                                        {rule.met ? <FaCheckCircle aria-label="Met" /> : <FaRegCircle aria-label="Not met" />}
                                        {rule.label}
                                    </li>
                                ))}
                            </ul>

                            <Input label="Confirm new password" type="password" autoComplete="new-password" value={password2} error={errors.password2} onChange={(e) => setPassword2(e.target.value)} />

                            <Button type="submit" fullWidth size="lg" loading={saving}>Change password</Button>
                            <p className="text-center text-sm text-muted">You will be signed out on all your other devices.</p>
                        </form>
                    )}
                </Card>
            </main>
        </>
    )
}

export default ResetPassword
