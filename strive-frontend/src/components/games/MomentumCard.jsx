// MomentumCard.jsx

import { Link } from 'react-router-dom'
import Card, { CardTitle } from '../ui/Card.jsx'
import ProgressBar from './ProgressBar.jsx'

// Matches the backend multipliers (utils/workoutSummary.js getMomentumMultiplier)
const MOMENTUM_TIERS = [
    { threshold: 20, label: 'Warming up', multiplier: 1 },
    { threshold: 40, label: 'Building', multiplier: 1.2 },
    { threshold: 60, label: 'Consistent', multiplier: 1.4 },
    { threshold: 80, label: 'Locked in', multiplier: 1.6 },
    { threshold: 99, label: 'Unstoppable', multiplier: 1.8 },
    { threshold: 100, label: 'Peak', multiplier: 2 }
]

const MomentumCard = ({ user }) => {
    const current = user.momentum.current
    const { label, multiplier } = MOMENTUM_TIERS.find(tier => current <= tier.threshold) ?? MOMENTUM_TIERS.at(-1)

    return (
        <Card as="section" aria-labelledby="momentum-title" className="space-y-3">
            <CardTitle id="momentum-title">Momentum</CardTitle>
            <p className="font-display text-3xl font-bold text-accent-fg">{label}</p>
            <p className="text-sm text-muted">
                Your Strive Points are multiplied by <span className="font-semibold text-fg">×{multiplier}</span>.{' '}
                <Link to="/how-it-works#momentum" className="text-accent-fg hover:underline">How momentum works</Link>
            </p>
            <ProgressBar numerator={current} denominator={100} label="Momentum" />
        </Card>
    )
}

export default MomentumCard
