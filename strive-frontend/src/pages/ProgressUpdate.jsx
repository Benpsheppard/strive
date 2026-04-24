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
    const momentumGained = lastWorkoutStats?.momentumGained 

    const hasStreakStats = lastWorkoutStats?.streakIncreased || lastWorkoutStats?.shieldEarned || lastWorkoutStats?.shieldUsed || lastWorkoutStats?.streakBroken

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

            <div className="w-full max-w-2xl flex flex-col flex-grow space-y-4">
                {/* Level Up */}
                {levelUp && (
                    <div className="fade-in-card flex-1 flex flex-col bg-[#EF233C] rounded-2xl px-6 py-5 space-y-2 text-center justify-center shadow-lg" style={{ animationDelay: '0.2s' }}>
                        <FaArrowUp className="jump text-[#EDF2F4] text-9xl mx-auto mb-5" />
                        <p className="text-[#EDF2F4] text-2xl font-bold">Level Up!</p>
                        <p className="text-[#EDF2F4] opacity-80 text-lg">You are now Level {levelUp}!</p>
                    </div>
                )}

                {/* Momentum Increased */}
                {momentumGained > 0 && (
                    <div className="fade-in-card flex-1 flex flex-col bg-[#8D99AE] rounded-2xl px-6 py-5 space-y-2 text-center justify-center shadow-lg" style={{ animationDelay: '0.4s' }}>
                        <FaBolt className="jitter text-[#EDF2F4] text-9xl mx-auto mb-5" />
                        <p className="text-[#EDF2F4] text-2xl font-bold">Momentum Increased!</p>
                        <p className="text-[#EDF2F4] opacity-80 text-lg">
                            +{momentumGained} Momentum! Keep it up!
                        </p>
                        <ProgressBar numerator={user.momentum.current} denominator={100} />
                    </div>
                )}

                {/* Actions */}
                <div className="fade-in-card space-y-3" style={{ animationDelay: '0.6s' }}>
                    {hasStreakStats ? (
                        <button onClick={() => navigate('/streaks')} className="w-full bg-[#EF233C] text-[#EDF2F4] py-3 rounded-xl font-semibold transition hover:bg-[#D90429]">
                            Continue
                        </button>
                    ) : (
                        <>
                            <button onClick={onHome} className="w-full bg-[#EF233C] text-[#EDF2F4] py-3 rounded-xl font-semibold transition hover:bg-[#D90429]">
                                Back to Home
                            </button>
                            
                            <button onClick={onProgress} className="w-full bg-[#8D99AE] text-[#EDF2F4] py-3 rounded-xl font-semibold transition hover:bg-[#EF233C]">
                                View Progress
                            </button>
                        </>
                    )}
                </div>
            </div>
        </section>
    )
}

export default ProgressUpdate