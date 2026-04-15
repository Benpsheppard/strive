// MonthlyProgressCard.jsx

// Imports
import { useSelector } from 'react-redux'

// Function Imports
import { formatWeight, formatDuration, formatNumber, formatDistance } from '../../utils/formatValues.js'

const MonthlyProgressCard = ({ workouts }) => {
	const { user } = useSelector((state) => state.auth)

	// Current date and month
	const now = new Date()
	const monthName = now.toLocaleString('default', { month: 'long' })

	// Filter workouts for current month
	const currentMonthWorkouts = workouts.filter((workout) => {
		const workoutDate = new Date(workout.date)
		return (
			workoutDate.getMonth() === now.getMonth() &&
			workoutDate.getFullYear() === now.getFullYear()
		)
	})

	// Calculate totals
	const totalWorkouts = currentMonthWorkouts.length
	const totalDuration = currentMonthWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0)

	let totalWeight = 0
	let totalReps = 0
	let totalSets = 0
	let totalExercises = 0
	let totalDistance = 0
	let heaviestLift = 0

	currentMonthWorkouts.forEach((w) => {
		w.exercises.forEach((ex) => {
			totalExercises++

			ex.sets.forEach((set) => {
				const weight = Number(set.weight) || 0
				const reps = Number(set.reps) || 0
				const distance = Number(set.distance) || 0

				totalWeight += weight * reps
				totalReps += reps
				totalSets++
				totalDistance += distance

				if (weight > heaviestLift) {
					heaviestLift = weight
				}
			})
		})
	})

	return (
		<div className="bg-[#8D99AE] p-6 rounded-2xl shadow-lg text-center text-xl w-full">
			<h2 className="text-[#EDF2F4] text-2xl font-semibold mb-4">
                <span className="text-[#EF233C] font-bold">{monthName}</span> Summary
			</h2>

			<div className="text-[#EDF2F4] space-y-2">
				<p className="flex justify-between items-center border-b border-[#EDF2F4]/40"> Heaviest Lift <span className="text-[#EF233C] font-bold">{formatWeight(heaviestLift, user.useImperial)}</span></p>
				<p className="flex justify-between items-center border-b border-[#EDF2F4]/40"> Workouts <span className="text-[#EF233C] font-bold"> {formatNumber(totalWorkouts)} </span> </p>
				<p className="flex justify-between items-center border-b border-[#EDF2F4]/40"> Exercises <span className="text-[#EF233C] font-bold"> {formatNumber(totalExercises)} </span> </p>
				<p className="flex justify-between items-center border-b border-[#EDF2F4]/40"> Duration <span className="text-[#EF233C] font-bold"> {formatDuration(totalDuration)} </span> </p>
				<p className="flex justify-between items-center border-b border-[#EDF2F4]/40"> Sets <span className="text-[#EF233C] font-bold"> {formatNumber(totalSets)} </span> </p>
				<p className="flex justify-between items-center border-b border-[#EDF2F4]/40"> Weight <span className="text-[#EF233C] font-bold"> {formatWeight(totalWeight, user.useImperial)} </span> </p>
				<p className="flex justify-between items-center border-b border-[#EDF2F4]/40"> Reps <span className="text-[#EF233C] font-bold"> {formatNumber(totalReps)} </span> </p>
				<p className="flex justify-between items-center border-b border-[#EDF2F4]/40"> Distance Covered <span className="text-[#EF233C] font-bold">{formatDistance(totalDistance, user.useImperial)}</span></p>
			</div>
		</div>
	)
}

// Export
export default MonthlyProgressCard