// ForgotPassword.jsx

import { useState } from 'react'
import { Link } from 'react-router-dom'
import PublicHeader from '../components/headers/PublicHeader.jsx'
import Card from '../components/ui/Card.jsx'
import Input from '../components/ui/Input.jsx'
import Button from '../components/ui/Button.jsx'
import authService from '../features/auth/authService.js'
import { getErrorMessage } from '../utils/getErrorMessage.js'

const ForgotPassword = () => {
    const [email, setEmail] = useState('')
    const [error, setError] = useState('')
    const [sent, setSent] = useState(false)
    const [sending, setSending] = useState(false)

    const submit = async (event) => {
        event.preventDefault()
        setError('')

        if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
            setError('Enter a valid email address')
            return
        }

        setSending(true)
        try {
            await authService.forgotPassword(email.trim())
            setSent(true)
        } catch (err) {
            setError(getErrorMessage(err))
        } finally {
            setSending(false)
        }
    }

    return (
        <>
            <PublicHeader />
            <main className="mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-md items-center px-4 py-8">
                <Card padding="lg" className="w-full space-y-6">
                    <div className="text-center">
                        <h1 className="font-display text-4xl font-bold">Forgot your <span className="text-accent-fg">password?</span></h1>
                        <p className="mt-1 text-muted">Enter your email and we will send you a link to choose a new one.</p>
                    </div>

                    {sent ? (
                        <div role="status" className="space-y-4 text-center">
                            <p className="rounded-xl bg-bg/60 p-4 text-fg">
                                If an account exists for <strong>{email.trim()}</strong>, a reset link is on its way. It works once and expires in 1 hour.
                            </p>
                            <p className="text-sm text-muted">Nothing arrived? Check your spam folder, or try again in a few minutes.</p>
                            <Button as={Link} to="/login" variant="secondary" fullWidth>Back to sign in</Button>
                        </div>
                    ) : (
                        <form onSubmit={submit} className="space-y-4" noValidate>
                            <Input
                                label="Email"
                                type="email"
                                autoComplete="email"
                                autoCapitalize="none"
                                value={email}
                                error={error}
                                onChange={(event) => { setEmail(event.target.value); setError('') }}
                            />
                            <Button type="submit" fullWidth size="lg" loading={sending}>Send reset link</Button>
                            <p className="text-center text-sm text-muted">
                                <Link to="/login" className="font-semibold text-accent-fg hover:underline">Back to sign in</Link>
                            </p>
                        </form>
                    )}
                </Card>
            </main>
        </>
    )
}

export default ForgotPassword
