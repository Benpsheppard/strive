// StreakUpdate.jsx

// Imports
import { useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { clearLastWorkoutStats } from '../features/workouts/workoutsSlice'
import { FaFire, FaShieldAlt, FaExclamationTriangle } from 'react-icons/fa'

// Component Imports
import Header from '../components/headers/Header'

const StreakUpdate = () => {
    const { user } = useSelector((state) => state.auth)
    const { lastWorkoutStats } = useSelector((state) => state.workout)

    const navigate = useNavigate()
    const dispatch = useDispatch()

    const streakIncreased = lastWorkoutStats?.streakIncreased
    const shieldEarned = lastWorkoutStats?.shieldEarned
    const shieldUsed = lastWorkoutStats?.shieldUsed
    const streakBroken = lastWorkoutStats?.streakBroken

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
                    Streak <span className="text-[#EF233C]">Update</span>
                </h1>
            </div>  

            <div className="w-full max-w-2xl flex flex-col flex-grow space-y-4">
                {/* Streak Maintained */}
                {streakIncreased && (
                    <div className="fade-in-card flex-1 flex flex-col bg-[#8D99AE] rounded-2xl px-6 py-5 text-center justify-center shadow-lg" style={{ animationDelay: '0.2s' }}>
                        <FaFire className="pulse text-[#EF233C] text-9xl mx-auto mb-5" style={{ "--glow-colour": "#EF233C" }} />
                        <p className="text-[#EDF2F4] text-3xl font-bold">
                            Streak Maintained!
                        </p>
                        <p className="text-[#EDF2F4] opacity-80 text-xl">
                            You are now on a {user.streak.current} week streak!
                        </p>
                    </div>
                )}

                {/* Shield Earned */}
                {shieldEarned && (
                    <div className="fade-in-card flex-1 flex flex-col bg-[#8D99AE] rounded-2xl px-6 py-5 text-center justify-center shadow-lg" style={{ animationDelay: '0.2s' }}>
                        <FaShieldAlt className="text-[#EDF2F4] text-3xl mx-auto mb-5" />
                        <p className="text-[#EDF2F4] text-xl font-bold">
                            Streak Shield Earned!
                        </p>
                        <p className="text-[#EDF2F4]/70">
                            This shield will protect your streak if you miss a week.
                        </p>
                    </div>
                )}

                {/* Shield Used */}
                {shieldUsed && (
                    <div className="fade-in-card flex-1 flex flex-col bg-[#8D99AE] rounded-2xl px-6 py-5 text-center justify-center shadow-lg" style={{ animationDelay: '0.2s' }}>
                        <FaShieldAlt className="text-[#EDF2F4] text-3xl mx-auto mb-5" />
                        <p className="text-[#EDF2F4] text-xl font-bold">
                            Shield Activated
                        </p>
                        <p className="text-[#EDF2F4]/70">
                            Your streak was protected this week.
                        </p>
                    </div>
                )}

                {/* Streak Broken */}
                {streakBroken && (
                    <div className="fade-in-card flex-1 flex flex-col bg-[#8D99AE] rounded-2xl px-6 py-5 text-center justify-center shadow-lg" style={{ animationDelay: '0.2s' }}>
                        <FaExclamationTriangle className="text-[#EDF2F4] text-3xl mx-auto mb-5" />
                        <p className="text-[#EDF2F4] text-xl font-bold">
                            Streak Reset
                        </p>
                        <p className="text-[#EDF2F4]/70">
                            Missed your weekly target. Start a new streak this week!
                        </p>
                    </div>
                )}

                <div className='fade-in-card space-y-3' style={{ animationDelay: '0.4s' }}>
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

export default StreakUpdate