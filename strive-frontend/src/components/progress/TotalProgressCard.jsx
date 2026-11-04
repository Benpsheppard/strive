// TotalProgressCard.jsx
// All-time totals

import { useSelector } from 'react-redux'

import { formatWeight, formatDuration, formatNumber, formatDistance } from '../../utils/formatValues.js'

import Card, { CardTitle } from '../ui/Card.jsx'
import StatRow from './StatRow.jsx'

const TotalProgressCard = ({ workouts }) => {
    const { user } = useSelector((state) => state.auth)

    const totals = workouts.reduce((acc, workout) => {
        acc.duration += workout.duration || 0

        workout.exercises?.forEach((ex) => {
            acc.exercises++

            ex.sets?.forEach((set) => {
                const weight = Number(set.weight) || 0
                const reps = Number(set.reps) || 0

                acc.weight += weight * reps
                acc.reps += reps
                acc.sets++
                acc.distance += Number(set.distance) || 0
                acc.heaviest = Math.max(acc.heaviest, weight)
            })
        })

        return acc
    }, { duration: 0, exercises: 0, weight: 0, reps: 0, sets: 0, distance: 0, heaviest: 0 })

    const rows = [
        ['Heaviest lift', formatWeight(totals.heaviest, user.useImperial)],
        ['Workouts', formatNumber(workouts.length)],
        ['Exercises', formatNumber(totals.exercises)],
        ['Time training', formatDuration(totals.duration)],
        ['Sets', formatNumber(totals.sets)],
        ['Volume', formatWeight(totals.weight, user.useImperial)],
        ['Reps', formatNumber(totals.reps)],
        ['Distance', formatDistance(totals.distance, user.useImperial)]
    ]

    return (
        <Card as="section" aria-labelledby="all-time-title" className="space-y-3">
            <CardTitle id="all-time-title" accent="totals">All time</CardTitle>
            <dl>
                {rows.map(([label, value]) => (
                    <StatRow key={label} label={label} value={value} showComparison={false} />
                ))}
            </dl>
        </Card>
    )
}

export default TotalProgressCard
