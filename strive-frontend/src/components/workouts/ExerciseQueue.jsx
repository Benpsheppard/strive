// ExerciseQueue.jsx
// "Up next": the exercises still to do in a workout started from a routine. The first one has a
// Start button; every one can be moved or skipped. Only exercises are queued, never sets.

import { FaArrowUp, FaArrowDown, FaTimes } from 'react-icons/fa'
import Card, { CardTitle } from '../ui/Card.jsx'
import Button from '../ui/Button.jsx'

const IconButton = ({ label, onClick, disabled, children }) => (
    <button
        type="button"
        aria-label={label}
        onClick={onClick}
        disabled={disabled}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-line/60 hover:text-fg disabled:opacity-30 disabled:hover:bg-transparent"
    >
        {children}
    </button>
)

const ExerciseQueue = ({ items, canStart, onStart, onSkip, onMove }) => {
    if (items.length === 0) return null

    return (
        <Card as="section" aria-labelledby="queue-title" className="space-y-3">
            <div className="flex items-baseline justify-between gap-3">
                <CardTitle id="queue-title" accent="next">Up</CardTitle>
                <p className="text-sm text-muted">{items.length} to go</p>
            </div>

            <ol className="space-y-2" aria-label="Exercises still to do">
                {items.map((item, index) => {
                    const { exercise, selectedEquipment } = item
                    const detail = [exercise.muscleGroup, selectedEquipment].filter(Boolean).join(' · ')

                    return (
                        <li
                            key={exercise._id}
                            className={`flex items-center gap-2 rounded-xl p-2 pl-3 ${index === 0 ? 'bg-bg ring-1 ring-line' : 'bg-bg/60'}`}
                        >
                            <div className="min-w-0 flex-1">
                                <p className="truncate font-semibold text-fg">{exercise.name}</p>
                                {detail && <p className="truncate text-sm text-muted">{detail}</p>}
                            </div>

                            {index === 0 && (
                                <Button size="sm" disabled={!canStart} onClick={() => onStart(item)} aria-label={`Start ${exercise.name}`}>
                                    Start
                                </Button>
                            )}

                            <div className="flex shrink-0">
                                <IconButton label={`Move ${exercise.name} up`} disabled={index === 0} onClick={() => onMove(index, -1)}>
                                    <FaArrowUp aria-hidden="true" />
                                </IconButton>
                                <IconButton label={`Move ${exercise.name} down`} disabled={index === items.length - 1} onClick={() => onMove(index, 1)}>
                                    <FaArrowDown aria-hidden="true" />
                                </IconButton>
                                <IconButton label={`Skip ${exercise.name}`} onClick={() => onSkip(index)}>
                                    <FaTimes aria-hidden="true" />
                                </IconButton>
                            </div>
                        </li>
                    )
                })}
            </ol>

            {!canStart && (
                <p className="text-sm text-muted">Finish the exercise you are logging, then start the next one.</p>
            )}
        </Card>
    )
}

export default ExerciseQueue
