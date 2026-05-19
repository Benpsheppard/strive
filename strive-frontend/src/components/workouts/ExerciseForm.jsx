// ExerciseForm.jsx

// Imports
import { useState, useEffect } from 'react'
import { FaUndoAlt } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { showChangeExerciseAlert } from '../../alerts/workout.js'

// Component Imports
import SetForm from "./SetForm"
import SetList from './SetList.jsx'

// Constants
import { EMPTY_EXERCISE, EMPTY_SET } from '../../utils/constants.js'

const validateSet = (trackingMode, currentSet) => {
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

const buildSet = (trackingMode, currentSet) => {
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

const ExerciseForm = ({ useImperial, currentExercise, setCurrentExercise, currentSet, setCurrentSet, setHistory, setSetHistory, exercises, setExercises, allExercises, restTimerDuration, startRestTimer }) => {
    const [searchResults, setSearchResults] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [showSuggestions, setShowSuggestions] = useState(false)
    
    const handleSearchChange = (e) => {
        const newValue = e.target.value
        setSearchQuery(newValue)

        if (currentExercise.exerciseId && currentExercise.sets?.length > 0) {
            showChangeExerciseAlert(currentExercise.sets.length).then((result) => {
                if (result.isConfirmed) {
                    setCurrentExercise(EMPTY_EXERCISE)
                    setCurrentSet(EMPTY_SET)
                    setSetHistory([])
                } else {
                    setSearchQuery(currentExercise.exerciseName)
                }
            })
        } else if (currentExercise.exerciseId) {
            setCurrentExercise(EMPTY_EXERCISE)
            setCurrentSet(EMPTY_SET)
        }
    }

    const handleSetChange = (e) => {
        const { name, value } = e.target
        setCurrentSet((prev) => ({ ...prev, [name]: value }))
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

    const addSet = () => {
        if (!currentExercise.exerciseId) {
            toast.error('Please select an exercise first.')
            return
        }
        if (!validateSet(currentExercise.trackingMode, currentSet)) {
            return
        }

        const newSet = buildSet(currentExercise.trackingMode, currentSet)

        setSetHistory(prev => [...prev, currentExercise.sets || []])
        setCurrentExercise(prev => ({ ...prev, sets: [...(prev.sets || []), newSet] }))
        setCurrentSet(EMPTY_SET)
        toast.success('Set saved!')

        if (restTimerDuration > 0) {
            startRestTimer()
        }
    }

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

    const undoLastSet = () => {
        if (setHistory.length === 0) return
        const previous = setHistory[setHistory.length - 1]
        setCurrentExercise(prev => ({ ...prev, sets: previous }))
        setSetHistory(prev => prev.slice(0, -1))
        toast.info('Last set removed.')
    }

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
    
    return (
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
                    <select value={currentExercise.selectedEquipment} onChange={(e) => setCurrentExercise((prev) => ({ ...prev, selectedEquipment: e.target.value }))} className="w-full rounded-lg border border-[#EDF2F4]/40 bg-[#2B2D42] px-4 py-2 text-[#EDF2F4] focus:border-[#EF233C] focus:outline-none focus:ring-2 focus:ring-[#EF233C]/40" >
                        {currentExercise.equipment.map((eq) => (
                            <option key={eq} value={eq}>{eq}</option>
                        ))}
                    </select>

                    {/* Set Input */}
                    <div className="space-y-2">
                        <SetForm currentExercise={currentExercise} currentSet={currentSet} handleSetChange={handleSetChange} />
                        <button type="button" onClick={addSet} className="bg-[#EF233C] w-full text-white px-4 py-2 rounded transition hover:bg-[#D90429]">
                            Add Set to Exercise
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
                            useImperial={useImperial}
                            onSetsUpdate={() => {
                                const updatedExercise = JSON.parse(localStorage.getItem('newWorkout_currentExercise'))
                                setCurrentExercise(updatedExercise)
                            }}
                        />
                    </div>

                    {/* Add Exercise Button */}
                    {currentExercise.sets.length > 0 && (
                        <button type="button" onClick={addExercise} className="bg-[#EF233C] w-full text-white px-4 py-2 rounded transition hover:bg-[#D90429]">
                            Finish Exercise
                        </button>
                    )}
                </>
            )}
        </div>
    )
}

export default ExerciseForm