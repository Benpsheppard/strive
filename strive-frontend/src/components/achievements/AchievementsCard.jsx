// AchievementsCard.jsx
// A link into the achievements page, shown on Games and Profile

import { Link } from 'react-router-dom'
import { FaAward, FaChevronRight } from 'react-icons/fa'
import Card from '../ui/Card.jsx'

const AchievementsCard = ({ user }) => {
    const count = user?.achievementCount || 0

    return (
        <Card as="section" aria-label="Achievements" padding="none">
            <Link to="/achievements" className="flex items-center gap-3 rounded-2xl p-4 hover:bg-surface-2 sm:p-5">
                <FaAward aria-hidden="true" size={28} className="shrink-0 text-warning" />
                <div className="min-w-0 flex-1">
                    <p className="font-display text-2xl font-bold text-fg">Achievements</p>
                    <p className="text-sm text-muted">
                        {count === 0 ? 'No badges yet. Go and earn one!' : `${count} unlocked`}
                    </p>
                </div>
                <FaChevronRight aria-hidden="true" className="text-muted" />
            </Link>
        </Card>
    )
}

export default AchievementsCard
