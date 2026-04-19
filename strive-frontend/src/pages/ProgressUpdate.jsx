// ProgressUpdate.jsx

// Imports
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { clearLastWorkoutStats } from '../features/workouts/workoutsSlice'

// Component Imports
import Header from '../components/headers/Header'
import ProgressBar from '../components/games/ProgressBar'
import { FaTrophy, FaMedal, FaStar, FaArrowUp, FaDumbbell, FaShieldAlt, FaExclamationTriangle, FaFire, FaBolt } from 'react-icons/fa'

const ProgressUpdate = () => {
    const { user } = useSelector((state) => state.auth)
    const { lastWorkoutStats } = useSelector((state) => state.workout)

    const navigate = useNavigate()
    const dispatch = useDispatch()

    const workout = lastWorkoutStats?.workout
    const levelUp = lastWorkoutStats?.levelUp
    const streakIncreased = lastWorkoutStats?.streakIncreased
    const shieldEarned = lastWorkoutStats?.shieldEarned
    const shieldUsed = lastWorkoutStats?.shieldUsed
    const streakBroken = lastWorkoutStats?.streakBroken
    const momentumGained = lastWorkoutStats?.momentumGained    

    useEffect(() => {
        if (!lastWorkoutStats) {
            navigate('/')
        }
    }, [lastWorkoutStats, navigate])

    const onHome = () => {
        dispatch(clearLastWorkoutStats())
        navigate('/')
    }

    const onProgress = () => {
        dispatch(clearLastWorkoutStats())
        navigate('/progress')
    }

    return (
        <section className="min-h-screen mt-0 md:mt-20 flex flex-col items-center px-4 pb-32">
			<Header />

            <div className="text-4xl md:text-6xl font-semibold text-[#EDF2F4] text-center p-4">
                <h1>
                    Progress <span className="text-[#EF233C]">Update</span>
                </h1>
            </div>  

            <div className="w-full max-w-2xl space-y-4">
                {/* Level Up */}
                {levelUp && (
                    <div className="bg-[#EF233C] rounded-2xl px-6 py-5 text-center shadow-lg animate-pulse">
                        <FaArrowUp className="text-[#EDF2F4] text-3xl mx-auto mb-2" />
                        <p className="text-[#EDF2F4] text-2xl font-bold">Level Up!</p>
                        <p className="text-[#EDF2F4] opacity-80 text-lg">You are now Level {levelUp}!</p>
                    </div>
                )}

                {/* Momentum Increased */}
                {momentumGained && (
                    <div className="bg-[#EF233C] rounded-2xl px-6 py-5 text-center shadow-lg">
                        <FaBolt className="text-[#EDF2F4] text-3xl mx-auto mb-2" />
                        <p className="text-[#EDF2F4] text-2xl font-bold">Momentum Increased!</p>
                        <p className="text-[#EDF2F4] opacity-80 text-lg">
                            +{momentumGained} Momentum! Keep it up!
                        </p>
                        <ProgressBar numerator={user.momentum.current} denominator={100} />
                    </div>
                )}

                {/* Streak Maintained */}
                {streakIncreased && (
                    <div className="bg-[#EF233C] rounded-2xl px-6 py-5 text-center shadow-lg">
                        <FaFire className="text-[#EDF2F4] text-3xl mx-auto mb-2" />
                        <p className="text-[#EDF2F4] text-2xl font-bold">Streak Maintained!</p>
                        <p className="text-[#EDF2F4] opacity-80 text-lg">
                            You are now on a {user.streak.current} week streak!
                        </p>
                    </div>
                )}

                {/* Shield Earned */}
                {shieldEarned && (
                    <div className="bg-[#8D99AE] rounded-2xl px-6 py-5 text-center shadow-lg">
                        <FaShieldAlt className="text-[#EDF2F4] text-3xl mx-auto mb-2" />
                        <p className="text-[#EDF2F4] text-xl font-bold">Streak Shield Earned!</p>
                        <p className="text-[#EDF2F4]/70">
                            This shield will protect your streak if you miss a week.
                        </p>
                    </div>
                )}

                {/* Shield Used */}
                {shieldUsed && (
                    <div className="bg-[#8D99AE] rounded-2xl px-6 py-5 text-center shadow-lg">
                        <FaShieldAlt className="text-[#EDF2F4] text-3xl mx-auto mb-2" />
                        <p className="text-[#EDF2F4] text-xl font-bold">Shield Activated</p>
                        <p className="text-[#EDF2F4]/70">
                            Your streak was protected this week.
                        </p>
                    </div>
                )}

                {/* Streak Broken */}
                {streakBroken && (
                    <div className="bg-[#2B2D42] rounded-2xl px-6 py-5 text-center shadow-lg">
                        <FaExclamationTriangle className="text-[#EDF2F4] text-3xl mx-auto mb-2" />
                        <p className="text-[#EDF2F4] text-xl font-bold">Streak Reset</p>
                        <p className="text-[#EDF2F4]/70">
                            Missed your weekly target. Start a new streak this week!
                        </p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-col gap-3 pt-2">
                    <button onClick={onHome} className="w-full bg-[#EF233C] text-[#EDF2F4] py-3 rounded-xl font-semibold transition hover:bg-[#D90429]">
                        Back to Home
                    </button>
                    <button onClick={onProgress} className="w-full bg-[#8D99AE] text-[#EDF2F4] py-3 rounded-xl font-semibold transition hover:bg-[#EF233C]">
                        View Progress
                    </button>
                </div>
            </div>
        </section>
    )
}

export default ProgressUpdate