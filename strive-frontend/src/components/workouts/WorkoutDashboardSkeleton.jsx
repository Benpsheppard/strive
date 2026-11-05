// WorkoutDashboardSkeleton.jsx
// Stand-in for WorkoutDashboard while the workout history loads. The title and start button are
// real, since they need no data; everything that depends on history is a placeholder.

import Card from '../ui/Card.jsx'
import Button from '../ui/Button.jsx'
import PageTitle from '../ui/PageTitle.jsx'
import Skeleton from '../ui/Skeleton.jsx'

const WorkoutDashboardSkeleton = ({ user, onStart, startDisabled = false }) => (
    <div className="space-y-4" role="status" aria-busy="true">
        <span className="sr-only">Loading your dashboard</span>

        <PageTitle accent={user?.isGuest ? 'Guest' : user?.username}>Welcome back,</PageTitle>

        <Card as="section" aria-label="Start a workout" className="space-y-3 text-center" raised>
            <h2 className="font-display text-3xl font-bold">
                Ready to <span className="text-accent-fg">train?</span>
            </h2>
            <Button size="lg" fullWidth onClick={onStart} disabled={startDisabled || !onStart}>Start workout</Button>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-48 rounded-2xl" />
            <Skeleton className="h-48 rounded-2xl" />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
            <section className="space-y-3">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-20 rounded-2xl" />
                <Skeleton className="h-20 rounded-2xl" />
                <Skeleton className="h-20 rounded-2xl" />
            </section>
            <Skeleton className="h-64 rounded-2xl" />
        </div>
    </div>
)

export default WorkoutDashboardSkeleton
