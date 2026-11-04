// WorkoutStats.jsx

import { FaDumbbell } from 'react-icons/fa'
import Card, { CardTitle } from '../ui/Card.jsx'
import StatTile from '../ui/StatTile.jsx'
import { formatDuration, formatWeight, formatNumber } from '../../utils/formatValues'

const WorkoutStats = ({ workout, user }) => {
    const sets = workout.exercises.reduce((total, ex) => total + (ex.sets?.length || 0), 0)
    const volume = workout.summary?.totalWeight || 0

    return (
        <Card as="section" aria-labelledby="stats-title" className="space-y-3">
            <CardTitle id="stats-title" className="flex items-center gap-2">
                <FaDumbbell aria-hidden="true" className="text-accent-fg" /> Workout stats
            </CardTitle>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatTile value={formatDuration(workout.duration)} label="Duration" />
                <StatTile value={formatNumber(workout.exercises.length)} label="Exercises" />
                <StatTile value={formatNumber(sets)} label="Sets" />
                <StatTile value={volume > 0 ? formatWeight(volume, user.useImperial) : '—'} label="Lifted" />
            </div>
        </Card>
    )
}

export default WorkoutStats
