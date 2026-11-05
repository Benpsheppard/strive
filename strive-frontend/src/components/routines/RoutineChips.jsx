// RoutineChips.jsx
// Routines inside the "Ready to train?" card. Each one is a button that starts it, showing its
// name, how many exercises it has and which muscle groups it covers. They are shown as a stack:
// the newest in full with the next ones peeking out underneath, and a click opens them all.

import { useId, useState } from 'react'
import { Link } from 'react-router-dom'
import { FaChevronDown } from 'react-icons/fa'
import { cx } from '../../utils/cx.js'

// Each muscle group once, in the order the exercises come
const muscleGroupsOf = (routine) => [...new Set(routine.exercises.map(item => item.exercise?.muscleGroup).filter(Boolean))]

const RoutineButton = ({ routine, onStart }) => {
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
            {groups.length > 0 && <span className="truncate text-sm text-muted">{groups.join(' · ')}</span>}
        </button>
    )
}

// Cards peeking out from under the top one (the stack shows at most this many behind it)
const MAX_PEEKING = 2

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

    const [top, ...rest] = routines
    const peeking = Math.min(MAX_PEEKING, rest.length)

    return (
        <div className="space-y-2 border-t border-line pt-3 text-left">
            <div className="flex items-baseline justify-between gap-3">
                <h3 id="routine-chips-heading" className="font-sans text-sm font-semibold tracking-normal text-muted">Or start a routine</h3>
                <Link to="/routines" className="text-sm font-semibold text-accent-fg hover:underline">Manage</Link>
            </div>

            {expanded ? (
                // Everything, one after the other
                <>
                    <ul id={listId} aria-labelledby="routine-chips-heading" className="space-y-2">
                        {routines.map(routine => (
                            <li key={routine._id}>
                                <RoutineButton routine={routine} onStart={onStart} />
                            </li>
                        ))}
                    </ul>

                    <button
                        type="button"
                        aria-expanded="true"
                        aria-controls={listId}
                        onClick={() => setExpanded(false)}
                        className="mx-auto flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-accent-fg hover:bg-surface-2"
                    >
                        Show fewer <FaChevronDown aria-hidden="true" className="rotate-180" />
                    </button>
                </>
            ) : (
                // The newest routine in full, with the next ones peeking out from underneath
                <div>
                    <ul id={listId} aria-labelledby="routine-chips-heading">
                        <li className="relative z-30">
                            <RoutineButton routine={top} onStart={onStart} />
                        </li>
                    </ul>

                    {peeking > 0 && (
                        <button
                            type="button"
                            aria-expanded="false"
                            aria-controls={listId}
                            onClick={() => setExpanded(true)}
                            className="group relative block w-full cursor-pointer rounded-b-xl pb-1 text-center"
                        >
                            {/* Decorative edges of the cards underneath */}
                            {Array.from({ length: peeking }, (_, i) => (
                                <span
                                    key={i}
                                    aria-hidden="true"
                                    className={cx(
                                        'relative block h-3 rounded-b-xl bg-surface border border-t-0 border-line shadow-card transition-colors group-hover:border-accent-fg',
                                        i === 0 ? '-mt-1 mx-3' : '-mt-1.5 mx-6',
                                    )}
                                    style={{ zIndex: 20 - i * 10 }}
                                />
                            ))}
                            <span className="mt-2 block text-xs font-semibold text-muted group-hover:text-fg">
                                {routines.length - 1} more {routines.length - 1 === 1 ? 'routine' : 'routines'} · tap to see all
                            </span>
                        </button>
                    )}
                </div>
            )}

            {isOffline && <p className="text-xs text-muted">Showing the routines saved on this device.</p>}
        </div>
    )
}

export default RoutineChips
