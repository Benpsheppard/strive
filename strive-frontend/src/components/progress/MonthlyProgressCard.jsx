// MonthlyProgressCard.jsx

// Imports
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'

// Function Imports
import { formatWeight, formatDuration, formatNumber, formatDistance } from '../../utils/formatValues.js'

// Component Imports
import StatRow from './StatRow.jsx'

const MonthlyProgressCard = ({ workouts }) => {
    const { user } = useSelector((state) => state.auth)

    const [currentDate, setCurrentDate] = useState(new Date())

    const today = new Date()

    // Navigation
    const prevMonth = () => {
        setCurrentDate(
            new Date(
                currentDate.getFullYear(),
                currentDate.getMonth() - 1,
                1
            )
        )
    }

    const nextMonth = () => {
        setCurrentDate(
            new Date(
                currentDate.getFullYear(),
                currentDate.getMonth() + 1,
                1
            )
        )
    }

    const isCurrentMonth =
        currentDate.getMonth() === today.getMonth() &&
        currentDate.getFullYear() === today.getFullYear()

    // Month labels
    const monthName = currentDate.toLocaleString('default', {
        month: 'long'
    })

    const year = currentDate.getFullYear()

    // Reusable stats calculator
    const calculateStats = (targetDate) => {
        const filtered = workouts.filter((workout) => {
            const workoutDate = new Date(workout.date || workout.createdAt)

            return (
                workoutDate.getMonth() === targetDate.getMonth() &&
                workoutDate.getFullYear() === targetDate.getFullYear()
            )
        })

        const stats = {
            totalWorkouts: filtered.length,
            totalDuration: 0,
            totalWeight: 0,
            totalReps: 0,
            totalSets: 0,
            totalExercises: 0,
            totalDistance: 0,
            heaviestLift: 0
        }

        filtered.forEach((w) => {
            stats.totalDuration += w.duration || 0

            w.exercises.forEach((ex) => {
                stats.totalExercises++

                ex.sets.forEach((set) => {
                    const weight = Number(set.weight) || 0
                    const reps = Number(set.reps) || 0
                    const distance = Number(set.distance) || 0

                    stats.totalWeight += weight * reps
                    stats.totalReps += reps
                    stats.totalSets++
                    stats.totalDistance += distance

                    if (weight > stats.heaviestLift) {
                        stats.heaviestLift = weight
                    }
                })
            })
        })

        return stats
    }

    // Current month stats
    const currentStats = calculateStats(currentDate)

    // Previous month stats
    const previousMonthDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 1,
        1
    )

    const previousStats = calculateStats(previousMonthDate)

    return (
        <div className="bg-[#8D99AE] p-6 rounded-2xl shadow-lg text-center text-xl w-full">

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <button onClick={prevMonth} className="text-[#EDF2F4] hover:text-[#EF233C] transition text-xl px-2" >
                    <FaChevronLeft />
                </button>

                <h2 className="text-[#EDF2F4] text-2xl font-semibold">
                    <span className="text-[#EF233C] font-bold">
                        {monthName}
                    </span>{' '}
                    {year} Summary
                </h2>

                <button onClick={nextMonth} disabled={isCurrentMonth} className={`text-xl px-2 transition ${ isCurrentMonth ? 'text-[#EDF2F4] opacity-20 cursor-not-allowed' : 'text-[#EDF2F4] hover:text-[#EF233C]' }`} >
                    <FaChevronRight />
                </button>
            </div>

            {/* Stats */}
            <div className="text-[#EDF2F4] space-y-2">
                <StatRow
                    label="Heaviest Lift"
                    value={formatWeight(currentStats.heaviestLift, user.useImperial)}
                    current={currentStats.heaviestLift}
                    previous={previousStats.heaviestLift}
                />

                <StatRow
                    label="Workouts"
                    value={formatNumber(currentStats.totalWorkouts)}
                    current={currentStats.totalWorkouts}
                    previous={previousStats.totalWorkouts}
                />

                <StatRow
                    label="Exercises"
                    value={formatNumber(currentStats.totalExercises)}
                    current={currentStats.totalExercises}
                    previous={previousStats.totalExercises}
                />

                <StatRow
                    label="Duration"
                    value={formatDuration(currentStats.totalDuration)}
                    current={currentStats.totalDuration}
                    previous={previousStats.totalDuration}
                />

                <StatRow
                    label="Sets"
                    value={formatNumber(currentStats.totalSets)}
                    current={currentStats.totalSets}
                    previous={previousStats.totalSets}
                />

                <StatRow
                    label="Weight"
                    value={formatWeight(currentStats.totalWeight, user.useImperial)}
                    current={currentStats.totalWeight}
                    previous={previousStats.totalWeight}
                />

                <StatRow
                    label="Reps"
                    value={formatNumber(currentStats.totalReps)}
                    current={currentStats.totalReps}
                    previous={previousStats.totalReps}
                />

                <StatRow
                    label="Distance Covered"
                    value={formatDistance(currentStats.totalDistance, user.useImperial)}
                    current={currentStats.totalDistance}
                    previous={previousStats.totalDistance}
                />
            </div>
        </div>
    )
}

export default MonthlyProgressCard