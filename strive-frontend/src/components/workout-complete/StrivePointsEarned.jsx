// StrivePointsEarned.jsx
// How many Strive Points the workout earned and where they came from

import { FaStar } from 'react-icons/fa'
import Card, { CardTitle } from '../ui/Card.jsx'
import { formatNumber } from '../../utils/formatValues.js'

// Labels and colours for how this workout compared with your own recent average
const getRating = (score) => {
    if (score <= 0.9) return { label: 'Building', colour: 'text-muted' }
    if (score <= 1.0) return { label: 'Solid', colour: 'text-success' }
    if (score <= 1.05) return { label: 'Great', colour: 'text-secondary' }
    if (score <= 1.1) return { label: 'Excellent', colour: 'text-warning' }
    if (score <= 1.25) return { label: 'Elite', colour: 'text-warning' }
    return { label: 'Legendary', colour: 'text-accent-fg' }
}

const StrivePointsEarned = ({ workout }) => {
    const points = workout.summary?.totalStrivePoints || {}
    const noSPReason = workout.summary?.noSPReason

    // Too small to count: explain why instead of showing an empty breakdown
    if (noSPReason) {
        return (
            <Card as="section" aria-labelledby="sp-title" className="space-y-3">
                <CardTitle id="sp-title" className="flex items-center gap-2">
                    <FaStar aria-hidden="true" className="text-accent-fg" /> Strive Points
                </CardTitle>
                <p className="py-4 text-center font-display text-5xl font-extrabold text-muted">+0 SP</p>
                <p role="status" className="rounded-xl bg-bg/60 p-4 text-center text-muted">{noSPReason}</p>
            </Card>
        )
    }

    const categories = [
        { title: 'Volume', data: points.volume },
        { title: 'Strength', data: points.strength },
        { title: 'Progression', data: points.progression }
    ].filter(category => category.data)

    return (
        <Card as="section" aria-labelledby="sp-title" className="space-y-4">
            <CardTitle id="sp-title" className="flex items-center gap-2">
                <FaStar aria-hidden="true" className="text-accent-fg" /> Strive Points earned
            </CardTitle>

            <p className="rounded-xl bg-bg/60 py-6 text-center font-display text-6xl font-extrabold text-accent-fg">
                +{formatNumber(points.total)} SP
            </p>

            {points.dailyCapReached && (
                <p role="status" className="rounded-xl bg-bg/60 p-3 text-center text-sm text-muted">
                    You reached today&apos;s Strive Points limit, so this workout was capped. It resets tomorrow.
                </p>
            )}

            <div className="grid grid-cols-3 gap-3">
                {categories.map(({ title, data }) => {
                    const rating = getRating(data.score)
                    return (
                        <div key={title} className="rounded-xl bg-bg/60 p-3 text-center">
                            <p className="text-sm text-muted">{title}</p>
                            <p className="font-bold text-fg">+{data.reward} SP</p>
                            <p className={`text-xs font-bold uppercase tracking-wider ${rating.colour}`}>{rating.label}</p>
                        </div>
                    )
                })}
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-bg/60 p-3 text-center">
                    <p className="text-sm text-muted">Consistency</p>
                    <p className="font-bold text-fg">×{points.consistencyMultiplier}</p>
                </div>
                <div className="rounded-xl bg-bg/60 p-3 text-center">
                    <p className="text-sm text-muted">Momentum</p>
                    <p className="font-bold text-fg">×{points.momentumMultiplier}</p>
                </div>
            </div>

            {points.bonus > 0 && (
                <p className="border-t border-line pt-3 text-center">
                    <span className="font-semibold text-fg">Weekly target hit!</span>{' '}
                    <span className="font-bold text-accent-fg">+{points.bonus} SP</span>
                </p>
            )}
        </Card>
    )
}

export default StrivePointsEarned
