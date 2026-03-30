// Games.jsx

// Imports
import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'

// Function Imports
import { getWorkouts } from '../features/workouts/workoutsSlice.js'
import { formatNumber } from '../utils/formatValues.js'

// Component Imports
import Header from '../components/headers/Header.jsx'
import Quests from '../components/games/Quests.jsx'
import Spinner from '../components/spinners/Spinner.jsx'
import ProgressBar from '../components/games/ProgressBar.jsx'

const Games = () => {
    const { user } = useSelector((state) => state.auth)
    const { workouts, isLoading } = useSelector((state) => state.workout)

    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(getWorkouts())
    }, [dispatch])

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
                <div className='bg-[#8D99AE] p-6 rounded-2xl shadow-lg text-center'>
                    <h2 className='text-[#EDF2F4] text-3xl font-bold'>
                        {user.username}
                    </h2>
                    <p className='text-[#EDF2F4] text-xl font-semibold'>
                        Level: <span className='text-[#EF233C]'>{user?.level}</span>
                    </p>
                    <p className='text-[#EDF2F4] text-xl font-semibold'>
                        Strive Points: <span className='text-[#EF233C]'>{formatNumber(user?.strivepoints, 0)} SP</span>
                    </p>

                    {/* Progress Bar */}
                    <ProgressBar />
                </div>

                {/* Quest lists */}
                <Quests />
            </div>
            )}
        </section>
    )
}

export default Games