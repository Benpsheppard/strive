// GuestMigration.jsx
// Turns a guest account into a full account, keeping all its workouts and progress

// Imports
import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'

// Feature Imports
import { migrate } from '../features/auth/authSlice'

// Component Imports
import PublicHeader from '../components/headers/PublicHeader.jsx'
import Spinner from '../components/spinners/Spinner'
import CredentialsForm from '../components/auth/CredentialsForm.jsx'
import Card from '../components/ui/Card.jsx'

const GuestMigration = () => {
    const { user, isLoading, isError, isSuccess, message } = useSelector((state) => state.auth)

    const navigate = useNavigate()
    const dispatch = useDispatch()

    useEffect(() => {
        if (!user) {
            navigate('/login')
            return
        }

        if (!user.isGuest) {
            // A guest who has just migrated is no longer a guest
            if (isSuccess) {
                toast.success('Account created. Your progress has been kept!')
            }
            navigate('/')
            return
        }

        if (isError) {
            toast.error(message)
        }
    }, [user, isError, isSuccess, message, navigate])

    if (isLoading) return <Spinner />

    return (
        <>
            <PublicHeader />
            <main className="mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-md items-center px-4 py-8">
                <Card padding="lg" className="w-full space-y-6">
                    <div className="text-center">
                        <h1 className="font-display text-4xl font-bold">
                            Keep your <span className="text-accent-fg">progress</span>
                        </h1>
                        <p className="mt-1 text-muted">
                            Create your account and everything you have logged as a guest comes with you, with no workout limit.
                        </p>
                    </div>

                    <CredentialsForm submitLabel="Create my account" onSubmit={(details) => dispatch(migrate(details))} />

                    <p className="text-center text-sm text-muted">
                        <Link to="/" className="font-semibold text-accent-fg hover:underline">Not now, back to my workouts</Link>
                    </p>
                </Card>
            </main>
        </>
    )
}

export default GuestMigration
