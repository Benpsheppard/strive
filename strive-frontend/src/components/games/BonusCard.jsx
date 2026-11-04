// BonusCard.jsx
// Progress towards the weekly target, which pays a bonus when reached

import { getStartOfWeek, getEndOfWeek } from '../../utils/dateFormat'
import Card, { CardTitle } from '../ui/Card.jsx'
import ProgressBar from './ProgressBar.jsx'

const BonusCard = ({ user, workouts }) => {
    const now = new Date()
    const startOfWeek = getStartOfWeek(now)
    const endOfWeek = getEndOfWeek(now)

    const workoutsThisWeek = workouts.filter((workout) => {
        const date = new Date(workout.createdAt)
        return date >= startOfWeek && date <= endOfWeek
    }).length

    const bonusHit = workoutsThisWeek >= user.target

    return (
        <Card as="section" aria-labelledby="bonus-title" className="space-y-3">
            <CardTitle id="bonus-title">Weekly target</CardTitle>
            <p className="text-sm text-muted">
                {bonusHit
                    ? 'Target hit! Your bonus SP was added to the workout that reached it.'
                    : `Complete ${user.target} workouts this week to earn a bonus.`}
            </p>
            <ProgressBar numerator={Math.min(workoutsThisWeek, user.target)} denominator={user.target} label="Workouts this week" />
        </Card>
    )
}

export default BonusCard
