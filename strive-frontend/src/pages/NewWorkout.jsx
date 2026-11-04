// NewWorkout.jsx

// Imports
import { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

// Feature Imports
import { getWorkouts } from '../features/workouts/workoutsSlice.js'
import { getExercises } from '../features/exercises/exerciseSlice.js'
import { updateMomentum, checkIfStreakBroken } from '../features/auth/authSlice.js'

// Hook Imports
import { useLocalStorage } from '../hooks/useLocalStorage.js'
import { useWorkoutSubmit } from '../hooks/useWorkoutSubmit.js'
import { useRestTimer } from '../hooks/useRestTimer.js'
import { useAlerts } from '../hooks/useAlerts.js'

// Component Imports
import Header from '../components/headers/Header.jsx'
import Spinner from '../components/spinners/Spinner.jsx'
import ExerciseList from '../components/workouts/ExerciseList.jsx'
import Timer from '../components/workouts/Timer.jsx'
import WorkoutDashBoard from '../components/workouts/WorkoutDashboard.jsx'
import ExerciseForm from '../components/workouts/ExerciseForm.jsx'
import RollingStats from '../components/workouts/RollingStats.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'
import PageTitle from '../components/ui/PageTitle.jsx'

// Utils
import { EMPTY_EXERCISE } from '../utils/constants.js'
import { setToRaw } from '../utils/trackingModes.js'

const DRAFT_KEYS = [
    'newWorkout_title', 'newWorkout_exercises', 'newWorkout_currentExercise', 'newWorkout_currentSet',
    'newWorkout_started', 'newWorkout_startTime', 'newWorkout_setHistory'
]

const NewWorkout = () => {
    const { user } = useSelector((state) => state.auth)
    const { workouts, isLoading, isError, message } = useSelector((state) => state.workout)
    const { exercises: allExercises } = useSelector((state) => state.exercise)

    const dispatch = useDispatch()
    const navigate = useNavigate()
    const alerts = useAlerts()

    // Persisted state (survives a refresh or a closed tab mid-workout)
    const [title, setTitle] = useLocalStorage('newWorkout_title', '')
    const [exercises, setExercises] = useLocalStorage('newWorkout_exercises', [])
    const [currentExercise, setCurrentExercise] = useLocalStorage('newWorkout_currentExercise', EMPTY_EXERCISE)
    const [currentSet, setCurrentSet] = useLocalStorage('newWorkout_currentSet', {})
    const [started, setStarted] = useLocalStorage('newWorkout_started', false)
    const [startTime, setStartTime] = useLocalStorage('newWorkout_startTime', null)
    const [restTimerDuration, setRestTimerDuration] = useLocalStorage('newWorkout_restTimer', 60)

    // Local state
    const [isSubmittingWorkout, setIsSubmittingWorkout] = useState(false)

    // Refs
    const hasCheckedGamification = useRef(false)

    // Reset workout state. The persisted values are cleared by their own effects, so only
    // state needs resetting here; the keys are removed after React has written the new values.
    const resetWorkoutState = () => {
        setTitle('')
        setExercises([])
        setCurrentExercise(EMPTY_EXERCISE)
        setCurrentSet({})
        setStarted(false)
        setStartTime(null)
        setTimeout(() => DRAFT_KEYS.forEach(key => localStorage.removeItem(key)), 0)
    }

    // Check streak & momentum on mount
    useEffect(() => {
        if (!user || !user.streak || hasCheckedGamification.current) return
        hasCheckedGamification.current = true

        const oldStreak = user.streak.current
        const hadShield = user.streak.shield
        const oldMomentum = user.momentum.current

        const checkGamification = async () => {
            const updatedUserAfterStreak = await dispatch(checkIfStreakBroken(user._id)).unwrap()
            const updatedUserAfterMomentum = await dispatch(updateMomentum({})).unwrap()

            const streakBroken = updatedUserAfterStreak.streak.current === 0 && oldStreak > 0
            const shieldUsed = hadShield && !updatedUserAfterStreak.streak.shield

            if (shieldUsed) {
                await alerts.shieldUsed()
            }
            else if (streakBroken) {
                await alerts.streakBroken(oldStreak)
            }

            if (updatedUserAfterMomentum.momentum.current < oldMomentum) {
                await alerts.momentumDropped(updatedUserAfterMomentum.momentum.current)
            }
        }

        checkGamification().catch(() => {})
    }, [user])

    // Initial data fetch
    useEffect(() => {
        if (isError) {
            console.error(message)
            return
        }
        if (!user) {
            navigate('/login')
            return
        }

        dispatch(getWorkouts())
        dispatch(getExercises())
    }, [user, message, isError, navigate, dispatch])

    // ----- REST TIMER -----
    const { restTimeRemaining, startRestTimer, skipTimer, adjustRest, adjustSeconds } = useRestTimer(restTimerDuration)

    // ----- WORKOUTS -----
    const { submitWorkout } = useWorkoutSubmit({ title, startTime, resetWorkoutState })

    // Anything logged in the exercise being edited is included when the workout ends
    const pendingExercise = currentExercise.exerciseId && currentExercise.sets?.length > 0 && currentExercise.selectedEquipment
        ? [{
            exercise: currentExercise.exerciseId,
            selectedEquipment: currentExercise.selectedEquipment,
            exerciseName: currentExercise.exerciseName,
            muscleGroup: currentExercise.muscleGroup,
            trackingMode: currentExercise.trackingMode,
            sets: currentExercise.sets
        }]
        : []

    const finalExercises = [...exercises, ...pendingExercise]
    const totalSets = finalExercises.reduce((total, ex) => total + ex.sets.length, 0)

    const onSubmit = async () => {
        if (finalExercises.length === 0) {
            toast.error('Add at least one exercise before ending your workout.')
            return
        }

        if (!(await alerts.endWorkout(totalSets))) return

        setIsSubmittingWorkout(true)
        await submitWorkout(finalExercises)
        setIsSubmittingWorkout(false)
    }

    const onCancel = async () => {
        if (await alerts.cancelWorkout()) {
            resetWorkoutState()
            toast.success('Workout cancelled')
        }
    }

    const editCompletedExercise = (index) => {
        if (currentExercise.exerciseId) return

        const exercise = exercises[index]
        const library = allExercises.find(item => String(item._id) === String(exercise.exercise))
        const lastSet = exercise.sets[exercise.sets.length - 1]

        setCurrentExercise({
            exerciseId: exercise.exercise,
            exerciseName: exercise.exerciseName,
            muscleGroup: exercise.muscleGroup,
            trackingMode: exercise.trackingMode,
            equipment: library?.equipment || [exercise.selectedEquipment],
            selectedEquipment: exercise.selectedEquipment,
            sets: exercise.sets
        })
        setCurrentSet(setToRaw(exercise.trackingMode, lastSet, user.useImperial))
        setExercises(prev => prev.filter((_, i) => i !== index))
    }

    const removeCompletedExercise = async (index) => {
        if (await alerts.removeExercise(exercises[index].exerciseName)) {
            setExercises(prev => prev.filter((_, i) => i !== index))
        }
    }

    const startWorkout = () => {
        if (user.isGuest && workouts.length >= 5) {
            toast.error('Guest accounts are limited to 5 workouts. Create a free Strive account for unlimited access!')
            return
        }
        if (user.isGuest && workouts.length === 2) {
            toast.info('Enjoying Strive? Create a free account to keep your progress and get unlimited workouts.')
        }
        setStarted(true)
        setStartTime(Date.now())
    }

    if (isLoading || !user || isSubmittingWorkout) return <Spinner />

    return (
        <section className="mt-0 flex min-h-dvh flex-col items-center px-4 pb-32 md:mt-20">
            <Header />

            {!started && (
                <WorkoutDashBoard
                    user={user}
                    workouts={workouts}
                    startWorkout={startWorkout}
                />
            )}

            {started && (
                <div className="w-full max-w-2xl space-y-4">
                    <Timer
                        started={started}
                        startTime={startTime}
                        restTimerDuration={restTimerDuration}
                        setRestTimerDuration={setRestTimerDuration}
                        restTimeRemaining={restTimeRemaining}
                        skipTimer={skipTimer}
                        adjustRest={adjustRest}
                        adjustSeconds={adjustSeconds}
                    />

                    <PageTitle accent="workout" className="!py-2">Your</PageTitle>

                    <Card as="section" aria-label="Log an exercise" className="space-y-4">
                        <Input
                            label="Workout name (optional)"
                            value={title}
                            maxLength={100}
                            placeholder="e.g. Push day"
                            onChange={(event) => setTitle(event.target.value)}
                        />

                        <ExerciseForm
                            workouts={workouts}
                            allExercises={allExercises}
                            useImperial={user.useImperial}
                            currentExercise={currentExercise}
                            setCurrentExercise={setCurrentExercise}
                            currentSet={currentSet}
                            setCurrentSet={setCurrentSet}
                            setExercises={setExercises}
                            restTimerDuration={restTimerDuration}
                            startRestTimer={startRestTimer}
                        />
                    </Card>

                    <ExerciseList
                        exercises={exercises}
                        useImperial={user.useImperial}
                        canEdit={!currentExercise.exerciseId}
                        onEdit={editCompletedExercise}
                        onRemove={removeCompletedExercise}
                    />

                    {finalExercises.length > 0 && (
                        <RollingStats
                            workouts={workouts}
                            exercises={finalExercises}
                            useImperial={user.useImperial}
                        />
                    )}

                    <Card as="section" aria-label="Finish workout" className="space-y-3">
                        <Button fullWidth size="lg" onClick={onSubmit}>End workout</Button>
                        <Button fullWidth variant="danger" onClick={onCancel}>Cancel workout</Button>
                    </Card>
                </div>
            )}
        </section>
    )
}

export default NewWorkout
