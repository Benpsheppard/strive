// MonthlyProgressCard.jsx
// One month's totals, compared with the previous month over the same stretch of days

import { useState } from 'react'
import { useSelector } from 'react-redux'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'

import { formatWeight, formatDuration, formatNumber, formatDistance } from '../../utils/formatValues.js'

import Card from '../ui/Card.jsx'
import StatRow from './StatRow.jsx'

// Totals for the month containing `target`. `untilDay` limits it to days 1..untilDay.
const calculateStats = (workouts, target, untilDay = 31) => {
    const stats = {
        totalWorkouts: 0, totalDuration: 0, totalWeight: 0, totalReps: 0,
        totalSets: 0, totalExercises: 0, totalDistance: 0, heaviestLift: 0
    }

    workouts.forEach((workout) => {
        const date = new Date(workout.date || workout.createdAt)
        if (date.getMonth() !== target.getMonth() || date.getFullYear() !== target.getFullYear()) return
        if (date.getDate() > untilDay) return

        stats.totalWorkouts++
        stats.totalDuration += workout.duration || 0

        workout.exercises?.forEach((ex) => {
            stats.totalExercises++

            ex.sets?.forEach((set) => {
                const weight = Number(set.weight) || 0
                const reps = Number(set.reps) || 0

                stats.totalWeight += weight * reps
                stats.totalReps += reps
                stats.totalSets++
                stats.totalDistance += Number(set.distance) || 0
                stats.heaviestLift = Math.max(stats.heaviestLift, weight)
            })
        })
    })

    return stats
}

const MonthlyProgressCard = ({ workouts }) => {
    const { user } = useSelector((state) => state.auth)
    const [currentDate, setCurrentDate] = useState(new Date())

    const today = new Date()
    const isCurrentMonth = currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear()

    const changeMonth = (delta) => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1))

    const monthName = currentDate.toLocaleString('default', { month: 'long' })
    const previousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)

    // Part-way through a month, compare with the same days of last month rather than all of it
    const untilDay = isCurrentMonth ? today.getDate() : 31
    const current = calculateStats(workouts, currentDate, untilDay)
    const previous = calculateStats(workouts, previousMonth, untilDay)

    const rows = [
        ['Heaviest lift', formatWeight(current.heaviestLift, user.useImperial), 'heaviestLift'],
        ['Workouts', formatNumber(current.totalWorkouts), 'totalWorkouts'],
        ['Exercises', formatNumber(current.totalExercises), 'totalExercises'],
        ['Duration', formatDuration(current.totalDuration), 'totalDuration'],
        ['Sets', formatNumber(current.totalSets), 'totalSets'],
        ['Volume', formatWeight(current.totalWeight, user.useImperial), 'totalWeight'],
        ['Reps', formatNumber(current.totalReps), 'totalReps'],
        ['Distance', formatDistance(current.totalDistance, user.useImperial), 'totalDistance']
    ]

    return (
        <Card as="section" aria-label="Monthly summary" className="space-y-3">
            <div className="flex items-center justify-between">
                <button type="button" aria-label="Previous month" onClick={() => changeMonth(-1)} className="flex h-10 w-10 items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-fg">
                    <FaChevronLeft aria-hidden="true" />
                </button>

                <h2 className="font-display text-2xl font-bold" aria-live="polite">
                    <span className="text-accent-fg">{monthName}</span> {currentDate.getFullYear()}
                </h2>

                <button type="button" aria-label="Next month" onClick={() => changeMonth(1)} disabled={isCurrentMonth} className="flex h-10 w-10 items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-fg disabled:opacity-30">
                    <FaChevronRight aria-hidden="true" />
                </button>
            </div>

            <p className="text-sm text-muted">
                {isCurrentMonth
                    ? `Compared with the first ${today.getDate()} day${today.getDate() === 1 ? '' : 's'} of last month`
                    : 'Compared with the month before'}
            </p>

            <dl>
                {rows.map(([label, value, key]) => (
                    <StatRow key={key} label={label} value={value} current={current[key]} previous={previous[key]} />
                ))}
            </dl>
        </Card>
    )
}

export default MonthlyProgressCard
