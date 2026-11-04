// StreakCard.jsx

import { Link } from 'react-router-dom'
import { FaFire, FaShieldAlt } from 'react-icons/fa'
import Card, { CardTitle } from '../ui/Card.jsx'

const StreakCard = ({ user }) => (
    <Card as="section" aria-labelledby="streak-title" className="space-y-3">
        <CardTitle id="streak-title">Weekly streak</CardTitle>

        <p className="flex items-center gap-3 font-display text-5xl font-extrabold">
            {user.streak.current}
            <FaFire aria-hidden="true" className="text-3xl text-accent-fg" />
            <span className="font-sans text-base font-normal text-muted">{user.streak.current === 1 ? 'week' : 'weeks'}</span>
        </p>

        <p className="flex items-center gap-2 text-sm text-muted">
            <FaShieldAlt aria-hidden="true" className={user.streak.shield ? 'text-success' : 'text-muted'} />
            {user.streak.shield
                ? 'Shield ready: it will save your streak if you miss a week.'
                : 'No shield yet. You earn one every 4 weeks of streak.'}
        </p>

        <p className="text-sm text-muted">
            Best streak: <span className="font-semibold text-fg">{user.streak.best}</span>{' · '}
            <Link to="/how-it-works#streaks" className="text-accent-fg hover:underline">How streaks work</Link>
        </p>
    </Card>
)

export default StreakCard
