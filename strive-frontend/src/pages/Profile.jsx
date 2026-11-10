// Profile.jsx

// Imports
import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { toast } from 'react-toastify'

// Feature Imports
import { logout, deleteUser, resetUser, reset } from '../features/auth/authSlice.js'
import { getWorkouts } from '../features/workouts/workoutsSlice.js'

// Config Imports
import { APP_VERSION } from '../config/version.js'

// Hook Imports
import { useAlerts } from '../hooks/useAlerts.js'

// Component Imports
import Spinner from '../components/spinners/Spinner.jsx'
import GuestCard from '../components/guest/GuestCard.jsx'
import ProfileStats from '../components/profile/ProfileStats.jsx'
import EditDetailsDialog from '../components/profile/EditDetailsDialog.jsx'
import SecurityCard from '../components/profile/SecurityCard.jsx'
import Toggle from '../components/profile/Toggle.jsx'
import AchievementsCard from '../components/achievements/AchievementsCard.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import PageTitle from '../components/ui/PageTitle.jsx'

const Profile = () => {
    const { user, isLoading } = useSelector((state) => state.auth)
    const { workouts } = useSelector((state) => state.workout)

    const dispatch = useDispatch()
    const alerts = useAlerts()

    const [editing, setEditing] = useState(false)

    useEffect(() => {
        dispatch(getWorkouts())
    }, [dispatch])

    const onLogout = async () => {
        if (await alerts.logout()) dispatch(logout())
    }

    const onDeleteAccount = async () => {
        // Members confirm with their password; guests have none, so they only type DELETE
        const confirmed = await alerts.deleteAccount({ askPassword: !user.isGuest })
        if (!confirmed) return

        const result = await dispatch(deleteUser({ id: user._id, password: typeof confirmed === 'string' ? confirmed : undefined }))
        if (deleteUser.rejected.match(result)) {
            toast.error(result.payload || 'Your account could not be deleted')
        }
    }

    const onResetAccount = async () => {
        if (await alerts.resetAccount()) {
            dispatch(resetUser(user._id))
            dispatch(reset())
        }
    }

    if (isLoading && !user) return <Spinner />

    const displayName = user.isGuest ? 'Guest' : user.username

    return (
        <div className="mx-auto max-w-2xl space-y-4">
            <PageTitle>Profile</PageTitle>

            {user.isGuest && <GuestCard workouts={workouts} />}

            <Card as="section" aria-label="Account" className="space-y-4">
                <div className="flex items-center gap-4">
                    <span aria-hidden="true" className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-accent font-display text-3xl font-bold text-white">
                        {displayName.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                        <p className="truncate font-display text-3xl font-bold">{displayName}</p>
                        {!user.isGuest && <p className="truncate text-muted">{user.email}</p>}
                        <p className="text-sm text-muted">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>

                <Toggle useImperial={user.useImperial} />
            </Card>

            <AchievementsCard user={user} />

            <ProfileStats user={user} onEdit={() => setEditing(true)} />
            <EditDetailsDialog open={editing} user={user} onClose={() => setEditing(false)} />

            <SecurityCard />

            <Card as="section" aria-label="Session">
                <Button variant="secondary" fullWidth onClick={onLogout}>Log out</Button>
            </Card>

            <Card as="section" aria-labelledby="danger-title" className="space-y-3 border-accent-fg/40">
                <div>
                    <h2 id="danger-title" className="font-display text-2xl font-bold text-accent-fg">Danger zone</h2>
                    <p className="text-sm text-muted">These actions cannot be undone. You will be asked to type a word to confirm.</p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                    <Button variant="danger" fullWidth onClick={onResetAccount}>Reset workout data</Button>
                    <Button variant="danger" fullWidth onClick={onDeleteAccount}>Delete account</Button>
                </div>
            </Card>

            <p className="pb-2 text-center text-sm text-muted">Strive v{APP_VERSION}</p>
        </div>
    )
}

export default Profile
