// VerifyEmail.jsx
// Reached from the link in the confirmation email: /verify-email?token=...

import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import PublicHeader from '../components/headers/PublicHeader.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import authService from '../features/auth/authService.js'
import { getMe } from '../features/auth/authSlice.js'
import { getErrorMessage } from '../utils/getErrorMessage.js'

const VerifyEmail = () => {
    const [params] = useSearchParams()
    const token = params.get('token') || ''
    const dispatch = useDispatch()
    const { user } = useSelector((state) => state.auth)

    const [status, setStatus] = useState(token ? 'checking' : 'error')
    const [message, setMessage] = useState(token ? '' : 'This confirmation link is invalid or has expired.')
    const started = useRef(false)

    // The token works once, so make sure it is only sent once (React may run effects twice in development)
    useEffect(() => {
        if (!token || started.current) return
        started.current = true

        authService.verifyEmail(token)
            .then(() => {
                setStatus('done')
                // Refresh the signed-in user so the "confirm your email" banner disappears
                if (user) dispatch(getMe())
            })
            .catch((error) => {
                setStatus('error')
                setMessage(getErrorMessage(error))
            })
    }, [token, user, dispatch])

    return (
        <>
            <PublicHeader />
            <main className="mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-md items-center px-4 py-8">
                <Card padding="lg" className="w-full space-y-4 text-center" aria-live="polite">
                    {status === 'checking' && <p className="text-muted">Confirming your email…</p>}

                    {status === 'done' && (
                        <>
                            <h1 className="font-display text-4xl font-bold">Email <span className="text-success">confirmed</span></h1>
                            <p className="text-muted">Thanks! Your email address is confirmed.</p>
                            <Button as={Link} to="/" fullWidth>{user ? 'Back to Strive' : 'Sign in'}</Button>
                        </>
                    )}

                    {status === 'error' && (
                        <div role="alert" className="space-y-4">
                            <h1 className="font-display text-3xl font-bold">We could not confirm that link</h1>
                            <p className="text-muted">{message}</p>
                            <Button as={Link} to={user ? '/profile' : '/login'} fullWidth>
                                {user ? 'Go to Profile to get a new link' : 'Sign in to get a new link'}
                            </Button>
                        </div>
                    )}
                </Card>
            </main>
        </>
    )
}

export default VerifyEmail
