// Login.jsx

// Imports
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { toast } from 'react-toastify'

// Feature Imports
import { login, reset, register } from '../features/auth/authSlice.js'

// Utils Imports
import { generateRandomPassword } from '../utils/authUtils.js'

// Component Imports
import Spinner from '../components/spinners/Spinner.jsx'
import PublicHeader from '../components/headers/PublicHeader.jsx'
import Card from '../components/ui/Card.jsx'
import Input from '../components/ui/Input.jsx'
import Button from '../components/ui/Button.jsx'

const Login = () => {
    const { user, isLoading, isError, isSuccess, message } = useSelector((state) => state.auth)

    const navigate = useNavigate()
    const location = useLocation()
    const dispatch = useDispatch()

    const [formData, setFormData] = useState({ identifier: '', password: '' })
    const [errors, setErrors] = useState({})
    const { identifier, password } = formData

    // Where to go after signing in (the page the visitor was trying to reach)
    const destination = location.state?.from || '/'

    useEffect(() => {
        if (isError) {
            toast.error(message)
        }

        if (isSuccess || user) {
            navigate(destination, { replace: true })
        }

        if (isSuccess && user) {
            toast.success(`Logged in as ${user.username}`)
        }

        dispatch(reset())
    }, [user, isError, isSuccess, message, navigate, dispatch, destination])

    const onChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
    }

    const onSubmit = (e) => {
        e.preventDefault()

        const nextErrors = {}
        if (!identifier.trim()) nextErrors.identifier = 'Enter your username or email'
        if (!password) nextErrors.password = 'Enter your password'
        if (Object.keys(nextErrors).length > 0) {
            setErrors(nextErrors)
            return
        }

        const userData = identifier.includes('@')
            ? { email: identifier.trim(), password }
            : { username: identifier.trim(), password }

        dispatch(login(userData))
    }

    const loginGuest = () => {
        const username = `Guest${Date.now()}${Math.floor(Math.random() * 1000)}`

        dispatch(register({
            username,
            email: `${username}@strive.com`,
            password: generateRandomPassword(),
            isGuest: true
        }))
    }

    if (isLoading) return <Spinner />

    return (
        <>
            <PublicHeader />
            <main className="mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-md items-center px-4 py-8">
                <Card padding="lg" className="w-full space-y-6">
                    <div className="text-center">
                        <h1 className="font-display text-4xl font-bold">
                            Welcome <span className="text-accent-fg">back</span>
                        </h1>
                        <p className="mt-1 text-muted">Sign in to pick up where you left off.</p>
                    </div>

                    <form onSubmit={onSubmit} className="space-y-4" noValidate>
                        <Input
                            label="Username or email"
                            name="identifier"
                            autoComplete="username"
                            autoCapitalize="none"
                            value={identifier}
                            error={errors.identifier}
                            onChange={onChange}
                        />
                        <Input
                            label="Password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            value={password}
                            error={errors.password}
                            onChange={onChange}
                        />
                        <Button type="submit" fullWidth size="lg">Sign in</Button>
                    </form>

                    <p className="text-center text-sm text-muted">
                        New to Strive?{' '}
                        <Link to="/register" className="font-semibold text-accent-fg hover:underline">Create an account</Link>
                    </p>

                    <div className="space-y-2 border-t border-line pt-5 text-center">
                        <Button variant="secondary" fullWidth onClick={loginGuest}>Try it as a guest</Button>
                        <p className="text-sm text-muted">Log up to 5 workouts without an account. You can keep your progress by signing up later.</p>
                    </div>
                </Card>
            </main>
        </>
    )
}

export default Login
