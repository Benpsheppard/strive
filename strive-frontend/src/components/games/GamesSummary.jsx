// GamesSummary.jsx
// Level and Strive Points with progress to the next level

import { formatNumber } from '../../utils/formatValues'
import Card from '../ui/Card.jsx'
import ProgressBar from './ProgressBar'

const GamesSummary = ({ user }) => {
    const currentLevel = user.level

    // Level n starts at 100 x (n - 1)^2 SP
    const currentLevelMinSP = 100 * Math.pow(currentLevel - 1, 2)
    const nextLevelMinSP = 100 * Math.pow(currentLevel, 2)

    const progressWithinLevel = user.strivepoints - currentLevelMinSP
    const totalSPForLevel = nextLevelMinSP - currentLevelMinSP
    const spToNextLevel = nextLevelMinSP - user.strivepoints

    return (
        <Card as="section" aria-label="Level and Strive Points" className="space-y-4">
            <div className="flex items-end justify-between gap-4">
                <div>
                    <p className="text-sm text-muted">Level</p>
                    <p className="font-display text-5xl font-extrabold leading-none text-accent-fg">{user.level}</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-muted">Strive Points</p>
                    <p className="font-display text-3xl font-bold leading-none">{formatNumber(user.strivepoints, 0)} SP</p>
                </div>
            </div>

            <div>
                <ProgressBar numerator={progressWithinLevel} denominator={totalSPForLevel} unit="SP" label={`Progress to level ${currentLevel + 1}`} />
                <p className="mt-2 text-sm text-muted">{spToNextLevel} SP until level {currentLevel + 1}</p>
            </div>
        </Card>
    )
}

export default GamesSummary
