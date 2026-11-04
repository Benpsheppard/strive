// WorkoutDashboard.jsx
// Home screen between workouts: start training, see your level, this week and recent history

import { Link } from 'react-router-dom'
import Card from '../ui/Card.jsx'
import Button from '../ui/Button.jsx'
import PageTitle from '../ui/PageTitle.jsx'
import GuestCard from '../guest/GuestCard.jsx'
import GamesSummary from '../games/GamesSummary.jsx'
import Calendar from '../progress/Calendar.jsx'
import MuscleGroupHeatmap from '../progress/MuscleGroupHeatmap.jsx'
import WorkoutItem from './WorkoutItem.jsx'

const WorkoutDashBoard = ({ user, workouts, startWorkout }) => {
    const recent = [...workouts]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 4)

    const isFirstWorkout = workouts.length === 0

    return (
        <div className="space-y-4">
            <PageTitle accent={user.isGuest ? 'Guest' : user.username}>Welcome back,</PageTitle>

            {user.isGuest && <GuestCard workouts={workouts} />}

            <Card as="section" aria-label="Start a workout" className="space-y-3 text-center" raised>
                <h2 className="font-display text-3xl font-bold">
                    {isFirstWorkout ? 'Log your first ' : 'Ready to '}
                    <span className="text-accent-fg">{isFirstWorkout ? 'workout' : 'train?'}</span>
                </h2>
                {isFirstWorkout && (
                    <p className="text-muted">Pick an exercise, add your sets and finish to earn your first Strive Points.</p>
                )}
                <Button size="lg" fullWidth onClick={startWorkout}>Start workout</Button>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
                <GamesSummary user={user} />
                <Calendar workouts={workouts} target={user.target} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <section aria-labelledby="recent-heading" className="space-y-3">
                    <div className="flex items-baseline justify-between">
                        <h2 id="recent-heading" className="font-display text-2xl font-bold">
                            Recent <span className="text-accent-fg">workouts</span>
                        </h2>
                        {workouts.length > 0 && (
                            <Link to="/prev-workouts" className="text-sm font-semibold text-accent-fg hover:underline">See all</Link>
                        )}
                    </div>

                    {recent.length === 0 ? (
                        <Card className="text-center text-muted">Your workouts will show up here.</Card>
                    ) : (
                        recent.map(workout => <WorkoutItem key={workout._id} workout={workout} />)
                    )}
                </section>

                <MuscleGroupHeatmap workouts={workouts} />
            </div>
        </div>
    )
}

export default WorkoutDashBoard
