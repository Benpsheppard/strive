// NewWorkout.jsx

// Imports
import { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'

// Feature Imports
import { getWorkouts } from '../features/workouts/workoutsSlice.js'
import { getExercises } from '../features/exercises/exerciseSlice.js'
import { getRoutines } from '../features/routines/routineSlice.js'
import { updateMomentum, checkIfStreakBroken } from '../features/auth/authSlice.js'

// Hook Imports
import { useLocalStorage } from '../hooks/useLocalStorage.js'
import { useWorkoutSubmit } from '../hooks/useWorkoutSubmit.js'
import { useRestTimer } from '../hooks/useRestTimer.js'
import { useAlerts } from '../hooks/useAlerts.js'

// Component Imports
import Spinner from '../components/spinners/Spinner.jsx'
import ExerciseList from '../components/workouts/ExerciseList.jsx'
import Timer from '../components/workouts/Timer.jsx'
import WorkoutDashBoard from '../components/workouts/WorkoutDashboard.jsx'
import ExerciseForm from '../components/workouts/ExerciseForm.jsx'
import RollingStats from '../components/workouts/RollingStats.jsx'
import ExerciseQueue from '../components/workouts/ExerciseQueue.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'
import PageTitle from '../components/ui/PageTitle.jsx'

// Utils
import { EMPTY_EXERCISE } from '../utils/constants.js'
import { setToRaw } from '../utils/trackingModes.js'
import { startExercise } from '../utils/exerciseSelection.js'
import { getUpNext, moveItem, removeItem } from '../utils/routineQueue.js'

const DRAFT_KEYS = [
    'newWorkout_title', 'newWorkout_exercises', 'newWorkout_currentExercise', 'newWorkout_currentSet',
    'newWorkout_started', 'newWorkout_startTime', 'newWorkout_setHistory', 'newWorkout_clientId', 'newWorkout_queue'
]

// A random id for one workout. Drafts started before this existed get one when they are saved.
const newClientId = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `w-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`)

const NewWorkout = () => {
    const { user } = useSelector((state) => state.auth)
    const { workouts, isLoading, isError, message } = useSelector((state) => state.workout)
    const { exercises: allExercises } = useSelector((state) => state.exercise)
    const { routines, isOffline: routinesOffline } = useSelector((state) => state.routine)

    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation()
    const alerts = useAlerts()

    // Persisted state (survives a refresh or a closed tab mid-workout)
    const [title, setTitle] = useLocalStorage('newWorkout_title', '')
    const [exercises, setExercises] = useLocalStorage('newWorkout_exercises', [])
    const [currentExercise, setCurrentExercise] = useLocalStorage('newWorkout_currentExercise', EMPTY_EXERCISE)
    const [currentSet, setCurrentSet] = useLocalStorage('newWorkout_currentSet', {})
    const [started, setStarted] = useLocalStorage('newWorkout_started', false)
    const [startTime, setStartTime] = useLocalStorage('newWorkout_startTime', null)
    const [restTimerDuration, setRestTimerDuration] = useLocalStorage('newWorkout_restTimer', 60)
    // Identifies this workout to the server so saving it twice (a retry, a double tap) is harmless
    const [clientId, setClientId] = useLocalStorage('newWorkout_clientId', null)
    // Exercises still to do when the workout was started from a routine
    const [queue, setQueue] = useLocalStorage('newWorkout_queue', [])

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
        setClientId(null)
        setQueue([])
        setTimeout(() => DRAFT_KEYS.forEach(key => localStorage.removeItem(key)), 0)
    }

    // A workout already in progress from before ids existed gets one now
    useEffect(() => {
        if (started && !clientId) setClientId(newClientId())
    }, [started, clientId, setClientId])

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
    }, [user, dispatch, alerts])

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
        dispatch(getRoutines())
    }, [user, message, isError, navigate, dispatch])

    // ----- REST TIMER -----
    const { restTimeRemaining, startRestTimer, skipTimer, adjustRest, adjustSeconds } = useRestTimer(restTimerDuration)

    // ----- WORKOUTS -----
    const { submitWorkout } = useWorkoutSubmit({ title, startTime, clientId, resetWorkoutState })

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

        if (!(await alerts.endWorkout(totalSets, Math.round((Date.now() - startTime) / 60000)))) return

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

    // Starts a workout. A routine (or a repeated workout) passes the exercises to queue and a name.
    const startWorkout = ({ queue: newQueue = [], title: newTitle = '' } = {}) => {
        if (user.isGuest && workouts.length >= 5) {
            toast.error('Guest accounts are limited to 5 workouts. Create a free Strive account for unlimited access!')
            return
        }
        if (user.isGuest && workouts.length === 2) {
            toast.info('Enjoying Strive? Create a free account to keep your progress and get unlimited workouts.')
        }
        setQueue(newQueue)
        setTitle(newTitle)
        setStarted(true)
        setStartTime(Date.now())
        setClientId(newClientId())
    }

    // "Start" on the Routines page and "Repeat workout" in history arrive here with the queue in
    // the navigation state. Starting is skipped if a workout is already in progress.
    useEffect(() => {
        if (!user || !location.state?.queue) return
        const { queue: incoming, title: incomingTitle } = location.state
        navigate(location.pathname, { replace: true, state: null })
        if (!started) startWorkout({ queue: incoming, title: incomingTitle })
        else toast.info('Finish or cancel your current workout before starting another.')
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.state, user])

    // The queue minus what is being logged and what is already finished
    const upNext = getUpNext(queue, currentExercise.exerciseId, exercises)

    const startQueued = (item) => {
        const { currentExercise: chosen, currentSet: firstSet } = startExercise({
            exercise: item.exercise,
            workouts,
            useImperial: user.useImperial,
            preferredEquipment: item.selectedEquipment
        })
        setCurrentExercise(chosen)
        setCurrentSet(firstSet)
    }

    const skipQueued = (index) => setQueue(removeItem(upNext, index))
    const moveQueued = (index, delta) => setQueue(moveItem(upNext, index, delta))

    if (isLoading || !user || isSubmittingWorkout) return <Spinner />

    return (
        <div>

            {!started && (
                <WorkoutDashBoard
                    user={user}
                    workouts={workouts}
                    routines={routines}
                    routinesOffline={routinesOffline}
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

                    <ExerciseQueue
                        items={upNext}
                        canStart={!currentExercise.exerciseId}
                        onStart={startQueued}
                        onSkip={skipQueued}
                        onMove={moveQueued}
                    />

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
        </div>
    )
}

export default NewWorkout
