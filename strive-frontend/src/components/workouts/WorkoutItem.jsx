// WorkoutItem.jsx

// Imports
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FaTimes, FaChevronDown, FaChevronRight } from 'react-icons/fa'

// Function Imports
import { deleteWorkout } from '../../features/workouts/workoutsSlice.js'
import { showConfirmDeleteAlert } from '../../alerts/workoutItem.js'

// Component Imports
import SetList from './SetList.jsx'
import { formatDistance, formatDuration, formatNumber, formatWeight, formatWorkoutStartTime } from '../../utils/formatValues.js'

const WorkoutItem = ({ workout }) => {
    const { user } = useSelector((state) => state.auth)

    const dispatch = useDispatch()

    const [workoutExpanded, setWorkoutExpanded] = useState(false)
    const [exerciseExpanded, setExerciseExpanded] = useState(false)

    const onDelete = (e) => {
        e.stopPropagation()

        showConfirmDeleteAlert()
        .then((result) => {
            if (result.isConfirmed) {
                dispatch(deleteWorkout(workout._id))
            }
        })
    }

    const toggleExercise = (e, index) => {
        e.stopPropagation()
        setExerciseExpanded(prev => ({
            ...prev,
            [index]: !prev[index]
        }))
    }

    const exerciseCount = workout.exercises?.length

    return (
        <div className={`relative bg-[#8D99AE] rounded-xl shadow-md p-2 flex flex-col gap-2 mx-auto cursor-pointer transition-all duration-300 ${workoutExpanded ? "max-h-auto" : "max-h-[50px] overflow-hidden"}`}
            onClick={() => setWorkoutExpanded(!workoutExpanded)}>
            <div className="flex flex-row justify-between">
                {/* Header: Title + Date */}
                <div className="flex justify-between items-center gap-3 text-[#EDF2F4]">
                    <button>
                        {workoutExpanded ? (
                            <FaChevronDown />
                        ) : (
                            <FaChevronRight />
                        )}
                    </button>
                    
                    <h2 className="text-xl font-semibold items-center">
                        {workout.title}
                    </h2>
                </div>

                <div className="flex flex-row items-center gap-3">
                    {/* Date and starting time */}
                    <p className="text-sm text-[#2B2D42]">
                        {formatWorkoutStartTime(workout.createdAt, workout.duration)}
                    </p>

                    {/* X delete button in top right */}
                    <button onClick={onDelete} className="text-[#EF233C] hover:text-[#D90429] text-sm font-bold">
                        <FaTimes />
                    </button>
                </div>
            </div>

            {/* Workout Expanded content */}
            {workoutExpanded && (
                <>
                    <div className="grid grid-cols-3 gap-2">
                        <div className="bg-[#2B2D42] bg-opacity-20 rounded-lg p-2 text-center hover:scale-102">
                            <p className="text-xs text-[#EDF2F4]">Weight</p>
                            <p className="font-semibold text-[#EF233C]">{formatWeight(workout.summary.totalWeight, user.useImperial)}</p>
                        </div>

                        <div className="bg-[#2B2D42] bg-opacity-20 rounded-lg p-2 text-center hover:scale-102">
                            <p className="text-xs text-[#EDF2F4]">Reps</p>
                            <p className="font-semibold text-[#EF233C]">{formatNumber(workout.summary.totalReps)}</p>
                        </div>

                        <div className="bg-[#2B2D42] bg-opacity-20 rounded-lg p-2 text-center hover:scale-102">
                            <p className="text-xs text-[#EDF2F4]">Sets</p>
                            <p className="font-semibold text-[#EF233C]">{formatNumber(workout.summary.totalSets)}</p>
                        </div>

                        <div className="bg-[#2B2D42] bg-opacity-20 rounded-lg p-2 text-center hover:scale-102">
                            <p className="text-xs text-[#EDF2F4]">Duration</p>
                            <p className="font-semibold text-[#EF233C]">{formatDuration(workout.duration)}</p>
                        </div>

                        <div className="bg-[#2B2D42] bg-opacity-20 rounded-lg p-2 text-center hover:scale-102">
                            <p className="text-xs text-[#EDF2F4]">Distance</p>
                            <p className="font-semibold text-[#EF233C]">{formatDistance(workout.summary.totalDistance, user.useImperial)}</p>
                        </div>

                        <div className="bg-[#2B2D42] bg-opacity-20 rounded-lg p-2 text-center hover:scale-102">
                            <p className="text-xs text-[#EDF2F4]">Cardio</p>
                            <p className="font-semibold text-[#EF233C]">{formatNumber(workout.summary.totalDuration)}m</p>
                        </div>

                        <div className="bg-[#2B2D42] bg-opacity-20 rounded-lg p-2 text-center hover:scale-102">
                            <p className="text-xs text-[#EDF2F4]">SP</p>
                            <p className="font-semibold text-[#EF233C]">{formatNumber(workout.summary.totalStrivePoints.total)}</p>
                        </div>

                        <div className="bg-[#2B2D42] bg-opacity-20 rounded-lg p-2 text-center hover:scale-102">
                            <p className="text-xs text-[#EDF2F4]">Quests Completed</p>
                            <p className="font-semibold text-[#EF233C]">{formatNumber(workout.summary.questsCompleted.length)}</p>
                        </div>

                        <div className="bg-[#2B2D42] bg-opacity-20 rounded-lg p-2 text-center hover:scale-102">
                            <p className="text-xs text-[#EDF2F4]">PBs Achieved</p>
                            <p className="font-semibold text-[#EF233C]">{formatNumber(workout.summary.personalBests.length)}</p>
                        </div>
                    </div>

                    {exerciseCount > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-[#EDF2F4] mb-2">Exercises</h3>
                            <ul className="space-y-2">
                                {workout.exercises.map((ex, index) => (
                                    <li key={index} className="bg-[#2B2D42] bg-opacity-20 rounded-lg">
                                        {/* Exercise Header */}
                                        <div className="flex justify-between items-center p-3 cursor-pointer hover:bg-[#2B2D42] hover:bg-opacity-30 rounded-lg transition-colors" onClick={(e) => toggleExercise(e, index)}>
                                            <div className="flex items-center gap-2">
                                                {ex.sets?.length > 0 && (
                                                    exerciseExpanded[index]
                                                        ? <FaChevronDown className="text-[#EDF2F4] text-xs" />
                                                        : <FaChevronRight className="text-[#EDF2F4] text-xs" />
                                                )}
                                                <span className="text-sm font-medium text-[#EDF2F4]">
                                                    {ex.exercise?.name}
                                                    {" | "}
                                                    <span className="text-[#EF233C]">{ex.exercise?.muscleGroup}</span>
                                                    {" | "}
                                                    <span className="text-[#D90429]">{ex.selectedEquipment}</span>
                                                </span>
                                            </div>
                                            <span className="text-xs text-[#2B2D42]">
                                                {ex.sets?.length ? `${ex.sets.length} sets` : "No sets"}
                                            </span>
                                        </div>

                                        {/* Exercise Sets */}
                                        {exerciseExpanded[index] && (
                                            <div className="px-3 pb-3 pt-1">
                                                <SetList sets={ex.sets} trackingMode={ex.exercise?.trackingMode} useImperial={user.useImperial} />
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

// Export
export default WorkoutItem