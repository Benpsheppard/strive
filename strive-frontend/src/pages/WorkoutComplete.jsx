// WorkoutComplete.jsx

// Imports
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { FaTrophy, FaMedal, FaStar, FaArrowUp, FaDumbbell, FaShieldAlt, FaExclamationTriangle, FaFire, FaBolt } from 'react-icons/fa'

// Util Imports
import { formatDuration, formatWeight } from '../utils/formatValues'

// Function Imports
import { getWorkouts, reset } from '../features/workouts/workoutsSlice'

// Component Imports
import Header from '../components/headers/Header'
import Spinner from '../components/spinners/Spinner'
import GuestCard from '../components/guest/GuestCard'
import ProgressBar from '../components/games/ProgressBar'
import StrivePointsEarned from '../components/workout-complete/StrivePointsEarned'
import WorkoutStats from '../components/workout-complete/WorkoutStats'
import PBDisplay from '../components/workout-complete/PBDisplay'
import QuestsCompleted from '../components/workout-complete/QuestsCompleted'

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
        if (hasStats) {
            navigate('/progress-update')
        } else {
            navigate('/')
        }
    }

    if (isLoading || !lastWorkoutStats?.workout) {
        return <Spinner />
    }

    const hasStats = lastWorkoutStats.levelUp || lastWorkoutStats.streakIncreased || 
    lastWorkoutStats.momentumGained || lastWorkoutStats.shieldEarned || 
    lastWorkoutStats.shieldUsed || lastWorkoutStats.streakBroken

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
                <WorkoutStats workout={workout} user={user} />

                {/* Strive Points Earned */}
                <StrivePointsEarned workout={workout} />

                {/* PBs */}
                <PBDisplay workout={workout} user={user} />

                {/* Quests Completed */}
                <QuestsCompleted workout={workout} />

                {/* Actions */}
                <div className="fade-in-card flex flex-col gap-3 pt-2" style={{ animationDelay: '1.0s' }}>
                    <button onClick={onContinue} className="w-full bg-[#EF233C] text-[#EDF2F4] py-3 rounded-xl font-semibold transition hover:bg-[#D90429]">
                        Continue
                    </button>

                    {!hasStats && (
                        <button onClick={() => navigate('/progress')} className="w-full bg-[#8D99AE] text-[#EDF2F4] py-3 rounded-xl font-semibold transition hover:bg-[#EF233C]">
                            View Progress
                        </button>
                    )}
                </div>
            </div>
        </section>
    )
}

export default WorkoutComplete