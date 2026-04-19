// WorkoutComplete.jsx

// Imports
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { FaTrophy, FaMedal, FaStar, FaArrowUp, FaDumbbell, FaShieldAlt, FaExclamationTriangle, FaFire, FaBolt } from 'react-icons/fa'
import { formatDuration, formatWeight } from '../utils/formatValues'

// Function Imports
import { getWorkouts, reset } from '../features/workouts/workoutsSlice'

// Component Imports
import Header from '../components/headers/Header'
import Spinner from '../components/spinners/Spinner'
import GuestCard from '../components/guest/GuestCard'
import ProgressBar from '../components/games/ProgressBar'

const WorkoutComplete = () => {
    const { user } = useSelector((state) => state.auth)
    const { workouts, lastWorkoutStats, isLoading, message, isError } = useSelector((state) => state.workout)

    const navigate = useNavigate()
    const dispatch = useDispatch()

    const workout = lastWorkoutStats?.workout

    useEffect(() => {
        if (!isLoading && !lastWorkoutStats?.workout) {
            navigate('/')
        }
    }, [isLoading, workout, navigate])

    useEffect(() => {
		if (isError) {
			console.log(message)
			return
		}

		if (!user) {
			navigate('/login')
			return
		}

		dispatch(getWorkouts())
	}, [user, message, isError, navigate, dispatch])

    const onContinue = () => {
        if (lastWorkoutStats.levelUp || 
            lastWorkoutStats.streakIncreased ||
            lastWorkoutStats.momentumGained ||
            lastWorkoutStats.shieldEarned ||
            lastWorkoutStats.shieldUsed ||
            lastWorkoutStats.streakBroken) {
                navigate('/progress-update')
            } else {
                navigate('/')
            }
    }

    if (isLoading || !lastWorkoutStats?.workout) {
        return <Spinner />
    }

    return (
        <section className="min-h-screen mt-0 md:mt-20 flex flex-col items-center px-4 pb-32">
			<Header />

            <div className="text-4xl md:text-6xl font-semibold text-[#EDF2F4] text-center p-4">
                <h1>
                    Workout <span className="text-[#EF233C]">Completed!</span>
                </h1>
                <p className="text-[#EDF2F4]/40 text-lg">{workout.title}</p>
            </div>            

            <div className="w-full max-w-2xl space-y-4">

                {/* Guest Card */}
                {user?.isGuest && 
                    <GuestCard workouts={workouts} isMigrate={false} />
                }

                {/* Workout Stats */}
                <div className="bg-[#8D99AE] rounded-2xl px-6 py-5">
                    <h2 className="text-[#EDF2F4] font-semibold text-lg mb-4 flex items-center gap-2">
                        <FaDumbbell className="text-[#EF233C]" /> Workout Stats
                    </h2>
                    <div className="grid grid-cols-4 gap-4 text-center">
                        <div>
                            <p className="text-[#EF233C] text-2xl font-bold">{formatDuration(workout.duration)}</p>
                            <p className="text-[#EDF2F4]/40 text-xs mt-1">Duration</p>
                        </div>
                        <div>
                            <p className="text-[#EF233C] text-2xl font-bold">{workout.exercises.length}</p>
                            <p className="text-[#EDF2F4]/40 text-xs mt-1">Exercises</p>
                        </div>
                        <div>
                            <p className="text-[#EF233C] text-2xl font-bold">
                                {workout.exercises.reduce((acc, ex) => acc + (ex.sets?.length || 0), 0)}
                            </p>
                            <p className="text-[#EDF2F4]/40 text-xs mt-1">Sets</p>
                        </div>
                        <div>
                            <p className="text-[#EF233C] text-2xl font-bold">{formatWeight(workout.summary.totalWeight, user.useImperial)}</p>
                            <p className="text-[#EDF2F4]/40 text-xs mt-1">Lifted</p>
                        </div>
                    </div>
                </div>

                {/* Strive Points Earned */}
                <div className="bg-[#8D99AE] rounded-2xl px-6 py-5">
                    <h2 className="text-[#EDF2F4] font-semibold text-lg mb-4 flex items-center gap-2">
                        <FaStar className="text-[#EF233C]" /> Strive Points Earned
                    </h2>
                    <div className="text-center">
                        <p className="text-[#EF233C] text-5xl font-bold">+{workout.summary.totalStrivePoints}</p>
                        <p className="text-[#EDF2F4]/40 text-sm mt-1">Strive Points</p>
                    </div>
                </div>

                {/* PBs */}
                {workout.summary.personalBests.length > 0 && (
                    <div className="bg-[#8D99AE] rounded-2xl px-6 py-5">
                        <h2 className="text-[#EDF2F4] font-semibold text-lg mb-4 flex items-center gap-2">
                            <FaTrophy className="text-[#EF233C]" /> Personal Bests
                        </h2>
                        <div className="space-y-3">
                            {workout.summary.personalBests.map((pb, index) => (
                                <div key={index} className="bg-[#2B2D42] rounded-xl px-4 py-3 flex justify-between items-center">
                                    <div>
                                        <p className="text-[#EDF2F4] font-semibold">{pb.exercise}</p>
                                        <p className="text-[#EDF2F4]/40 text-sm">
                                            {formatWeight(pb.previousValue, user.useImperial)} → <span className="text-[#EF233C] font-bold">{formatWeight(pb.newValue, user.useImperial)}</span>
                                        </p>
                                    </div>
                                    <p className="text-[#EF233C] font-bold">+500 SP</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Quests Completed */}
                {workout.summary.questsCompleted.length > 0 && (
                    <div className="bg-[#8D99AE] rounded-2xl px-6 py-5">
                        <h2 className="text-[#EDF2F4] font-semibold text-lg mb-4 flex items-center gap-2">
                            <FaMedal className="text-[#EF233C]" /> Quests Completed
                        </h2>
                        <div className="space-y-3">
                            {workout.summary.questsCompleted.map((quest, index) => (
                                <div key={index} className="bg-[#2B2D42] rounded-xl px-4 py-3 flex justify-between items-center">
                                    <p className="text-[#EDF2F4] font-semibold">{quest.title}</p>
                                    <p className="text-[#EF233C] font-bold">+{quest.reward} SP</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-col gap-3 pt-2">
                    <button onClick={onContinue} className="w-full bg-[#EF233C] text-[#EDF2F4] py-3 rounded-xl font-semibold transition hover:bg-[#D90429]">
                        Continue
                    </button>
                    <button onClick={() => navigate('/progress')} className="w-full bg-[#8D99AE] text-[#EDF2F4] py-3 rounded-xl font-semibold transition hover:bg-[#EF233C]">
                        View Progress
                    </button>
                </div>
            </div>
        </section>
    )
}

export default WorkoutComplete