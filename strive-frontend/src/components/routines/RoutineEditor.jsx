// RoutineEditor.jsx
// Create or change a routine: name, which exercises, in what order, and an equipment hint for each.
// Only exercises are stored, never sets or weights.

import { useState } from 'react'
import { useSelector } from 'react-redux'
import { FaArrowUp, FaArrowDown, FaTrash } from 'react-icons/fa'
import Card from '../ui/Card.jsx'
import Input from '../ui/Input.jsx'
import Button from '../ui/Button.jsx'
import ExerciseSearch from '../workouts/ExerciseSearch.jsx'
import { queueFromRoutine, moveItem, removeItem } from '../../utils/routineQueue.js'

const MAX_EXERCISES = 30

const RowButton = ({ label, onClick, disabled, children }) => (
    <button
        type="button"
        aria-label={label}
        onClick={onClick}
        disabled={disabled}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-line/60 hover:text-fg disabled:opacity-30 disabled:hover:bg-transparent"
    >
        {children}
    </button>
)

const RoutineEditor = ({ routine, onSave, onCancel }) => {
    const { exercises: allExercises } = useSelector((state) => state.exercise)
    const { workouts } = useSelector((state) => state.workout)

    const [name, setName] = useState(routine?.name || '')
    const [items, setItems] = useState(() => (routine ? queueFromRoutine(routine) : []))
    const [error, setError] = useState('')
    const [saving, setSaving] = useState(false)

    const addExercise = (exercise) => {
        setError('')
        setItems(current => {
            if (current.some(item => item.exercise._id === exercise._id)) return current
            return [...current, {
                exercise: {
                    _id: exercise._id, name: exercise.name, muscleGroup: exercise.muscleGroup,
                    subMuscleGroup: exercise.subMuscleGroup, trackingMode: exercise.trackingMode,
                    equipment: exercise.equipment || [], isCustom: Boolean(exercise.isCustom)
                },
                selectedEquipment: ''
            }]
        })
    }

    const setEquipment = (index, selectedEquipment) =>
        setItems(current => current.map((item, i) => (i === index ? { ...item, selectedEquipment } : item)))

    const submit = async (event) => {
        event.preventDefault()

        if (!name.trim()) return setError('Give the routine a name')
        if (items.length === 0) return setError('Add at least one exercise')

        setSaving(true)
        const problem = await onSave({
            name: name.trim(),
            exercises: items.map(item => ({
                exercise: item.exercise._id,
                ...(item.selectedEquipment ? { selectedEquipment: item.selectedEquipment } : {})
            }))
        })
        setSaving(false)

        if (problem) setError(problem)
    }

    return (
        <Card as="form" onSubmit={submit} noValidate aria-label={routine ? `Edit ${routine.name}` : 'New routine'} className="space-y-4">
            <Input label="Routine name" value={name} maxLength={60} placeholder="e.g. Push day" onChange={(event) => { setName(event.target.value); setError('') }} />

            <div className="space-y-2">
                <h3 className="font-display text-xl font-bold">Exercises <span className="text-base font-normal text-muted">({items.length}/{MAX_EXERCISES})</span></h3>

                {items.length === 0 ? (
                    <p className="text-sm text-muted">No exercises yet. Search below to add some.</p>
                ) : (
                    <ol className="space-y-2" aria-label="Exercises in this routine">
                        {items.map((item, index) => (
                            <li key={item.exercise._id} className="flex flex-wrap items-center gap-2 rounded-xl bg-bg/60 p-2 pl-3">
                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-semibold text-fg">{item.exercise.name}</p>
                                    <p className="text-sm text-muted">{item.exercise.muscleGroup}</p>
                                </div>

                                {item.exercise.equipment.length > 1 && (
                                    <>
                                        <label htmlFor={`equipment-${item.exercise._id}`} className="sr-only">Equipment for {item.exercise.name}</label>
                                        <select
                                            id={`equipment-${item.exercise._id}`}
                                            value={item.selectedEquipment}
                                            onChange={(event) => setEquipment(index, event.target.value)}
                                            className="rounded-lg border border-line bg-bg px-2 py-1.5 text-sm text-fg"
                                        >
                                            <option value="">Any equipment</option>
                                            {item.exercise.equipment.map(option => <option key={option} value={option}>{option}</option>)}
                                        </select>
                                    </>
                                )}

                                <div className="flex shrink-0">
                                    <RowButton label={`Move ${item.exercise.name} up`} disabled={index === 0} onClick={() => setItems(moveItem(items, index, -1))}><FaArrowUp aria-hidden="true" /></RowButton>
                                    <RowButton label={`Move ${item.exercise.name} down`} disabled={index === items.length - 1} onClick={() => setItems(moveItem(items, index, 1))}><FaArrowDown aria-hidden="true" /></RowButton>
                                    <RowButton label={`Remove ${item.exercise.name}`} onClick={() => setItems(removeItem(items, index))}><FaTrash aria-hidden="true" /></RowButton>
                                </div>
                            </li>
                        ))}
                    </ol>
                )}
            </div>

            {items.length < MAX_EXERCISES && (
                <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-fg">Add an exercise</h3>
                    <ExerciseSearch allExercises={allExercises} workouts={workouts} onSelect={addExercise} />
                </div>
            )}

            {error && <p role="alert" className="text-sm text-accent-fg">{error}</p>}

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button variant="secondary" onClick={onCancel}>Cancel</Button>
                <Button type="submit" loading={saving}>{routine ? 'Save changes' : 'Create routine'}</Button>
            </div>
        </Card>
    )
}

export default RoutineEditor
