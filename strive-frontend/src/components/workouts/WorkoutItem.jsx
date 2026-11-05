// WorkoutItem.jsx
// One saved workout: a summary row that expands to show stats and every set

import { useState, useId } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { FaTrash, FaChevronDown } from 'react-icons/fa'

import { deleteWorkout } from '../../features/workouts/workoutsSlice.js'
import { useAlerts } from '../../hooks/useAlerts.js'

import Card from '../ui/Card.jsx'
import StatTile from '../ui/StatTile.jsx'
import SetRow from './SetRow.jsx'
import Button from '../ui/Button.jsx'
import SaveRoutineDialog from '../routines/SaveRoutineDialog.jsx'
import { queueFromWorkout, routineExercisesFromWorkout } from '../../utils/routineQueue.js'
import { formatDistance, formatDuration, formatNumber, formatSeconds, formatWeight, formatWorkoutStartTime } from '../../utils/formatValues.js'
import { cx } from '../../utils/cx.js'

const WorkoutItem = ({ workout }) => {
    const { user } = useSelector((state) => state.auth)
    const dispatch = useDispatch()
    const alerts = useAlerts()
    const navigate = useNavigate()
    const panelId = useId()

    const [expanded, setExpanded] = useState(false)
    const [openExercises, setOpenExercises] = useState({})
    const [savingRoutine, setSavingRoutine] = useState(false)

    // Older workouts may be missing parts of the summary
    const summary = { totalWeight: 0, totalReps: 0, totalSets: 0, totalDistance: 0, totalDuration: 0, ...workout.summary }
    const exercises = workout.exercises || []
    const sp = summary.totalStrivePoints?.total
    const repeatQueue = queueFromWorkout(workout)
    const routineExercises = routineExercisesFromWorkout(workout)

    const onDelete = async () => {
        if (await alerts.deleteWorkout()) {
            dispatch(deleteWorkout(workout._id))
        }
    }

    // Only show the stats that mean something for this workout
    const tiles = [
        { label: 'Sets', value: formatNumber(summary.totalSets) },
        { label: 'Reps', value: formatNumber(summary.totalReps), show: summary.totalReps > 0 },
        { label: 'Volume', value: formatWeight(summary.totalWeight, user.useImperial), show: summary.totalWeight > 0 },
        { label: 'Distance', value: formatDistance(summary.totalDistance, user.useImperial), show: summary.totalDistance > 0 },
        { label: 'Timed', value: formatSeconds(Math.round(summary.totalDuration)), show: summary.totalDuration > 0 },
        { label: 'Duration', value: formatDuration(workout.duration) },
        { label: 'SP earned', value: formatNumber(sp ?? 0) },
        { label: 'PBs', value: formatNumber(summary.personalBests?.length || 0) },
        { label: 'Quests', value: formatNumber(summary.questsCompleted?.length || 0) }
    ].filter(tile => tile.show !== false)

    return (
        <Card padding="none" as="article">
            <div className="flex items-center">
                <button
                    type="button"
                    aria-expanded={expanded}
                    aria-controls={panelId}
                    onClick={() => setExpanded(prev => !prev)}
                    className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl p-4 text-left"
                >
                    <FaChevronDown aria-hidden="true" className={cx('shrink-0 text-muted transition-transform duration-200', expanded && 'rotate-180')} />
                    <span className="min-w-0 flex-1">
                        <span className="block truncate font-display text-xl font-bold text-fg">{workout.title}</span>
                        <span className="block text-sm text-muted">
                            {formatWorkoutStartTime(workout.createdAt, workout.duration)}
                            {' · '}{exercises.length} {exercises.length === 1 ? 'exercise' : 'exercises'}
                            {sp > 0 && <span className="text-accent-fg"> · +{formatNumber(sp)} SP</span>}
                        </span>
                    </span>
                </button>

                <button
                    type="button"
                    aria-label={`Delete workout ${workout.title}`}
                    onClick={onDelete}
                    className="mr-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-accent-fg"
                >
                    <FaTrash aria-hidden="true" />
                </button>
            </div>

            {expanded && (
                <div id={panelId} className="space-y-4 px-4 pb-4">
                    <div className="grid grid-cols-3 gap-2">
                        {tiles.map(tile => <StatTile key={tile.label} value={tile.value} label={tile.label} />)}
                    </div>

                    {workout.summary?.noSPReason && (
                        <p className="rounded-lg bg-bg/60 p-3 text-sm text-muted">{workout.summary.noSPReason}</p>
                    )}

                    {exercises.length > 0 && (
                        <ul className="space-y-2" aria-label="Exercises">
                            {exercises.map((ex, index) => {
                                const open = Boolean(openExercises[index])
                                const sets = ex.sets || []
                                return (
                                    <li key={index} className="rounded-xl bg-bg/60">
                                        <button
                                            type="button"
                                            aria-expanded={open}
                                            disabled={sets.length === 0}
                                            onClick={() => setOpenExercises(prev => ({ ...prev, [index]: !prev[index] }))}
                                            className="flex w-full items-center justify-between gap-3 rounded-xl p-3 text-left"
                                        >
                                            <span>
                                                <span className="block font-semibold text-fg">{ex.exercise?.name || 'Removed exercise'}</span>
                                                <span className="block text-sm text-muted">
                                                    {[ex.exercise?.muscleGroup, ex.selectedEquipment].filter(Boolean).join(' · ')}
                                                </span>
                                            </span>
                                            <span className="shrink-0 text-sm text-muted">
                                                {sets.length} {sets.length === 1 ? 'set' : 'sets'}
                                            </span>
                                        </button>

                                        {open && (
                                            <ul className="space-y-2 px-3 pb-3">
                                                {sets.map((set, i) => (
                                                    <SetRow key={i} set={set} number={i + 1} trackingMode={ex.exercise?.trackingMode} useImperial={user.useImperial} />
                                                ))}
                                            </ul>
                                        )}
                                    </li>
                                )
                            })}
                        </ul>
                    )}

                    {repeatQueue.length > 0 && (
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <Button
                                variant="secondary"
                                fullWidth
                                onClick={() => navigate('/', { state: { queue: repeatQueue, title: workout.title } })}
                            >
                                Repeat this workout
                            </Button>
                            <Button variant="secondary" fullWidth onClick={() => setSavingRoutine(true)}>Save as routine</Button>
                        </div>
                    )}
                </div>
            )}

            <SaveRoutineDialog
                open={savingRoutine}
                initialName={workout.title}
                exercises={routineExercises}
                onClose={() => setSavingRoutine(false)}
            />
        </Card>
    )
}

export default WorkoutItem
