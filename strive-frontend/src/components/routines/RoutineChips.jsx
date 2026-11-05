// RoutineChips.jsx
// Routines as compact buttons inside the "Ready to train?" card: one tap starts a routine

import { Link } from 'react-router-dom'

const MAX_SHOWN = 6

const RoutineChips = ({ routines, isOffline, onStart }) => {
    const shown = routines.slice(0, MAX_SHOWN)
    const hidden = routines.length - shown.length

    if (routines.length === 0) {
        return (
            <p className="border-t border-line pt-3 text-sm text-muted">
                Save the exercises you do regularly as a routine and start them in one tap.{' '}
                <Link to="/routines" className="font-semibold text-accent-fg underline">Create a routine</Link>
            </p>
        )
    }

    return (
        <div className="space-y-2 border-t border-line pt-3">
            <div className="flex items-baseline justify-between gap-3">
                <h3 id="routine-chips-heading" className="font-sans text-sm font-semibold tracking-normal text-muted">Or start a routine</h3>
                <Link to="/routines" className="text-sm font-semibold text-accent-fg hover:underline">
                    {hidden > 0 ? `See all ${routines.length}` : 'Manage'}
                </Link>
            </div>

            <ul aria-labelledby="routine-chips-heading" className="flex flex-wrap justify-center gap-2">
                {shown.map(routine => (
                    <li key={routine._id}>
                        <button
                            type="button"
                            onClick={() => onStart(routine)}
                            className="max-w-[16rem] truncate rounded-full border border-line bg-bg px-4 py-2 text-sm font-semibold text-fg transition-colors hover:border-accent-fg hover:text-accent-fg"
                        >
                            {/* The list is labelled "Or start a routine", so the visible text is the whole accessible name */}
                            {routine.name}
                            <span className="ml-1.5 font-normal text-muted">· {routine.exercises.length}</span>
                        </button>
                    </li>
                ))}
            </ul>

            {isOffline && <p className="text-xs text-muted">Showing the routines saved on this device.</p>}
        </div>
    )
}

export default RoutineChips
