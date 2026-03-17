// ExerciseList.jsx

// Function Imports
import { formatWeight } from '../../utils/formatValues.js'

const ExerciseList = ({ exercises, useImperial }) => {
    if (!exercises || exercises.length === 0) {
        return null
    }

    return (
        <div className="max-h-64 overflow-y-auto mb-4">
            {exercises.map((ex, i) => (
                <div key={i} className="bg-[#8D99AE] p-6 rounded-lg m-2 text-left shadow-lg">
                    <h4 className="font-bold text-[#EF233C] text-lg mb-2">
                        {ex.name}
                    </h4>

                    <p className="text-[#EDF2F4]/40 italic mb-2">
                        {ex.musclegroup} {ex.description && `— ${ex.description}`} 
                    </p>

                    {ex.sets && ex.sets.length > 0 && (
                        <ul className='space-y-3'>
                            {ex.sets.map((s, idx) => (
                                <li className="text-[#2B2D42] flex justify-between border-t border-[#EDF2F4]/40" key={idx}>
                                    <span>Set {idx + 1}:</span>
                                    <span>{formatWeight(s.weight, useImperial)} × {s.reps} reps</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            ))}
        </div>
    )
}

// Export
export default ExerciseList