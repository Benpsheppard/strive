// Games.jsx

// Imports
import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'

// Feature Imports
import { getWorkouts } from '../features/workouts/workoutsSlice.js'
import { getLeaderboard } from '../features/leaderboard/leaderboardSlice.js'

// Utils Imports
import { formatNumber } from '../utils/formatValues.js'

// Component Imports
import Header from '../components/headers/Header.jsx'
import Quests from '../components/games/Quests.jsx'
import Spinner from '../components/spinners/Spinner.jsx'
import ProgressBar from '../components/games/ProgressBar.jsx'
import StreakCard from '../components/games/StreakCard.jsx'
import GamesSummary from '../components/games/GamesSummary.jsx'
import Leaderboard from '../components/games/Leaderboard.jsx'

const Games = () => {
    const { user } = useSelector((state) => state.auth)
    const { workouts, isLoading } = useSelector((state) => state.workout)
    const { leaderboard } = useSelector((state) => state.leaderboard)

    const dispatch = useDispatch()
    const navigate = useNavigate()

    useEffect(() => {
        dispatch(getWorkouts())
        dispatch(getLeaderboard())
    }, [dispatch])

    useEffect(() => {
        if (!user) {
            navigate('/')
        }
    }, [user, navigate])

    if (isLoading) {
        return <Spinner />
    }

    if (user?.isGuest) {
        return (
            <section className="min-h-screen mt-0 md:mt-20 flex flex-col items-center px-4 pb-32"> 
                <Header />

                {/* Title */}
                <h1 className="text-4xl md:text-6xl font-semibold text-[#EDF2F4] text-center p-4">
                    Strive <span className='text-[#EF233C]'>Games</span>
                </h1>

                <p className="text-[#EDF2F4]">
                    Create a Strive account to access Strive Games!
                </p>

                <button className="rounded-lg bg-[#EF233C] px-4 py-2 mt-10 font-semibold text-[#EDF2F4] transition hover:bg-[#D90429]">
                    <Link to='/'>
                        Return to Home
                    </Link>
                </button>
            </section>
        )
    }

    return (
        <section className="min-h-screen mt-0 md:mt-20 flex flex-col items-center px-4 pb-32">
            <Header />

            {/* Title */}
            <h1 className="text-4xl md:text-6xl font-semibold text-[#EDF2F4] text-center p-4">
                Strive <span className='text-[#EF233C]'>Games</span>
            </h1>
            
            {workouts.length < 3 ? (
                <>
                    <p className="text-[#EDF2F4]">
                        Complete at least 3 workouts to access Strive Games!
                    </p>

                    <button className="rounded-lg bg-[#EF233C] px-4 py-2 mt-10 font-semibold text-[#EDF2F4] transition hover:bg-[#D90429]">
                        <Link to='/'>
                            New Workout
                        </Link>
                    </button>
                </>
            ) : (
                <div className='space-y-6 w-full'>
                    {/* User Games' Summary */}
                    <div className='fade-in-card' style={{ animationDelay: '0.2s' }}>
                        <GamesSummary user={user} />
                    </div>

                    {/* SP Leaderboard */}
                    {leaderboard.length > 0 && (
                        <div className='fade-in-card' style={{ animationDelay: '0.4s' }}>
                            <Leaderboard />
                        </div>
                    )}

                    {/* Quest lists */}
                    <div className='fade-in-card space-y-6' style={{ animationDelay: '0.6s' }}>
                        <Quests />
                    </div>
                </div>
            )}
        </section>
    )
}

export default Games