// ExerciseList.jsx

// Function Imports
import { formatWeight } from '../../utils/weightUnits.js';

const ExerciseList = ({ exercises, useImperial }) => {
    if (!exercises || exercises.length === 0) return null;

    return (
        <div className="max-h-64 overflow-y-auto mb-4">
        {exercises.map((ex, i) => (
            <div key={i} className="bg-[#8D99AE] p-2 rounded-lg mb-2 text-center shadow-lg">
            <h4 className="font-bold text-[#EF233C]">{ex.name}</h4>
            <p className="text-[#EDF2F4]">
                {ex.musclegroup} — {ex.description}
            </p>
            {ex.sets && ex.sets.length > 0 && (
                <ul>
                {ex.sets.map((s, idx) => (
                    <li className="text-[#2B2D42]" key={idx}>
                    - {formatWeight(s.weight, useImperial)} × {s.reps} reps
                    </li>
                ))}
                </ul>
            )}
            </div>
        ))}
        </div>
    );
};

// Export
export default ExerciseList;