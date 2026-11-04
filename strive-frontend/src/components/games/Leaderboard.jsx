// Leaderboard.jsx
// This week's top members, switchable between total and per-category SP

import { useDispatch, useSelector } from 'react-redux'
import { useState, useEffect } from 'react'
import Card, { CardTitle } from '../ui/Card.jsx'
import { getLeaderboard } from '../../features/leaderboard/leaderboardSlice'
import { formatNumber } from '../../utils/formatValues.js'
import { cx } from '../../utils/cx.js'

const METRICS = [
    { key: 'totalSP', label: 'Total' },
    { key: 'totalVolumeSP', label: 'Volume' },
    { key: 'totalStrengthSP', label: 'Strength' },
    { key: 'totalProgressionSP', label: 'Progression' }
]

const Leaderboard = () => {
    const dispatch = useDispatch()
    const { leaderboard, isLoading, isError } = useSelector((state) => state.leaderboard)
    const { user } = useSelector((state) => state.auth)
    const [metric, setMetric] = useState(METRICS[0])

    useEffect(() => {
        dispatch(getLeaderboard(metric.key))
    }, [dispatch, metric])

    return (
        <Card as="section" aria-labelledby="leaderboard-title" className="space-y-4">
            <CardTitle id="leaderboard-title" accent="leaderboard">Weekly</CardTitle>

            <div className="flex flex-wrap gap-2" role="group" aria-label="Rank by">
                {METRICS.map(option => (
                    <button
                        key={option.key}
                        type="button"
                        aria-pressed={metric.key === option.key}
                        onClick={() => setMetric(option)}
                        className={cx(
                            'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
                            metric.key === option.key ? 'border-accent bg-accent text-white' : 'border-line bg-bg text-muted hover:text-fg'
                        )}
                    >
                        {option.label} SP
                    </button>
                ))}
            </div>

            {isError ? (
                <p className="text-muted">The leaderboard could not be loaded. Try again in a moment.</p>
            ) : leaderboard.length === 0 && !isLoading ? (
                <p className="text-muted">No one has earned points this week yet. Be the first!</p>
            ) : (
                <ol className="space-y-2" aria-busy={isLoading}>
                    {leaderboard.map((entry, index) => {
                        const isYou = entry.user?._id === user?._id
                        return (
                            <li key={entry._id} className={cx('flex items-center justify-between rounded-xl px-4 py-2.5', isYou ? 'bg-accent/25 ring-1 ring-accent-fg' : 'bg-bg/60')}>
                                <span className="flex items-center gap-3">
                                    <span className="w-6 text-right font-bold text-muted">{index + 1}</span>
                                    <span className="font-semibold text-fg">{entry.user?.username || 'Unknown'}{isYou && ' (you)'}</span>
                                </span>
                                <span className="font-bold text-fg">{formatNumber(entry[metric.key] || 0)} SP</span>
                            </li>
                        )
                    })}
                </ol>
            )}
        </Card>
    )
}

export default Leaderboard
