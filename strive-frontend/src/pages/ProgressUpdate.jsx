// ProgressUpdate.jsx
// Level-up and momentum news after a workout

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { FaStar, FaBolt } from 'react-icons/fa'

import { clearLastWorkoutStats } from '../features/workouts/workoutsSlice'

import ProgressBar from '../components/games/ProgressBar'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import PageTitle from '../components/ui/PageTitle.jsx'

const ProgressUpdate = () => {
    const { user } = useSelector((state) => state.auth)
    const { lastWorkoutStats } = useSelector((state) => state.workout)

    const navigate = useNavigate()
    const dispatch = useDispatch()

    const levelUp = lastWorkoutStats?.levelUp
    const momentumGained = lastWorkoutStats?.momentumGained

    const hasStreakStats = lastWorkoutStats?.streakIncreased || lastWorkoutStats?.shieldEarned ||
        lastWorkoutStats?.shieldUsed || lastWorkoutStats?.streakBroken

    useEffect(() => {
        if (!lastWorkoutStats) navigate('/', { replace: true })
    }, [lastWorkoutStats, navigate])

    const finish = (path) => {
        dispatch(clearLastWorkoutStats())
        navigate(path)
    }

    return (
        <div className="mx-auto max-w-2xl space-y-4">
            <PageTitle accent="update">Progress</PageTitle>

            {levelUp && (
                <Card as="section" aria-label="Level up" className="space-y-2 py-8 text-center">
                    <FaStar aria-hidden="true" className="jump mx-auto text-8xl text-warning" />
                    <p className="font-display text-4xl font-bold">Level up!</p>
                    <p className="text-lg text-muted">You are now level {levelUp}.</p>
                </Card>
            )}

            {momentumGained > 0 && (
                <Card as="section" aria-label="Momentum" className="space-y-3 py-8 text-center">
                    <FaBolt aria-hidden="true" className="jitter mx-auto text-7xl text-secondary" />
                    <p className="font-display text-3xl font-bold">Momentum up!</p>
                    <p className="text-lg text-muted">+{momentumGained} momentum. Keep it going!</p>
                    <ProgressBar numerator={user.momentum.current} denominator={100} label="Momentum" />
                </Card>
            )}

            <div className="space-y-3">
                {hasStreakStats ? (
                    <Button size="lg" fullWidth onClick={() => navigate('/streaks')}>Continue</Button>
                ) : (
                    <>
                        <Button size="lg" fullWidth onClick={() => finish('/')}>Back to home</Button>
                        <Button variant="secondary" fullWidth onClick={() => finish('/progress')}>View progress</Button>
                    </>
                )}
            </div>
        </div>
    )
}

export default ProgressUpdate
