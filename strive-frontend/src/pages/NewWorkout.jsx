// NewWorkout.jsx

// Imports
import { useState, useEffect, useRef, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'

// Function Imports
import { createWorkout, getWorkouts, reset } from '../features/workouts/workoutsSlice.js'
import { detectNewPBs } from '../utils/pbDetection.js'
import { parseWeight, formatWeight } from '../utils/formatValues.js'
import { useLocalStorage } from '../hooks/useLocalStorage.js'
import { normaliseExercise, arraysEqualByName, getUniqueExercises } from '../utils/exerciseUtils.js'
import { addPoints } from '../features/auth/authSlice.js'
import { checkQuestCompletion } from '../features/quests/questSlice.js'

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

// Muscle groups
const MUSCLE_GROUPS = [
	'Chest',
	'Back',
	'Shoulders',
	'Biceps',
	'Triceps',
	'Legs',
	'Core',
	'Full body',
	'Other'
]

// New Workout
const NewWorkout = () => {
	const { user } = useSelector((state) => state.auth)
	const { workouts = [], isLoading, isError, message } = useSelector((state) => state.workout)

	// Redux & Routing
	const dispatch = useDispatch()
	const navigate = useNavigate()

	// Local state persisted to localStorage
	const [title, setTitle] = useLocalStorage('newWorkout_title', '')
	const [exercises, setExercises] = useLocalStorage('newWorkout_exercises', [])
	const [currentExercise, setCurrentExercise] = useLocalStorage('newWorkout_currentExercise', {name: '', musclegroup: '', description: '', sets: []})
	const [currentSet, setCurrentSet] = useLocalStorage('newWorkout_currentSet', { weight: '', reps: '' })
	const [started, setStarted] = useLocalStorage('newWorkout_started', false)
	const [startTime, setStartTime] = useLocalStorage('newWorkout_startTime', null)
	const [restTimerDuration, setRestTimerDuration] = useLocalStorage('newWorkout_restTimer', 60)

	// Use State
	const [showSuggestions, setShowSuggestions] = useState(false)
	const [filteredExercises, setFilteredExercises] = useState([])
	const [restTimeRemaining, setRestTimeRemaining] = useState(0)
	const [setHistory, setSetHistory] = useLocalStorage('newWorkout_setHistory', [])

	// Use Ref
	const selectingRef = useRef(false)
	const suggestionsContainerRef = useRef(null)
	const restIntervalRef = useRef(null)

	// Get unique exercises
	const uniqueExercises = useMemo(() => getUniqueExercises(workouts), [workouts])

	// Most recent workout
	const lastWorkout = workouts.length > 0 ? workouts[workouts.length - 1] : null
  
	// Reset workout state
	const resetWorkoutState = () => {
		setTitle('')
		setExercises([])
		setCurrentExercise({ name: '', musclegroup: '', description: '', sets: [] })
		setCurrentSet({ weight: '', reps: '' })
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

	// Filter suggestions when input changes
	useEffect(() => {
		if (selectingRef.current) {
			selectingRef.current = false
			return
		}

		const q = (currentExercise?.name || '').trim()
		if (!q) {
			if (filteredExercises.length > 0 || showSuggestions) {
				setFilteredExercises([])
				setShowSuggestions(false)
			}
			return
		}

		const normalizedQ = normaliseExercise(q).toLowerCase()

		const filtered = uniqueExercises.filter((ex) =>
			ex.name.toLowerCase().includes(normalizedQ)
		)

		// Only set state if it actually changed
		if (!arraysEqualByName(filtered, filteredExercises)) {
			setFilteredExercises(filtered)
			setShowSuggestions(filtered.length > 0)
		}
	}, [currentExercise?.name, uniqueExercises])

	// Hide suggestions when clicking outside
	useEffect(() => {
		const handleClickOutside = (e) => {
			if (suggestionsContainerRef.current && !suggestionsContainerRef.current.contains(e.target)) {
				setShowSuggestions(false)
			}
		}

		document.addEventListener('click', handleClickOutside)
		return () => document.removeEventListener('click', handleClickOutside)
	}, [])
  
	// Initial data & taglines effect
	useEffect(() => {
		if (isError) {
			console.log(message)
		}

		if (!user) {
			navigate('/login')
			return
		}

		dispatch(getWorkouts())

		return () => {
			dispatch(reset())
		}
	}, [user, message, isError, navigate, dispatch])

	// Clean up rest timer
	useEffect(() => {
		return () => {
			if (restIntervalRef.current) clearInterval(restIntervalRef.current)
		}
	}, [])

	useEffect(() => {
		const savedEnd = localStorage.getItem('restTimerEnd')

		if (savedEnd) {
			const endTime = Number(savedEnd)
			const remaining = Math.floor((endTime - Date.now()) / 1000)

			if (remaining > 0) {
				updateRestTimer(endTime)
			} else {
				localStorage.removeItem('restTimerEnd')
			}
		}
	}, [])

	// Select exercise from suggestions
	const selectExercise = (exercise) => {
		selectingRef.current = true
		setShowSuggestions(false)
		setCurrentExercise((prev) => ({
			...prev,
			name: exercise.name,
			musclegroup: exercise.musclegroup,
			description: exercise.description
		}))
	}

	// Change input for exercise fields
	const handleExerciseChange = (e) => {
		const { name, value } = e.target
		setCurrentExercise((prev) => ({
			...prev,
			[name]: value
		}))
	}

	// Change input for set fields
	const handleSetChange = (e) => {
		const { name, value } = e.target
		setCurrentSet((prev) => ({
			...prev,
			[name]: value
		}))
	}

	// Start rest timer
	const startRestTimer = () => {
		// Clear any existing timer
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

	// Send notif when rest timer complete
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

	// Add set to current exercise
	const addSet = () => {
		if (!currentSet.weight || currentSet.weight <= 0) {
			toast.error('Weight must be greater than 0.')
			return
		}

		if (!currentSet.reps || currentSet.reps <= 0) {
			toast.error('Reps must be greater than 0.')
			return
		}

		const weightInKg = parseWeight(currentSet.weight, user.useImperial)

		setSetHistory(prev => [...prev, currentExercise.sets || []])

		setCurrentExercise((prev) => ({
			...prev,
			sets: [...(prev.sets || []), { weight: weightInKg, reps: Number(currentSet.reps) }]
		}))

		setCurrentSet({ weight: '', reps: '' })
		toast.success('Set saved successfully!')

		if (restTimerDuration > 0) {
			startRestTimer()
		}
	}

	// Undo most recently added set
	const undoLastSet = () => {
		if (setHistory.length === 0) {
			return
		}

		const previous = setHistory[setHistory.length - 1]
		
		setCurrentExercise(prev => ({ ...prev, sets: previous }))
		
		setSetHistory(prev => prev.slice(0, -1))

		toast.info('Last set removed.')
	}

	// Add exercise to workout
	const addExercise = () => {
		if (!currentExercise.name.trim()) {
			toast.error('Please enter an exercise name.')
			return
		}

		if (!currentExercise.musclegroup) {
			toast.error(`Please select a muscle group for exercise "${currentExercise.name}".`)
			return
		}

		const normalizedExercise = {
			...currentExercise,
			name: normaliseExercise(currentExercise.name)
		}

		setExercises((prev) => [...prev, normalizedExercise])
		setCurrentExercise({ name: '', musclegroup: '', description: '', sets: [] })
		setSetHistory([])
		toast.success('Exercise saved successfully!')
	}

	// Submit Workout
	const onSubmit = async () => {
		if (!title.trim()) {
			toast.error('Please enter a workout title.')
			return
		}

		if (exercises.length === 0) {
			toast.error('Please add at least one exercise.')
			return
		}

		const endTime = Date.now()
		const durationMinutes = Math.round((endTime - startTime) / 60000)
		const workoutData = { title, exercises, duration: durationMinutes }

		try {
			// Add fixed Strive Points for completing workout
			let SP_REWARD = 0
			const WORKOUT_COMPLETE_SP = 200
			const PB_REWARD_SP = 500

			// Detect PBs
			const newPBs = detectNewPBs(workoutData, workouts)

			// Save workout
			await dispatch(createWorkout(workoutData)).unwrap()

			SP_REWARD += WORKOUT_COMPLETE_SP

			// Detect new PBs and reward bonus SP
			const pbResults = []
			const newExercises = []
			if (newPBs.length > 0) {
				for (const pb of newPBs) {
					if (pb.isFirstTime) {
						newExercises.push(pb.exerciseName)
					} else {
						SP_REWARD += PB_REWARD_SP
						pbResults.push({
							exerciseName: pb.exerciseName,
							oldWeight: formatWeight(pb.oldWeight, user.useImperial),
							newWeight: formatWeight(pb.newWeight, user.useImperial),
							sp: PB_REWARD_SP
						})
					}
				}
			}

			// Check quest completion
			const questResults = []
			try {
				const { updatedQuests } = await dispatch(checkQuestCompletion(workoutData)).unwrap()
				if (updatedQuests && updatedQuests.length > 0) {
					for (const quest of updatedQuests) {
						SP_REWARD += quest.reward
						questResults.push({
							title: quest.title,
							reward: quest.reward
						})
					}
				}
			} catch (questError) {
				console.error('Quest check failed:', questError)
			}

			// Apply all SP at once
			let levelUp = null
			if (SP_REWARD > 0) {
				const result = await dispatch(addPoints({ userId: user._id, amount: SP_REWARD })).unwrap()

				if (result.level > user.level) {
					levelUp = result.level
				}
			}

			// Reset workout state & localStorage
			resetWorkoutState()

			navigate('/workout-complete', {
				state: {
					workout: workoutData,
					totalSP: SP_REWARD,
					pbs: pbResults,
					quests: questResults,
					levelUp,
					duration: durationMinutes,
					newExercises
				}
			})

		} catch (error) {
			console.error('Submit workout error: ', error)
			toast.error(error.message || 'Failed to save workout')
		}
	}

	// Cancel workout
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

	// Start workout
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

	if (isLoading || !user) {
		return <Spinner />
	}

	return (
		<section className="min-h-screen mt-0 md:mt-20 flex flex-col items-center px-4 pb-32">
			<Header />
				
			{!started && (
				<section className="space-y-3">
					<div>
						<div className="text-5xl md:text-6xl font-semibold text-[#EDF2F4] text-center p-4">
							<h1>
								Welcome back, <span className="text-[#EF233C]">{user.isGuest ? 'Guest' : user.username}</span>
							</h1>
						</div>

						{lastWorkout && (
							<div>
								<h2 className="text-[#EDF2F4] text-center text-xl mt-10">Last Session</h2>
								<WorkoutItem workout={lastWorkout} />
							</div>
						)}
					</div>

					{/* Guest Card */}
					{user?.isGuest && 
						<div className="w-full bg-[#EF233C] text-[#EDF2F4] text-sm text-center rounded-xl p-2">
							<p>Guest Account. You have completed {workouts.length}/5 workouts.</p>
							<p>Migrate to a Strive account for unlimited workout tracking.</p>
						</div>
					}

					<Calendar workouts={workouts} />

					<div className="card-theme p-6 w-full sm:max-w-2xl mx-auto bg-[#8D99AE] shadow rounded-2xl">
						<h2 className="text-[#EDF2F4] text-xl text-center mb-3">Ready to train?</h2>
						<button onClick={startWorkout} className="w-full bg-[#EF233C] text-[#EDF2F4] py-2 px-4 rounded-xl hover:bg-[#D90429]">
							Start Workout
						</button>
					</div>

					<MuscleHeatmap workouts={workouts} />
				</section>
			)}

			{started && (
				<section className="space-y-3 w-full max-w-2xl">
					<div className="text-5xl md:text-6xl font-semibold text-[#EDF2F4] text-center p-4">
						<h1>
							New <span className="text-[#EF233C]">Workout</span>
						</h1>
					</div>
					<Timer started={started} startTime={startTime} restTimerDuration={restTimerDuration} setRestTimerDuration={setRestTimerDuration} />

					{/* Workout Form */}
					<div className="card-theme p-6 w-full sm:max-w-2xl mx-auto bg-[#8D99AE] shadow rounded-2xl">	
						{/* Rest Timer */}
						{restTimeRemaining > 0 && (
							<div className="text-center mb-4 bg-[#2B2D42] rounded-xl p-3">
								<p className="text-[#EDF2F4] text-sm mb-1">Rest Timer</p>
								<p className="text-[#EF233C] text-3xl font-bold">{restTimeRemaining}s</p>
								<button 
									onClick={() => {
										clearInterval(restIntervalRef.current)
										localStorage.removeItem('restTimerEnd')
										setRestTimeRemaining(0)
									}}
									className="text-[#EDF2F4] text-xs mt-1 opacity-60 hover:opacity-100"
								>
									Skip
								</button>
							</div>
						)}

						<input
							type="text"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="Workout Title *"
							className="w-full rounded-lg border border-[#EDF2F4]/40 bg-[#2B2D42] px-4 py-2 mb-3 text-[#EDF2F4] text-center placeholder-gray-300 focus:border-[#EF233C] focus:outline-none focus:ring-2 focus:ring-[#EF233C]/40"
							required
						/>

						{/* Exercise Form */}
						<div className="mb-4 bg-[#8D99AE] p-4 rounded-xl shadow-xl">
							<div className="relative" ref={suggestionsContainerRef}>
								<input
									type="text"
									name="name"
									value={currentExercise.name}
									onChange={handleExerciseChange}
									placeholder="Exercise Name *"
									className="w-full rounded-lg border border-[#EDF2F4]/40 bg-[#2B2D42] px-4 py-2 mb-3 text-[#EDF2F4] placeholder-gray-300 focus:border-[#EF233C] focus:outline-none focus:ring-2 focus:ring-[#EF233C]/40"
									required
								/>

								{/* Suggestions dropdown */}
								{showSuggestions && (
									<ul onClick={(e) => e.stopPropagation()} className="absolute z-50 left-0 right-0 bg-[#2B2D42] border border-[#EF233C]/30 rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto">
									{filteredExercises.map((exercise, index) => (
										<li key={index} onClick={() => selectExercise(exercise)} className="px-4 py-2 text-[#EDF2F4] hover:bg-[#EF233C]/40 cursor-pointer">
											<div className="font-semibold">{exercise.name}</div>
											{exercise.musclegroup && <div className="text-sm text-[#8D99AE]">{exercise.musclegroup}</div>}
										</li>
									))}
									</ul>
								)}
							</div>

							<select name="musclegroup" value={currentExercise.musclegroup} onChange={handleExerciseChange} className="w-full rounded-lg border border-[#EDF2F4]/40 bg-[#2B2D42] px-4 py-2 mb-3 text-[#EDF2F4] focus:border-[#EF233C] focus:outline-none focus:ring-2 focus:ring-[#EF233C]/40" required>
								<option value="" className="placeholder-gray-300">
									Select Muscle Group *
								</option>
								{MUSCLE_GROUPS.map((group) => (
									<option key={group} value={group}>
									{group}
									</option>
								))}
							</select>

							<input
								type="text"
								name="description"
								value={currentExercise.description}
								onChange={handleExerciseChange}
								placeholder="Description"
								className="w-full rounded-lg border border-[#EDF2F4]/40 bg-[#2B2D42] px-4 py-2 mb-3 text-[#EDF2F4] placeholder-gray-300 focus:border-[#EF233C] focus:outline-none focus:ring-2 focus:ring-[#EF233C]/40"
							/>

							{/* Sets Form */}
							<SetForm currentSet={currentSet} handleSetChange={handleSetChange} addSet={addSet} user={user} />

							{/* Sets List */}
							<div className="flex flex-col items-center">
								{setHistory.length > 0 && (
									<button type="button" onClick={undoLastSet} className="flex flex-row items-center gap-2 text-[#EDF2F4]/40 hover:text-[#EF233C] text-sm transition mb-2">
										<FaUndoAlt /> Undo last set
									</button>
								)}

								<SetList sets={currentExercise.sets} useImperial={user.useImperial}
									onSetsUpdate={() => {
										const updatedExercise = JSON.parse(localStorage.getItem('newWorkout_currentExercise'))
										setCurrentExercise(updatedExercise)
									}}
								/>
							</div>	
							

							{/* Add Exercise */}
							<button type="button" onClick={addExercise} className="bg-[#EF233C] w-full text-white px-4 py-2 rounded transition hover:bg-[#D90429]">
								Add Exercise
							</button>
						</div>

						{/* Exercises List */}
						<ExerciseList exercises={exercises} useImperial={user.useImperial} />
					</div>

					{/* Submit Workout */}
					<div className="space-y-4 p-4 w-full sm:max-w-2xl mx-auto bg-[#8D99AE] shadow rounded-2xl flex flex-col w-full items-center">
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
