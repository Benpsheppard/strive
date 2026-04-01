// TotalProgressCard.jsx

// Imports
import { useSelector } from 'react-redux'

// Function Imports
import { formatWeight, formatDuration, formatNumber } from '../../utils/formatValues.js'

const TotalProgressCard = ({ workouts }) => {
	const { user } = useSelector((state) => state.auth)

	// Calculate stats
    const totalWorkouts = workouts.length
    const totalDuration = workouts.reduce((sum, w) => sum + w.duration, 0)

    let totalWeight = 0
    let totalReps = 0
    let totalSets = 0
    let totalExercises = 0
    let heaviestLift = 0

    workouts.forEach((w) => {
        w.exercises.forEach((ex) => {
            totalExercises++ // count exercises

            ex.sets.forEach((set) => {
                const weight = Number(set.weight) || 0
                const reps = Number(set.reps) || 0

                totalWeight += weight * reps
                totalReps += reps
                totalSets++

                if (weight > heaviestLift) {
                    heaviestLift = weight
                }
            })
        })
    })

	return (
		<div className="bg-[#8D99AE] p-6 rounded-2xl shadow-lg text-center text-xl w-full">
			<h2 className="text-[#EDF2F4] text-2xl font-semibold mb-4">
                <span className="text-[#EF233C] font-bold">All Time</span> Summary
			</h2>
			<div className="text-[#EDF2F4] space-y-2">
				<p className="flex justify-between items-center border-b border-[#EDF2F4]/40">Total Workouts <span className="text-[#EF233C] font-bold">{formatNumber(totalWorkouts)}</span></p>
				<p className="flex justify-between items-center border-b border-[#EDF2F4]/40">Total Exercises <span className="text-[#EF233C] font-bold">{formatNumber(totalExercises)}</span></p>
				<p className="flex justify-between items-center border-b border-[#EDF2F4]/40">Total Duration <span className="text-[#EF233C] font-bold">{formatDuration(totalDuration)}</span></p>
				<p className="flex justify-between items-center border-b border-[#EDF2F4]/40">Total Sets <span className="text-[#EF233C] font-bold">{formatNumber(totalSets)}</span></p>
				<p className="flex justify-between items-center border-b border-[#EDF2F4]/40">Total Weight <span className="text-[#EF233C] font-bold">{formatWeight(totalWeight, user.useImperial)}</span></p>
				<p className="flex justify-between items-center border-b border-[#EDF2F4]/40">Total Reps <span className="text-[#EF233C] font-bold">{formatNumber(totalReps)}</span></p>
			</div>
		</div>
	)
}

// Export
export default TotalProgressCard