// RoutineList.jsx
// Routines on the dashboard: one card each with a Start button

import { Link } from 'react-router-dom'
import Card from '../ui/Card.jsx'
import Button from '../ui/Button.jsx'

const RoutineList = ({ routines, isOffline, onStart }) => (
    <section aria-labelledby="routines-heading" className="space-y-3">
        <div className="flex items-baseline justify-between gap-3">
            <h2 id="routines-heading" className="font-display text-2xl font-bold">
                Your <span className="text-accent-fg">routines</span>
            </h2>
            <Link to="/routines" className="text-sm font-semibold text-accent-fg hover:underline">
                {routines.length > 0 ? 'Manage' : 'Create one'}
            </Link>
        </div>

        {isOffline && <p className="text-sm text-muted">Showing the routines saved on this device.</p>}

        {routines.length === 0 ? (
            <Card className="text-muted">
                Save the exercises you do regularly as a routine and start them in one tap. Finish a workout and choose
                <span className="font-semibold text-fg"> Save as routine</span>, or <Link to="/routines" className="text-accent-fg underline">create one now</Link>.
            </Card>
        ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
                {routines.map(routine => (
                    <li key={routine._id}>
                        <Card className="flex h-full flex-col gap-3">
                            <div className="min-w-0 flex-1">
                                <h3 className="truncate font-display text-xl font-bold text-fg">{routine.name}</h3>
                                <p className="line-clamp-2 text-sm text-muted">
                                    {routine.exercises.map(item => item.exercise?.name).filter(Boolean).join(' · ')}
                                </p>
                            </div>
                            <Button variant="secondary" fullWidth onClick={() => onStart(routine)} aria-label={`Start ${routine.name}`}>
                                Start ({routine.exercises.length} {routine.exercises.length === 1 ? 'exercise' : 'exercises'})
                            </Button>
                        </Card>
                    </li>
                ))}
            </ul>
        )}
    </section>
)

export default RoutineList
