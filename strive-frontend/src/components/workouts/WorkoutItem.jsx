import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { deleteWorkout } from '../../features/workouts/workoutsSlice.js';
import { FaTimes, FaChevronDown, FaChevronRight } from 'react-icons/fa';
import SetList from './SetList.jsx';

const WorkoutItem = ({ workout }) => {
    const dispatch = useDispatch();
    const [workoutExpanded, setWorkoutExpanded] = useState(false);
    const [exerciseExpanded, setExerciseExpanded] = useState(false);

    // Get current user
    const { user } = useSelector((state) => state.auth);

    const onDelete = (e) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this workout?")) {
            dispatch(deleteWorkout(workout._id));
        }
    };

    const toggleExercise = (e, index) => {
        e.stopPropagation();
        setExerciseExpanded(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    const exerciseCount = workout.exercises?.length || 0;

    return (
        <div className={`relative bg-[#8D99AE] rounded-xl shadow-md p-4 mb-4 flex flex-col gap-2 max-w-2xl mx-auto cursor-pointer transition-all duration-300 ${workoutExpanded ? "max-h-auto" : "max-h-[120px] overflow-hidden"}`}
            onClick={() => setWorkoutExpanded(!workoutExpanded)}>
            {/* X delete button in top right */}
            <button onClick={onDelete} className="absolute top-2 right-2 text-[#EF233C] hover:text-[#D90429] text-lg font-bold" aria-label="Delete workout">
                <FaTimes />
            </button>

            {/* Header: Title + Date */}
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-[#EDF2F4]">{workout.title}</h2>
                <span className="text-sm text-[#2B2D42]">
                    {new Date(workout.createdAt).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                    })}
                </span>
            </div>

            {/* Summary info */}
            <p className="text-sm text-[#2B2D42]">
                Duration: <span className="font-medium">{workout.duration || 0} mins</span> 
                {" | "}
                {exerciseCount} {exerciseCount === 1 ? "exercise" : "exercises"}
            </p>


            {/* Workout Expanded content */}
            {workoutExpanded && (
                <>
                    {exerciseCount > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-[#EDF2F4] mb-2">Exercises</h3>
                            <ul className="space-y-2">
                                {workout.exercises.map((ex, index) => (
                                    <li key={index} className="bg-[#2B2D42] bg-opacity-20 rounded-lg">
                                        {/* Exercise Header - Clickable */}
                                        <div
                                            className="flex justify-between items-center p-3 cursor-pointer hover:bg-[#2B2D42] hover:bg-opacity-30 rounded-lg transition-colors"
                                            onClick={(e) => toggleExercise(e, index)}
                                        >
                                            <div className="flex items-center gap-2">
                                                {ex.sets?.length > 0 && (
                                                    exerciseExpanded[index] ? 
                                                        <FaChevronDown className="text-[#EDF2F4] text-xs" /> : 
                                                        <FaChevronRight className="text-[#EDF2F4] text-xs" />
                                                )}
                                                <span className="text-sm font-medium text-[#EDF2F4]">
                                                    {ex.name} | <span className="text-[#EF233C]">{ex.musclegroup}</span> | <span className="text-[#D90429]">{ex.description}</span>
                                                </span>
                                            </div>
                                            <span className="text-xs text-[#2B2D42]">
                                                {ex.sets?.length ? `${ex.sets.length} sets` : "No sets"}
                                            </span>
                                        </div>

                                        {/* Exercise Sets - Expandable */}
                                        {exerciseExpanded[index] && (
                                            <div className="px-3 pb-3 pt-1">
                                                <SetList sets={ex.sets} useImperial={user.useImperial}/>
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
    );
};

export default WorkoutItem;
