// StreakUpdate.jsx
// Streak and shield news after a workout

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { FaFire, FaShieldAlt, FaExclamationTriangle } from 'react-icons/fa'

import { clearLastWorkoutStats } from '../features/workouts/workoutsSlice'

import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import PageTitle from '../components/ui/PageTitle.jsx'

const Notice = ({ icon: Icon, iconClass, title, children }) => (
    <Card as="section" aria-label={title} className="space-y-2 py-8 text-center">
        <Icon aria-hidden="true" className={`mx-auto text-7xl ${iconClass}`} />
        <p className="font-display text-3xl font-bold">{title}</p>
        <p className="text-lg text-muted">{children}</p>
    </Card>
)

const StreakUpdate = () => {
    const { user } = useSelector((state) => state.auth)
    const { lastWorkoutStats } = useSelector((state) => state.workout)

    const navigate = useNavigate()
    const dispatch = useDispatch()

    useEffect(() => {
        if (!lastWorkoutStats) navigate('/', { replace: true })
    }, [lastWorkoutStats, navigate])

    const finish = (path) => {
        dispatch(clearLastWorkoutStats())
        navigate(path)
    }

    return (
        <div className="mx-auto max-w-2xl space-y-4">
            <PageTitle accent="update">Streak</PageTitle>

            {lastWorkoutStats?.streakIncreased && (
                <Notice icon={FaFire} iconClass="pulse text-accent-fg" title="Streak maintained!">
                    You are on a {user.streak.current} week streak.
                </Notice>
            )}

            {lastWorkoutStats?.shieldEarned && (
                <Notice icon={FaShieldAlt} iconClass="text-success" title="Streak shield earned!">
                    This shield will protect your streak if you miss a week.
                </Notice>
            )}

            {lastWorkoutStats?.shieldUsed && (
                <Notice icon={FaShieldAlt} iconClass="text-secondary" title="Shield activated">
                    Your streak was protected this week.
                </Notice>
            )}

            {lastWorkoutStats?.streakBroken && (
                <Notice icon={FaExclamationTriangle} iconClass="text-warning" title="Streak reset">
                    You missed your weekly target. Start a new streak this week!
                </Notice>
            )}

            <div className="space-y-3">
                <Button size="lg" fullWidth onClick={() => finish('/')}>Back to home</Button>
                <Button variant="secondary" fullWidth onClick={() => finish('/progress')}>View progress</Button>
            </div>
        </div>
    )
}

export default StreakUpdate
