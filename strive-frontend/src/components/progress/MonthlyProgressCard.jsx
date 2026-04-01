// MonthlyProgressCard.jsx

// Imports
import { useSelector } from 'react-redux'

// Function Imports
import { formatWeight, formatDuration, formatNumber } from '../../utils/formatValues.js'

const MonthlyProgressCard = ({ workouts }) => {
	const { user } = useSelector((state) => state.auth)

	// Current date
	const now = new Date()

	// Current month name
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

	const totalExercises = currentMonthWorkouts.reduce(
		(total, workout) => total + workout.exercises.length,
		0
	)

	const totalDuration = currentMonthWorkouts.reduce(
		(total, workout) => total + (workout.duration || 0),
		0
	)

	const totalSets = currentMonthWorkouts.reduce(
		(total, workout) =>
			total +
			workout.exercises.reduce(
				(exTotal, exercise) => exTotal + exercise.sets.length,
				0
			),
		0
	)

	const totalWeight = currentMonthWorkouts.reduce(
		(total, workout) =>
			total +
			workout.exercises.reduce(
				(exTotal, exercise) =>
					exTotal +
					exercise.sets.reduce(
						(setTotal, set) =>
							setTotal + (set.weight || 0) * (set.reps || 0),
						0
					),
				0
			),
		0
	)

	const totalReps = currentMonthWorkouts.reduce(
		(total, workout) =>
			total +
			workout.exercises.reduce(
				(exTotal, exercise) =>
					exTotal +
					exercise.sets.reduce(
						(setTotal, set) => setTotal + (set.reps || 0),
						0
					),
				0
			),
		0
	)

	return (
		<div className="bg-[#8D99AE] p-6 rounded-2xl shadow-lg text-center text-xl w-full">
			<h2 className="text-[#EDF2F4] text-2xl font-semibold mb-4">
                <span className="text-[#EF233C] font-bold">{monthName}</span> Summary
			</h2>

			<div className="text-[#EDF2F4] space-y-2">
				<p className="flex justify-between items-center border-b border-[#EDF2F4]/40"> Workouts <span className="text-[#EF233C] font-bold"> {formatNumber(totalWorkouts)} </span> </p>
				<p className="flex justify-between items-center border-b border-[#EDF2F4]/40"> Exercises <span className="text-[#EF233C] font-bold"> {formatNumber(totalExercises)} </span> </p>
				<p className="flex justify-between items-center border-b border-[#EDF2F4]/40"> Duration <span className="text-[#EF233C] font-bold"> {formatDuration(totalDuration)} </span> </p>
				<p className="flex justify-between items-center border-b border-[#EDF2F4]/40"> Sets <span className="text-[#EF233C] font-bold"> {formatNumber(totalSets)} </span> </p>
				<p className="flex justify-between items-center border-b border-[#EDF2F4]/40"> Weight <span className="text-[#EF233C] font-bold"> {formatWeight(totalWeight, user.useImperial)} </span> </p>
				<p className="flex justify-between items-center border-b border-[#EDF2F4]/40"> Reps <span className="text-[#EF233C] font-bold"> {formatNumber(totalReps)} </span> </p>
			</div>
		</div>
	)
}

// Export
export default MonthlyProgressCard