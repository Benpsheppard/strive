// Games.jsx

// Imports
import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { FaGamepad, FaDumbbell } from 'react-icons/fa'

// Feature Imports
import { getWorkouts } from '../features/workouts/workoutsSlice.js'

// Component Imports
import Spinner from '../components/spinners/Spinner.jsx'
import PageTitle from '../components/ui/PageTitle.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import Quests from '../components/games/Quests.jsx'
import GamesSummary from '../components/games/GamesSummary.jsx'
import Leaderboard from '../components/games/Leaderboard.jsx'
import StreakCard from '../components/games/StreakCard.jsx'
import MomentumCard from '../components/games/MomentumCard.jsx'
import BonusCard from '../components/games/BonusCard.jsx'

const MIN_WORKOUTS = 3

const Games = () => {
    const { user } = useSelector((state) => state.auth)
    const { workouts, isLoading } = useSelector((state) => state.workout)

    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(getWorkouts())
    }, [dispatch])

    if (isLoading && workouts.length === 0) return <Spinner />

    if (user.isGuest) {
        return (
            <>
                <PageTitle accent="Games">Strive</PageTitle>
                <EmptyState
                    icon={FaGamepad}
                    title="Games are for members"
                    message="Create a free account to unlock quests, the weekly leaderboard, streaks and momentum. Everything you have logged as a guest comes with you."
                    actionLabel="Create free account"
                    actionTo="/migrate"
                />
            </>
        )
    }

    if (workouts.length < MIN_WORKOUTS) {
        return (
            <>
                <PageTitle accent="Games">Strive</PageTitle>
                <EmptyState
                    icon={FaDumbbell}
                    title={`Complete ${MIN_WORKOUTS} workouts to unlock Games`}
                    message={`You have completed ${workouts.length} so far. Quests are written from your recent training, so they need a little history first.`}
                    actionLabel="Start a workout"
                    actionTo="/"
                />
            </>
        )
    }

    return (
        <div className="space-y-4">
            <PageTitle accent="Games">Strive</PageTitle>

            <GamesSummary user={user} />

            <div className="grid gap-4 md:grid-cols-3">
                <StreakCard user={user} />
                <BonusCard user={user} workouts={workouts} />
                <MomentumCard user={user} />
            </div>

            <Leaderboard />

            <Quests />
        </div>
    )
}

export default Games
