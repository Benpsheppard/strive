// ExerciseList.jsx
// Exercises already finished in the current workout, with edit and remove

import { FaPen, FaTrash } from 'react-icons/fa'
import Card from '../ui/Card.jsx'
import StatTile from '../ui/StatTile.jsx'
import SetRow from './SetRow.jsx'
import { formatWeight, formatNumber } from '../../utils/formatValues.js'
import { getSetVolume } from '../../utils/trackingModes.js'

const ExerciseList = ({ exercises, useImperial, onEdit, onRemove, canEdit }) => {
    if (!exercises || exercises.length === 0) return null

    return (
        <section aria-labelledby="completed-exercises" className="space-y-3">
            <h2 id="completed-exercises" className="font-display text-2xl font-bold text-fg">
                Completed <span className="text-accent-fg">exercises</span>
            </h2>

            {exercises.map((exercise, index) => {
                const sets = exercise.sets || []
                const reps = sets.reduce((total, set) => total + (Number(set.reps) || 0), 0)
                const volume = sets.reduce((total, set) => total + getSetVolume(set), 0)

                return (
                    <Card key={`${exercise.exercise}-${index}`} raised>
                        <div className="mb-3 flex items-start justify-between gap-2">
                            <div>
                                <h3 className="font-display text-xl font-bold text-fg">{exercise.exerciseName}</h3>
                                <p className="text-sm text-muted">
                                    {exercise.muscleGroup}{exercise.selectedEquipment && ` · ${exercise.selectedEquipment}`}
                                </p>
                            </div>

                            <div className="flex">
                                <button
                                    type="button"
                                    aria-label={`Edit ${exercise.exerciseName}`}
                                    title={canEdit ? 'Edit this exercise' : 'Finish the exercise you are logging first'}
                                    disabled={!canEdit}
                                    onClick={() => onEdit(index)}
                                    className="flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-line/60 hover:text-fg disabled:opacity-40"
                                >
                                    <FaPen aria-hidden="true" />
                                </button>
                                <button
                                    type="button"
                                    aria-label={`Remove ${exercise.exerciseName}`}
                                    onClick={() => onRemove(index)}
                                    className="flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-line/60 hover:text-accent-fg"
                                >
                                    <FaTrash aria-hidden="true" />
                                </button>
                            </div>
                        </div>

                        <ul className="space-y-2">
                            {sets.map((set, i) => (
                                <SetRow
                                    key={i}
                                    set={set}
                                    number={i + 1}
                                    trackingMode={exercise.trackingMode}
                                    useImperial={useImperial}
                                />
                            ))}
                        </ul>

                        <div className="mt-3 grid grid-cols-3 gap-2">
                            <StatTile value={sets.length} label="Sets" />
                            <StatTile value={formatNumber(reps)} label="Reps" />
                            <StatTile value={volume > 0 ? formatWeight(volume, useImperial) : '—'} label="Volume" />
                        </div>
                    </Card>
                )
            })}
        </section>
    )
}

export default ExerciseList
