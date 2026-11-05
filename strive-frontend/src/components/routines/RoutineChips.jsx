// RoutineChips.jsx
// Routines inside the "Ready to train?" card. Each one is a button that starts it, showing its
// name, how many exercises it has, which exercises and which muscle groups. The first few are
// shown; the rest open with an expand button.

import { useId, useState } from 'react'
import { Link } from 'react-router-dom'
import { FaChevronDown } from 'react-icons/fa'
import { cx } from '../../utils/cx.js'

const INITIAL_SHOWN = 3

// Each muscle group once, in the order the exercises come
const muscleGroupsOf = (routine) => [...new Set(routine.exercises.map(item => item.exercise?.muscleGroup).filter(Boolean))]

const RoutineButton = ({ routine, onStart }) => {
    const names = routine.exercises.map(item => item.exercise?.name).filter(Boolean)
    const groups = muscleGroupsOf(routine)
    const count = routine.exercises.length

    return (
        <button
            type="button"
            onClick={() => onStart(routine)}
            className="flex w-full flex-col gap-1 rounded-xl border border-line bg-bg p-3 text-left transition-colors hover:border-accent-fg"
        >
            <span className="flex items-baseline justify-between gap-3">
                <span className="truncate font-display text-xl font-bold text-fg">{routine.name}</span>
                <span className="shrink-0 text-sm text-muted">{count} {count === 1 ? 'exercise' : 'exercises'}</span>
            </span>
            {names.length > 0 && <span className="line-clamp-2 text-sm text-fg">{names.join(' · ')}</span>}
            {groups.length > 0 && <span className="truncate text-xs text-muted">{groups.join(' · ')}</span>}
        </button>
    )
}

const RoutineChips = ({ routines, isOffline, onStart }) => {
    const [expanded, setExpanded] = useState(false)
    const listId = useId()

    if (routines.length === 0) {
        return (
            <p className="border-t border-line pt-3 text-sm text-muted">
                Save the exercises you do regularly as a routine and start them in one tap.{' '}
                <Link to="/routines" className="font-semibold text-accent-fg underline">Create a routine</Link>
            </p>
        )
    }

    const hidden = Math.max(0, routines.length - INITIAL_SHOWN)
    const shown = expanded ? routines : routines.slice(0, INITIAL_SHOWN)

    return (
        <div className="space-y-2 border-t border-line pt-3 text-left">
            <div className="flex items-baseline justify-between gap-3">
                <h3 id="routine-chips-heading" className="font-sans text-sm font-semibold tracking-normal text-muted">Or start a routine</h3>
                <Link to="/routines" className="text-sm font-semibold text-accent-fg hover:underline">Manage</Link>
            </div>

            {/* One on top of the other on a phone; side by side when there is room */}
            <ul id={listId} aria-labelledby="routine-chips-heading" className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {shown.map(routine => (
                    <li key={routine._id}>
                        <RoutineButton routine={routine} onStart={onStart} />
                    </li>
                ))}
            </ul>

            {hidden > 0 && (
                <button
                    type="button"
                    aria-expanded={expanded}
                    aria-controls={listId}
                    onClick={() => setExpanded(open => !open)}
                    className="mx-auto flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-accent-fg hover:bg-surface-2"
                >
                    {expanded ? 'Show fewer' : `Show ${hidden} more`}
                    <FaChevronDown aria-hidden="true" className={cx('transition-transform duration-200', expanded && 'rotate-180')} />
                </button>
            )}

            {isOffline && <p className="text-xs text-muted">Showing the routines saved on this device.</p>}
        </div>
    )
}

export default RoutineChips
