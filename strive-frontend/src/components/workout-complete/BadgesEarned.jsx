// BadgesEarned.jsx
// Achievements unlocked by this workout. Renders nothing when there are none.

import { Link } from 'react-router-dom'
import { FaAward } from 'react-icons/fa'
import Card, { CardTitle } from '../ui/Card.jsx'
import BadgeIcon from '../achievements/BadgeIcon.jsx'

const BadgesEarned = ({ badges }) => {
    if (!badges || badges.length === 0) return null

    return (
        <Card as="section" aria-labelledby="badges-title" className="space-y-3">
            <CardTitle id="badges-title" className="flex items-center gap-2">
                <FaAward aria-hidden="true" className="text-accent-fg" /> {badges.length === 1 ? 'Achievement unlocked' : 'Achievements unlocked'}
            </CardTitle>

            <ul className="space-y-2">
                {badges.map(badge => (
                    <li key={badge.id} className="flex items-center gap-3 rounded-xl bg-bg/60 px-4 py-3">
                        <BadgeIcon icon={badge.icon} tier={badge.tier} />
                        <div className="min-w-0">
                            <p className="font-semibold text-fg">{badge.name}</p>
                            <p className="text-sm text-muted">{badge.description}</p>
                        </div>
                    </li>
                ))}
            </ul>

            <Link to="/achievements" className="inline-block text-sm font-semibold text-accent-fg hover:underline">
                See all achievements
            </Link>
        </Card>
    )
}

export default BadgesEarned
