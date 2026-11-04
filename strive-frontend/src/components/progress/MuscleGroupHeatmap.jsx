// MuscleGroupHeatmap.jsx
// How recently each muscle group was trained

import { useMemo } from 'react'
import Card from '../ui/Card.jsx'
import { MUSCLE_GROUPS_HEATMAP } from '../../utils/muscleGroupUtils'
import { cx } from '../../utils/cx.js'

const getTone = (daysSince) => {
    if (daysSince === null || daysSince >= 5) return 'bg-bg/60 text-muted'
    if (daysSince === 0) return 'bg-accent text-white'
    if (daysSince === 1) return 'bg-accent/80 text-white'
    if (daysSince === 2) return 'bg-accent/60 text-white'
    if (daysSince === 3) return 'bg-accent/45 text-fg'
    return 'bg-accent/30 text-fg'
}

const MuscleGroupHeatmap = ({ workouts }) => {
    const daysSinceByGroup = useMemo(() => {
        const now = new Date()
        const result = {}

        MUSCLE_GROUPS_HEATMAP.forEach(group => {
            let latest = null
            workouts.forEach(workout => {
                if (!workout.exercises?.some(e => e.exercise?.muscleGroup === group)) return
                const date = new Date(workout.createdAt)
                if (!latest || date > latest) latest = date
            })
            result[group] = latest ? Math.floor((now - latest) / (1000 * 60 * 60 * 24)) : null
        })

        return result
    }, [workouts])

    return (
        <Card as="section" aria-label="Muscle groups recently trained" className="flex h-full flex-col gap-3">
            <div>
                <h2 className="font-display text-2xl font-bold">Muscle <span className="text-accent-fg">groups</span></h2>
                <p className="text-sm text-muted">Brighter means trained more recently</p>
            </div>

            <ul className="grid flex-1 grid-cols-2 gap-2">
                {MUSCLE_GROUPS_HEATMAP.map(group => {
                    const daysSince = daysSinceByGroup[group]
                    return (
                        <li key={group} className={cx('flex flex-col items-center justify-center rounded-xl p-2 text-center', getTone(daysSince))}>
                            <span className="text-sm font-semibold">{group}</span>
                            <span className="text-xs">
                                {daysSince === null ? 'Not yet' : daysSince === 0 ? 'Today' : `${daysSince}d ago`}
                            </span>
                        </li>
                    )
                })}
            </ul>
        </Card>
    )
}

export default MuscleGroupHeatmap
