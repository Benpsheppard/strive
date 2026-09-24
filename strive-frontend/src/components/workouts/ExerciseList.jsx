// ExerciseList.jsx
import { formatWeight } from '../../utils/formatValues.js'

const ExerciseList = ({ exercises, useImperial }) => {
    if (!exercises || exercises.length === 0) return null

    const calculateExerciseStats = (exercise) => { 
        const sets = exercise.sets || [] 
        const totalSets = sets.length 

        const totalReps = sets.reduce((total, set) => total + (Number(set.reps) || 0), 0) 
        const totalWeight = sets.reduce((total, set) => { 
            const weight = Number(set.weight) || 0 
            const reps = Number(set.reps) || 0 
            return total + weight * reps 
        }, 0) 
        
        return { 
            totalSets, 
            totalReps, 
            totalWeight, 
        } 
    }

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
            <li key={idx} className="text-[#2B2D42] bg-[#EDF2F4]/30 rounded-xl flex justify-between p-2">
                <span>Set {idx + 1}</span>
                <span>{summary}</span>
            </li>
        )
    }

    return (
        <div className="max-h-64 overflow-y-auto mb-4">
            {exercises.map((ex, i) => {
                const { totalSets, totalReps, totalWeight } = calculateExerciseStats(ex)
                return (
                    <div key={i} className="bg-[#8D99AE] p-6 rounded-lg m-2 text-left shadow-lg">
                        <h4 className="font-bold text-[#EF233C] text-lg mb-2">
                            {ex.exerciseName}
                        </h4>

                        <p className="text-[#EDF2F4]/40 italic mb-2">
                            {ex.muscleGroup} {ex.selectedEquipment && `— ${ex.selectedEquipment}`}
                        </p>

                        {ex.sets && ex.sets.length > 0 && (
                            <div className="space-y-2">
                                {ex.sets.map((s, idx) => renderSet(s, idx, ex.trackingMode))}
                            </div>
                        )}

                        <div className="grid grid-cols-3 gap-2 mt-2 text-center"> 
                            <div className="bg-[#EDF2F4]/30 rounded-lg p-2">
                                <p className="font-bold text-[#EF233C]">
                                    {totalSets}
                                </p>
                                <p className="text-xs text-[#EDF2F4]/70">
                                    Sets 
                                </p>
                            </div>
                            <div className="bg-[#EDF2F4]/30 rounded-lg p-2">
                                <p className="font-bold text-[#EF233C]">
                                    {totalReps}
                                </p>
                                <p className="text-xs text-[#EDF2F4]/70">
                                    Reps
                                </p>
                            </div> 
                            <div className="bg-[#EDF2F4]/30 rounded-lg p-2">
                                <p className="font-bold text-[#EF233C]">
                                    {formatWeight(totalWeight, useImperial)} 
                                </p> 
                                <p className="text-xs text-[#EDF2F4]/70">
                                    Volume
                                </p>
                            </div> 
                        </div>
                    </div>
                )})}
        </div>
    )
}

export default ExerciseList