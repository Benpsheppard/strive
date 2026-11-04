// Register.jsx

// Imports
import { Link, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { toast } from 'react-toastify'

// Feature Imports
import { register, reset } from '../features/auth/authSlice.js'

// Component Imports
import Spinner from '../components/spinners/Spinner.jsx'
import PublicHeader from '../components/headers/PublicHeader.jsx'
import CredentialsForm from '../components/auth/CredentialsForm.jsx'
import Card from '../components/ui/Card.jsx'

const Register = () => {
    const { user, isLoading, isError, isSuccess, message } = useSelector((state) => state.auth)

    const navigate = useNavigate()
    const dispatch = useDispatch()

    useEffect(() => {
        if (isError) {
            toast.error(message)
        }

        if (isSuccess || user) {
            navigate('/onboarding', { replace: true })
        }

        dispatch(reset())
    }, [user, isError, isSuccess, message, navigate, dispatch])

    if (isLoading) return <Spinner />

    return (
        <>
            <PublicHeader />
            <main className="mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-md items-center px-4 py-8">
                <Card padding="lg" className="w-full space-y-6">
                    <div className="text-center">
                        <h1 className="font-display text-4xl font-bold">
                            Create your <span className="text-accent-fg">account</span>
                        </h1>
                        <p className="mt-1 text-muted">Free to start. Your workouts and progress are saved.</p>
                    </div>

                    <CredentialsForm submitLabel="Create account" onSubmit={(details) => dispatch(register(details))} />

                    <p className="text-center text-sm text-muted">
                        Already have an account?{' '}
                        <Link to="/login" className="font-semibold text-accent-fg hover:underline">Sign in</Link>
                    </p>
                </Card>
            </main>
        </>
    )
}

export default Register
