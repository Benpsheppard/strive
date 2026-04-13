// ExerciseList.jsx
import { formatWeight } from '../../utils/formatValues.js'

const ExerciseList = ({ exercises, useImperial }) => {
    if (!exercises || exercises.length === 0) return null

    const renderSet = (set, idx, trackingMode) => {
        let summary = ''

        switch (trackingMode) {
            case 'weight_reps':
                summary = `${formatWeight(set.weight, useImperial)} × ${set.reps} reps`
                break
            case 'bodyweight_reps':
                summary = `${set.reps} reps${set.addedWeight ? ` + ${formatWeight(set.addedWeight, useImperial)}` : ''}`
                break
            case 'assisted_reps':
                summary = `${set.reps} reps (${formatWeight(set.assistance, useImperial)} assistance)`
                break
            case 'duration':
                summary = `${set.duration}s`
                break
            case 'distance_duration':
                summary = `${set.distance}km in ${set.duration} mins`
                break
            case 'reps':
                summary = `${set.reps} reps`
                break
            default:
                summary = JSON.stringify(set)
        }

        return (
            <li key={idx} className="text-[#2B2D42] flex justify-between border-t border-[#EDF2F4]/40">
                <span>Set {idx + 1}:</span>
                <span>{summary}</span>
            </li>
        )
    }

    return (
        <div className="max-h-64 overflow-y-auto mb-4">
            {exercises.map((ex, i) => (
                <div key={i} className="bg-[#8D99AE] p-6 rounded-lg m-2 text-left shadow-lg">
                    <h4 className="font-bold text-[#EF233C] text-lg mb-2">
                        {ex.exerciseName}
                    </h4>
                    <p className="text-[#EDF2F4]/40 italic mb-2">
                        {ex.muscleGroup} {ex.selectedEquipment && `— ${ex.selectedEquipment}`}
                    </p>
                    {ex.sets && ex.sets.length > 0 && (
                        <ul className="space-y-3">
                            {ex.sets.map((s, idx) => renderSet(s, idx, ex.trackingMode))}
                        </ul>
                    )}
                </div>
            ))}
        </div>
    )
}

export default ExerciseList