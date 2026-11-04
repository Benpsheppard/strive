// RollingStats.jsx
// Live totals for the workout in progress

import { useMemo } from 'react'
import Card, { CardTitle } from '../ui/Card.jsx'
import StatTile from '../ui/StatTile.jsx'
import { calculateAllPersonalBests, buildPBKey } from '../../utils/pbDetection.js'
import { formatWeight, formatNumber } from '../../utils/formatValues.js'
import { measurePB, beatsPB, getSetVolume } from '../../utils/trackingModes.js'

const RollingStats = ({ workouts, exercises, useImperial }) => {
    const personalBests = useMemo(() => calculateAllPersonalBests(workouts), [workouts])

    const stats = useMemo(() => {
        const result = { sets: 0, reps: 0, volume: 0, pbs: 0, setsByMuscle: {} }

        exercises.forEach((exercise) => {
            const sets = exercise.sets || []
            const muscle = exercise.muscleGroup || 'Other'

            sets.forEach((set) => {
                result.sets += 1
                result.reps += Number(set.reps) || 0
                result.volume += getSetVolume(set)
            })
            result.setsByMuscle[muscle] = (result.setsByMuscle[muscle] || 0) + sets.length

            // A first-ever result is not a PB
            const previous = personalBests[buildPBKey(exercise.exerciseName || '', exercise.selectedEquipment)]
            const reading = measurePB(exercise.trackingMode, sets)
            if (previous && reading && beatsPB(previous.metric, previous.value, reading.value)) {
                result.pbs += 1
            }
        })

        return result
    }, [exercises, personalBests])

    return (
        <Card as="section" aria-labelledby="workout-stats-title">
            <CardTitle as="h2" accent="so far" className="mb-3" id="workout-stats-title">Workout</CardTitle>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatTile value={formatNumber(stats.sets)} label="Sets" />
                <StatTile value={formatNumber(stats.reps)} label="Reps" />
                <StatTile value={formatNumber(exercises.length)} label="Exercises" />
                <StatTile value={formatNumber(stats.pbs)} label="PBs" />
            </div>

            {stats.volume > 0 && (
                <p className="mt-3 text-center text-sm text-muted">
                    Total volume: <span className="font-semibold text-fg">{formatWeight(stats.volume, useImperial)}</span>
                </p>
            )}

            {Object.keys(stats.setsByMuscle).length > 0 && (
                <ul className="mt-3 space-y-1.5" aria-label="Sets by muscle group">
                    {Object.entries(stats.setsByMuscle).map(([muscle, count]) => (
                        <li key={muscle} className="flex justify-between rounded-lg bg-bg/60 px-3 py-1.5 text-sm">
                            <span className="text-muted">{muscle}</span>
                            <span className="font-semibold text-fg">{count} {count === 1 ? 'set' : 'sets'}</span>
                        </li>
                    ))}
                </ul>
            )}
        </Card>
    )
}

export default RollingStats
