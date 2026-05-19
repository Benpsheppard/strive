// NewWorkout.jsx

// Imports
import { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

// Feature Imports
import { getWorkouts } from '../features/workouts/workoutsSlice.js'
import { getExercises } from '../features/exercises/exerciseSlice.js'
import { updateStreak, updateMomentum } from '../features/auth/authSlice.js'

// Alert Imports
import { showCancelWorkoutAlert, showChangeExerciseAlert, showMomentumDroppedAlert, showStreakBrokenAlert, showShieldUsedAlert } from '../alerts/workout.js'

// Hook Imports
import { useLocalStorage } from '../hooks/useLocalStorage.js'
import { useWorkoutSubmit } from '../hooks/useWorkoutSubmit.js'
import { useRestTimer } from '../hooks/useRestTimer.js'

// Component Imports
import Header from '../components/headers/Header.jsx'
import Spinner from '../components/spinners/Spinner.jsx'
import ExerciseList from '../components/workouts/ExerciseList.jsx'
import Timer from '../components/workouts/Timer.jsx'
import WorkoutDashBoard from '../components/workouts/WorkoutDashboard.jsx'
import ExerciseForm from '../components/workouts/ExerciseForm.jsx'

// Constants
import { EMPTY_EXERCISE, EMPTY_SET } from '../utils/constants.js'

const NewWorkout = () => {
    const { user } = useSelector((state) => state.auth)
    const { workouts, isLoading, isError, message } = useSelector((state) => state.workout)
	const { exercises: allExercises } = useSelector((state) => state.exercise)

    const dispatch = useDispatch()
    const navigate = useNavigate()

    // Persisted state
    const [title, setTitle] = useLocalStorage('newWorkout_title', '')
    const [exercises, setExercises] = useLocalStorage('newWorkout_exercises', [])
    const [currentExercise, setCurrentExercise] = useLocalStorage('newWorkout_currentExercise', EMPTY_EXERCISE)
    const [currentSet, setCurrentSet] = useLocalStorage('newWorkout_currentSet', EMPTY_SET)
    const [started, setStarted] = useLocalStorage('newWorkout_started', false)
    const [startTime, setStartTime] = useLocalStorage('newWorkout_startTime', null)
    const [restTimerDuration, setRestTimerDuration] = useLocalStorage('newWorkout_restTimer', 60)
    const [setHistory, setSetHistory] = useLocalStorage('newWorkout_setHistory', [])

    // Local state
    const [isSubmittingWorkout, setIsSubmittingWorkout] = useState(false)

    // Refs
    const hasCheckedGamification = useRef(false)

    // Reset workout state
    const resetWorkoutState = () => {
        setTitle('')
        setExercises([])
        setCurrentExercise(EMPTY_EXERCISE)
        setCurrentSet(EMPTY_SET)
        setStarted(false)
        setStartTime(null)
        setSetHistory([])

        localStorage.removeItem('newWorkout_title')
        localStorage.removeItem('newWorkout_exercises')
        localStorage.removeItem('newWorkout_currentExercise')
        localStorage.removeItem('newWorkout_currentSet')
        localStorage.removeItem('newWorkout_started')
        localStorage.removeItem('newWorkout_startTime')
        localStorage.removeItem('newWorkout_setHistory')
    }

    // Check streak & momentum on mount
    useEffect(() => {
        if (!user || hasCheckedGamification.current) return
        hasCheckedGamification.current = true

        const oldStreak = user.streak?.current ?? 0
        const hadShield = user.streak?.shield ?? false
        const oldMomentum = user.momentum?.current ?? 0

        const checkGamification = async () => {
            const [updatedUserAfterStreak, updatedUserAfterMomentum] = await Promise.all([
                dispatch(updateStreak(user._id)).unwrap(),
                dispatch(updateMomentum({})).unwrap()
            ])

            const streakBroken = updatedUserAfterStreak.streak.current === 0 && oldStreak > 0
            const shieldUsed = hadShield && !updatedUserAfterStreak.streak.shield

            if (shieldUsed) showShieldUsedAlert()
            else if (streakBroken) showStreakBrokenAlert(oldStreak)

            if (updatedUserAfterMomentum.momentum.current < oldMomentum) {
                showMomentumDroppedAlert(updatedUserAfterMomentum.momentum.current)
            }
        }

        checkGamification()
    }, [user])    

    // Initial data fetch
    useEffect(() => {
        if (isError) { console.log(message); return }
        if (!user) { navigate('/login'); return }
        dispatch(getWorkouts())
		dispatch(getExercises())
    }, [user, message, isError, navigate, dispatch])

    // ----- REST TIMER -----
    const { restTimeRemaining, startRestTimer, skipTimer } = useRestTimer(restTimerDuration)

    // ----- WORKOUTS -----
    const { submitWorkout } = useWorkoutSubmit({ title, exercises, startTime, resetWorkoutState})

    const onSubmit = async () => {
        setIsSubmittingWorkout(true)
        await submitWorkout()
        setIsSubmittingWorkout(false)
    }

    const onCancel = () => {
        showCancelWorkoutAlert()
        .then((result) => {
            if (result.isConfirmed) {
                resetWorkoutState()
                toast.success('Workout cancelled successfully')
            }
        })
    }

    const startWorkout = () => {
        if (user.isGuest && workouts.length >= 5) {
            toast.error('Guest accounts are limited to 5 workouts. Create a free Strive account for unlimited access!')
            return
        }
        if (user.isGuest && workouts.length === 2) {
            toast.info('Enjoying Strive? Consider creating a free account for unlimited workouts!')
        }
        setStarted(true)
        setStartTime(Date.now())
    }

    if (isLoading || !user || isSubmittingWorkout) return <Spinner />

    return (
        <section className="min-h-screen mt-0 md:mt-20 flex flex-col items-center px-4 pb-32">
            <Header />

            {!started && (
                <WorkoutDashBoard 
                    user={user}
                    workouts={workouts}
                    startWorkout={startWorkout}
                />
            )}

            {started && (
                <section className="space-y-3 w-full max-w-2xl">
                    <div className="text-4xl md:text-6xl font-semibold text-[#EDF2F4] text-center p-4">
                        <h1>New <span className="text-[#EF233C]">Workout</span></h1>
                    </div>

                    <Timer 
                        started={started} 
                        startTime={startTime} 
                        restTimerDuration={restTimerDuration} 
                        setRestTimerDuration={setRestTimerDuration} 
                        restTimeRemaining={restTimeRemaining}
                        skipTimer={skipTimer}
                    />

                    <div className="card-theme p-6 w-full sm:max-w-2xl mx-auto bg-[#8D99AE] shadow rounded-2xl">
                        {/* Workout Title */}
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Workout Title *"
                            className="w-full rounded-lg border border-[#EDF2F4]/40 bg-[#2B2D42] px-4 py-2 mb-3 text-[#EDF2F4] text-center placeholder-gray-300 focus:border-[#EF233C] focus:outline-none focus:ring-2 focus:ring-[#EF233C]/40"
                        />                        

                        {/* Exercise Form */}
                        <ExerciseForm 
                            useImperial={user.useImperial}
                            currentExercise={currentExercise}
                            setCurrentExercise={setCurrentExercise}
                            currentSet={currentSet}
                            setCurrentSet={setCurrentSet}
                            setHistory={setHistory}
                            setSetHistory={setSetHistory}
                            exercises={exercises}
                            setExercises={setExercises}
                            allExercises={allExercises}
                            restTimerDuration={restTimerDuration}
                            startRestTimer={startRestTimer}
                        />

                        {/* Exercises List */}
                        <ExerciseList exercises={exercises} useImperial={user.useImperial} />
                    </div>

                    {/* Submit / Cancel */}
                    <div className="space-y-4 p-4 w-full sm:max-w-2xl mx-auto bg-[#8D99AE] shadow rounded-2xl flex flex-col items-center">
                        <button onClick={onSubmit} className="w-full bg-[#EF233C] text-[#EDF2F4] p-2 rounded transition hover:bg-[#D90429]">
                            End Workout
                        </button>
                        <button onClick={onCancel} className="w-full bg-[#8D99AE] border-2 border-[#EF233C] text-[#EDF2F4] p-2 rounded transition hover:bg-[#EF233C]">
                            Cancel Workout
                        </button>
                    </div>
                </section>
            )}
        </section>
    )
}

export default NewWorkout