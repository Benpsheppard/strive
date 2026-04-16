// NewWorkout.jsx

// Imports
import { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'
import axios from 'axios'

// Function Imports
import { createWorkout, getWorkouts, reset } from '../features/workouts/workoutsSlice.js'
import { getExercises } from '../features/exercises/exerciseSlice.js'
import { useLocalStorage } from '../hooks/useLocalStorage.js'
import { addPoints, updateStreak } from '../features/auth/authSlice.js'

// Component Imports
import Header from '../components/headers/Header.jsx'
import WorkoutItem from '../components/workouts/WorkoutItem.jsx'
import Spinner from '../components/spinners/Spinner.jsx'
import ExerciseList from '../components/workouts/ExerciseList.jsx'
import SetList from '../components/workouts/SetList.jsx'
import SetForm from '../components/workouts/SetForm.jsx'
import Timer from '../components/workouts/Timer.jsx'
import Calendar from '../components/progress/Calendar.jsx'
import MuscleHeatmap from '../components/progress/MuscleGroupHeatmap.jsx'
import { FaUndoAlt } from 'react-icons/fa'
import GuestCard from '../components/guest/GuestCard.jsx'
import StreakCard from '../components/games/StreakCard.jsx'

const EMPTY_EXERCISE = {
    exerciseId: null,
    exerciseName: '',
    muscleGroup: '',
    trackingMode: '',
    equipment: [],
    selectedEquipment: '',
    sets: []
}

const EMPTY_SET = {
    weight: '', reps: '', duration: '', distance: '', addedWeight: '', assistance: ''
}

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
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [restTimeRemaining, setRestTimeRemaining] = useState(0)
    const [isSubmittingWorkout, setIsSubmittingWorkout] = useState(false)

    // Refs
    const restIntervalRef = useRef(null)
    const hasCheckedStreak = useRef(false)
    const searchDebounceRef = useRef(null)

    const lastWorkout = workouts.length > 0 ? workouts[workouts.length - 1] : null

    // Reset workout state
    const resetWorkoutState = () => {
        setTitle('')
        setExercises([])
        setCurrentExercise(EMPTY_EXERCISE)
        setCurrentSet(EMPTY_SET)
        setStarted(false)
        setStartTime(null)
        setSetHistory([])
        setSearchQuery('')
        setSearchResults([])

        localStorage.removeItem('newWorkout_title')
        localStorage.removeItem('newWorkout_exercises')
        localStorage.removeItem('newWorkout_currentExercise')
        localStorage.removeItem('newWorkout_currentSet')
        localStorage.removeItem('newWorkout_started')
        localStorage.removeItem('newWorkout_startTime')
        localStorage.removeItem('newWorkout_setHistory')
    }

    // Check streak on mount
    useEffect(() => {
        if (user && !hasCheckedStreak.current) {
            hasCheckedStreak.current = true
            const oldStreak = user.streak.current
            const hadShield = user.streak.shield

            dispatch(updateStreak(user._id)).unwrap().then((updatedUser) => {
                const streakBroken = updatedUser.streak.current === 0 && oldStreak > 0
                const shieldUsed = hadShield && !updatedUser.streak.shield

                if (shieldUsed) {
                    Swal.fire({
                        title: 'Shield Used!',
                        text: 'You missed your target last week, but your shield protected your streak!',
                        icon: 'warning',
                        confirmButtonText: 'Phew!',
                        color: '#EDF2F4',
                        background: '#8D99AE',
                        confirmButtonColor: '#EF233C',
                    })
                } else if (streakBroken) {
                    Swal.fire({
                        title: 'Streak Lost!',
                        text: `Your ${oldStreak} week streak has been reset. Time to start again!`,
                        icon: 'error',
                        confirmButtonText: "Let's go again",
                        color: '#EDF2F4',
                        background: '#8D99AE',
                        confirmButtonColor: '#EF233C',
                    })
                }
            })
        }
    }, [user, dispatch])

    // Search exercises with debounce
    useEffect(() => {
		if (!searchQuery.trim()) {
			setSearchResults([])
			setShowSuggestions(false)
			return
		}

		const filtered = allExercises.filter(ex =>
			ex.name.toLowerCase().includes(searchQuery.toLowerCase())
		)
		setSearchResults(filtered)
		setShowSuggestions(filtered.length > 0)
	}, [searchQuery, allExercises])

    // Initial data fetch
    useEffect(() => {
        if (isError) { console.log(message); return }
        if (!user) { navigate('/login'); return }
        dispatch(getWorkouts())
		dispatch(getExercises())
        return () => dispatch(reset())
    }, [user, message, isError, navigate, dispatch])

    // Cleanup rest timer
    useEffect(() => {
        return () => { if (restIntervalRef.current) clearInterval(restIntervalRef.current) }
    }, [])

    // Restore rest timer from localStorage
    useEffect(() => {
        const savedEnd = localStorage.getItem('restTimerEnd')
        if (savedEnd) {
            const endTime = Number(savedEnd)
            const remaining = Math.floor((endTime - Date.now()) / 1000)
            if (remaining > 0) updateRestTimer(endTime)
            else localStorage.removeItem('restTimerEnd')
        }
    }, [])

    // ----- SEARCH -----
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value)

        if (currentExercise.exerciseId) {
            setCurrentExercise(EMPTY_EXERCISE)
            setCurrentSet(EMPTY_SET)
        }
    }    

    // ----- EQUIPMENT -----
    const handleEquipmentChange = (e) => {
        setCurrentExercise((prev) => ({ ...prev, selectedEquipment: e.target.value }))
    }

    // ----- SETS -----
    const validateSet = () => {
        const { trackingMode } = currentExercise
        const { weight, reps, duration, distance, addedWeight, assistance } = currentSet

        switch (trackingMode) {
            case 'weight_reps':
                if (!weight || weight <= 0) { toast.error('Please enter a weight.'); return false }
                if (!reps || reps <= 0) { toast.error('Please enter reps.'); return false }
                return true
            case 'bodyweight_reps':
                if (!reps || reps <= 0) { toast.error('Please enter reps.'); return false }
                return true
            case 'assisted_reps':
                if (!assistance || assistance <= 0) { toast.error('Please enter assistance weight.'); return false }
                if (!reps || reps <= 0) { toast.error('Please enter reps.'); return false }
                return true
            case 'duration':
                if (!duration || duration <= 0) { toast.error('Please enter duration.'); return false }
                return true
            case 'distance_duration':
                if (!distance || distance <= 0) { toast.error('Please enter distance.'); return false }
                if (!duration || duration <= 0) { toast.error('Please enter duration.'); return false }
                return true
            case 'reps':
                if (!reps || reps <= 0) { toast.error('Please enter reps.'); return false }
                return true
            default:
                return true
        }
    }

    const buildSet = () => {
        const { trackingMode } = currentExercise
        const { weight, reps, duration, distance, addedWeight, assistance } = currentSet

        switch (trackingMode) {
            case 'weight_reps':
                return { weight: Number(weight), reps: Number(reps) }
            case 'bodyweight_reps':
                return { reps: Number(reps), addedWeight: addedWeight ? Number(addedWeight) : undefined }
            case 'assisted_reps':
                return { reps: Number(reps), assistance: Number(assistance) }
            case 'duration':
                return { duration: Number(duration) }
            case 'distance_duration':
                return { distance: Number(distance), duration: Number(duration) }
            case 'reps':
                return { reps: Number(reps) }
            default:
                return {}
        }
    }

    const addSet = () => {
        if (!currentExercise.exerciseId) {
            toast.error('Please select an exercise first.')
            return
        }
        if (!validateSet()) {
            return
        }

        const newSet = buildSet()

        setSetHistory(prev => [...prev, currentExercise.sets || []])
        setCurrentExercise(prev => ({ ...prev, sets: [...(prev.sets || []), newSet] }))
        setCurrentSet(EMPTY_SET)
        toast.success('Set saved!')

        if (restTimerDuration > 0) {
            startRestTimer()
        }
    }

    const undoLastSet = () => {
        if (setHistory.length === 0) return
        const previous = setHistory[setHistory.length - 1]
        setCurrentExercise(prev => ({ ...prev, sets: previous }))
        setSetHistory(prev => prev.slice(0, -1))
        toast.info('Last set removed.')
    }

    const handleSetChange = (e) => {
        const { name, value } = e.target
        setCurrentSet((prev) => ({ ...prev, [name]: value }))
    }

    // ----- EXERCISES -----
    const addExercise = () => {
        if (!currentExercise.exerciseId) {
            toast.error('Please select an exercise from the list.')
            return
        }
        if (!currentExercise.selectedEquipment) {
            toast.error('Please select equipment.')
            return
        }
        if (!currentExercise.sets || currentExercise.sets.length === 0) {
            toast.error('Please add at least one set.')
            return
        }

        const exerciseToSave = {
            exercise: currentExercise.exerciseId,
            selectedEquipment: currentExercise.selectedEquipment,
            exerciseName: currentExercise.exerciseName,
            muscleGroup: currentExercise.muscleGroup,
            trackingMode: currentExercise.trackingMode,
            sets: currentExercise.sets
        }

        setExercises(prev => [...prev, exerciseToSave])
        setCurrentExercise(EMPTY_EXERCISE)
        setCurrentSet(EMPTY_SET)
        setSetHistory([])
        setSearchQuery('')
        toast.success('Exercise added!')
    }

    const selectExercise = (exercise) => {
        setSearchQuery(exercise.name)
        setShowSuggestions(false)
        setCurrentExercise({
            exerciseId: exercise._id,
            exerciseName: exercise.name,
            muscleGroup: exercise.muscleGroup,
            trackingMode: exercise.trackingMode,
            equipment: exercise.equipment,
            selectedEquipment: exercise.equipment?.[0] || '',
            sets: []
        })
        setCurrentSet(EMPTY_SET)
        setSetHistory([])
    }

    // ----- REST TIMER -----
    const startRestTimer = () => {
        if (restIntervalRef.current) clearInterval(restIntervalRef.current)
        const endTime = Date.now() + restTimerDuration * 1000
        localStorage.setItem('restTimerEnd', endTime)
        updateRestTimer(endTime)
    }

    const updateRestTimer = (endTime) => {
        setRestTimeRemaining(Math.max(0, Math.floor((endTime - Date.now()) / 1000)))
        restIntervalRef.current = setInterval(() => {
            const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000))
            setRestTimeRemaining(remaining)
            if (remaining <= 0) {
                clearInterval(restIntervalRef.current)
                restIntervalRef.current = null
                localStorage.removeItem('restTimerEnd')
                notifyRestComplete()
            }
        }, 1000)
    }

    const notifyRestComplete = () => {
        Swal.fire({
            title: 'Rest Complete!',
            text: 'Time for your next set. Get after it!',
            icon: 'success',
            color: '#EDF2F4',
            background: '#8D99AE',
            confirmButtonText: 'Lets Go!',
            confirmButtonColor: '#EF233C',
            timer: 10000,
            timerProgressBar: true,
        })
    }

    const skipTimer = () => {
        clearInterval(restIntervalRef.current)
        localStorage.removeItem('restTimerEnd')
        setRestTimeRemaining(0)
    }

    // ----- WORKOUTS -----
    const onSubmit = async () => {
        if (!title.trim()) { 
            toast.error('Please enter a workout title.')
            return 
        }
        if (exercises.length === 0) {
            toast.error('Please add at least one exercise.')
            return 
        }

        setIsSubmittingWorkout(true)
        const endTime = Date.now()
        const durationMinutes = Math.round((endTime - startTime) / 60000)
        const workoutData = { title, exercises, duration: durationMinutes }

        try {
            const savedWorkout = await dispatch(createWorkout(workoutData)).unwrap()
            const { summary } = savedWorkout

            let levelUp = null
            if (summary.totalStrivePoints > 0) {
                const result = await dispatch(addPoints({ userId: user._id, amount: summary.totalStrivePoints })).unwrap()
                if (result.level > user.level) {
                    levelUp = result.level
                }
            }

            const oldStreak = user.streak.current
            const oldShield = user.streak.shield
            const updatedUser = await dispatch(updateStreak(user._id)).unwrap()

            const streakIncreased = updatedUser.streak.current > oldStreak
            const shieldEarned = !oldShield && updatedUser.streak.shield
            const shieldUsed = oldShield && !updatedUser.streak.shield && updatedUser.streak.current === oldStreak
            const streakBroken = updatedUser.streak.current === 0 && oldStreak > 0

            resetWorkoutState()
            navigate('/workout-complete', {
                state: { 
                    workout: savedWorkout, 
                    levelUp, 
                    streakIncreased, 
                    shieldEarned, 
                    shieldUsed, 
                    streakBroken 
                }
            })
        } catch (error) {
            console.error('Submit workout error: ', error)
            toast.error(error.message || 'Failed to save workout')
            setIsSubmittingWorkout(false)
        }
    }

    const onCancel = () => {
        Swal.fire({
            title: 'Cancel Workout?',
            text: 'Are you sure you want to cancel this workout?',
            icon: 'warning',
            color: '#EDF2F4',
            background: '#8D99AE',
            showCancelButton: false,
            confirmButtonText: 'Confirm Cancel',
            confirmButtonColor: '#EF233C',
        }).then((result) => {
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
                <section className="space-y-3 w-full max-w-2xl">
                    <div className="text-4xl md:text-6xl font-semibold text-[#EDF2F4] text-center p-4">
                        <h1>Welcome back, <span className="text-[#EF233C]">{user.isGuest ? 'Guest' : user.username}</span></h1>
                    </div>

                    <StreakCard user={user} workouts={workouts} />

                    {user?.isGuest && <GuestCard workouts={workouts} isMigrate={false} />}

                    <div className="card-theme p-6 w-full sm:max-w-2xl mx-auto bg-[#8D99AE] shadow rounded-2xl">
                        <h2 className="text-[#EDF2F4] text-xl text-center mb-3">Ready to train?</h2>
                        <button onClick={startWorkout} className="w-full bg-[#EF233C] text-[#EDF2F4] py-2 px-4 rounded-xl hover:bg-[#D90429]">
                            Start Workout
                        </button>
                    </div>

                    <Calendar workouts={workouts} />

                    {lastWorkout && (
                        <WorkoutItem workout={lastWorkout} />
                    )}

                    <MuscleHeatmap workouts={workouts} />
                </section>
            )}

            {started && (
                <section className="space-y-3 w-full max-w-2xl">
                    <div className="text-4xl md:text-6xl font-semibold text-[#EDF2F4] text-center p-4">
                        <h1>New <span className="text-[#EF233C]">Workout</span></h1>
                    </div>

                    <Timer started={started} startTime={startTime} restTimerDuration={restTimerDuration} setRestTimerDuration={setRestTimerDuration} />

                    <div className="card-theme p-6 w-full sm:max-w-2xl mx-auto bg-[#8D99AE] shadow rounded-2xl">
                        {/* Rest Timer */}
                        {restTimeRemaining > 0 && (
                            <div className="text-center mb-4 bg-[#2B2D42] rounded-xl p-3">
                                <p className="text-[#EDF2F4] text-sm mb-1">
                                    Rest Timer
                                </p>
                                <p className="text-[#EF233C] text-3xl font-bold">{restTimeRemaining}s</p>
                                <button onClick={skipTimer} className="text-[#EDF2F4] text-xs mt-1 opacity-60 hover:opacity-100">
                                    Skip
                                </button>
                            </div>
                        )}

                        {/* Workout Title */}
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Workout Title *"
                            className="w-full rounded-lg border border-[#EDF2F4]/40 bg-[#2B2D42] px-4 py-2 mb-3 text-[#EDF2F4] text-center placeholder-gray-300 focus:border-[#EF233C] focus:outline-none focus:ring-2 focus:ring-[#EF233C]/40"
                        />

                        {/* Exercise Form */}
                        <div className="mb-4 bg-[#8D99AE] p-4 rounded-xl shadow-xl space-y-3">
                            {/* Exercise Search */}
                            <div className="relative">
                                <input
                                    type="text"
                                    value={currentExercise.exerciseName ? currentExercise.exerciseName : searchQuery}
                                    onChange={handleSearchChange}
                                    placeholder="Exercise name *"
                                    className="w-full rounded-lg border border-[#EDF2F4]/40 bg-[#2B2D42] px-4 py-2 text-[#EDF2F4] placeholder-gray-300 focus:border-[#EF233C] focus:outline-none focus:ring-2 focus:ring-[#EF233C]/40"
                                />

                                {/* Suggestions dropdown */}
                                {showSuggestions && !currentExercise.exerciseName && (
                                    <ul onClick={(e) => e.stopPropagation()} className="absolute z-50 left-0 right-0 bg-[#2B2D42] border border-[#EF233C]/30 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                                        {searchResults.map((exercise) => (
                                            <li key={exercise._id} onClick={() => selectExercise(exercise)} className="px-4 py-2 text-[#EDF2F4] hover:bg-[#EF233C]/40 cursor-pointer">
                                                <div className="font-semibold">{exercise.name}</div>
                                                <div className="text-xs text-[#8D99AE]">{exercise.muscleGroup} · {exercise.subMuscleGroup}</div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {/* Equipment Dropdown — shown after exercise selected */}
                            {currentExercise.exerciseId && (
                                <>
                                    <select value={currentExercise.selectedEquipment} onChange={handleEquipmentChange} className="w-full rounded-lg border border-[#EDF2F4]/40 bg-[#2B2D42] px-4 py-2 text-[#EDF2F4] focus:border-[#EF233C] focus:outline-none focus:ring-2 focus:ring-[#EF233C]/40" >
                                        {currentExercise.equipment.map((eq) => (
                                            <option key={eq} value={eq}>{eq}</option>
                                        ))}
                                    </select>

                                    {/* Set Input */}
                                    <div className="space-y-2">
                                        <SetForm currentExercise={currentExercise} currentSet={currentSet} handleSetChange={handleSetChange} />
                                        <button type="button" onClick={addSet} className="bg-[#EF233C] w-full text-white px-4 py-2 rounded transition hover:bg-[#D90429]">
                                            Add Set
                                        </button>
                                    </div>

                                    {/* Undo + Set List */}
                                    <div className="flex flex-col items-center">
                                        {setHistory.length > 0 && (
                                            <button type="button" onClick={undoLastSet} className="flex flex-row items-center gap-2 text-[#EDF2F4]/40 hover:text-[#EF233C] text-sm transition mb-2">
                                                <FaUndoAlt /> Undo last set
                                            </button>
                                        )}
                                        <SetList
                                            sets={currentExercise.sets}
                                            trackingMode={currentExercise.trackingMode}
                                            useImperial={user.useImperial}
                                            onSetsUpdate={() => {
                                                const updatedExercise = JSON.parse(localStorage.getItem('newWorkout_currentExercise'))
                                                setCurrentExercise(updatedExercise)
                                            }}
                                        />
                                    </div>
                                </>
                            )}

                            {/* Add Exercise Button */}
                            <button type="button" onClick={addExercise} className="bg-[#EF233C] w-full text-white px-4 py-2 rounded transition hover:bg-[#D90429]">
                                Add Exercise
                            </button>
                        </div>

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