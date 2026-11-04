// GuestCard.jsx
// Shown to guests: how many free workouts are left and what signing up keeps

import { Link } from 'react-router-dom'
import Card from '../ui/Card.jsx'
import Button from '../ui/Button.jsx'

const GUEST_LIMIT = 5

const GuestCard = ({ workouts, showAction = true }) => {
    const used = Math.min(workouts.length, GUEST_LIMIT)
    const remaining = GUEST_LIMIT - used

    return (
        <Card raised as="section" aria-label="Guest account" className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <p className="font-semibold text-fg">
                    Guest account: {used} of {GUEST_LIMIT} free workouts used
                </p>
                <p className="text-sm text-muted">
                    {remaining > 0
                        ? 'Create a free account to keep your workouts, points and streak, with no limit.'
                        : 'You have used all your guest workouts. Create a free account to keep going. Everything you have logged comes with you.'}
                </p>
            </div>
            {showAction && <Button as={Link} to="/migrate" className="shrink-0">Create free account</Button>}
        </Card>
    )
}

export default GuestCard
