// WorkoutStats.jsx

// Imports
import { FaDumbbell } from 'react-icons/fa'
import { formatDuration, formatWeight } from '../../utils/formatValues'

const WorkoutStats = ({ workout, user }) => {
    return (
        <div className="fade-in-card bg-[#8D99AE] rounded-2xl px-6 py-5" style={{ animationDelay: '0.2s' }}>
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
    )
}

export default WorkoutStats