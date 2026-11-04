// ExerciseForm.jsx
// Log one exercise at a time: pick it, choose equipment, then add sets. Shows what you did
// last time and your personal best, prefills the next set, and lets you fix any set.

import { useState, useMemo, useRef } from 'react'
import Button from '../ui/Button.jsx'
import Select from '../ui/Select.jsx'
import SetForm from './SetForm.jsx'
import SetRow from './SetRow.jsx'
import ExerciseSearch from './ExerciseSearch.jsx'
import CreateExerciseDialog from './CreateExerciseDialog.jsx'
import { useAlerts } from '../../hooks/useAlerts.js'
import { calculateAllPersonalBests, getLastSession, getLastEquipment, buildPBKey } from '../../utils/pbDetection.js'
import {
    isSupportedMode, getEmptySet, validateSet, buildSet, setToRaw, formatSet, measurePB, formatPBValue, beatsPB
} from '../../utils/trackingModes.js'
import { EMPTY_EXERCISE } from '../../utils/constants.js'

const MAX_LAST_SETS_SHOWN = 4

const formatShortDate = (date) =>
    new Date(date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })

const ExerciseForm = ({
    workouts, allExercises, useImperial,
    currentExercise, setCurrentExercise, currentSet, setCurrentSet,
    setExercises, restTimerDuration, startRestTimer
}) => {
    const alerts = useAlerts()
    const firstFieldRef = useRef(null)

    const [errors, setErrors] = useState({})
    const [formError, setFormError] = useState('')
    const [editingIndex, setEditingIndex] = useState(null)
    const [creating, setCreating] = useState(null) // null = closed, string = suggested name

    const { exerciseId, trackingMode: mode, selectedEquipment, sets } = currentExercise
    const hasExercise = Boolean(exerciseId)
    const supported = isSupportedMode(mode)

    const personalBests = useMemo(() => calculateAllPersonalBests(workouts), [workouts])
    const lastSession = useMemo(
        () => (hasExercise && selectedEquipment ? getLastSession(workouts, exerciseId, selectedEquipment) : null),
        [workouts, hasExercise, exerciseId, selectedEquipment]
    )
    const personalBest = hasExercise && selectedEquipment
        ? personalBests[buildPBKey(currentExercise.exerciseName, selectedEquipment)]
        : null

    // The set to prefill: repeat the previous set, or mirror last session's matching set
    const suggestSet = (exerciseMode, equipment, loggedSets, session) => {
        if (loggedSets.length > 0) return setToRaw(exerciseMode, loggedSets[loggedSets.length - 1], useImperial)
        if (session?.sets?.length) {
            const index = Math.min(loggedSets.length, session.sets.length - 1)
            return setToRaw(exerciseMode, session.sets[index], useImperial)
        }
        return getEmptySet(exerciseMode)
    }

    const focusFirstField = () => setTimeout(() => firstFieldRef.current?.focus(), 0)

    const resetMessages = () => { setErrors({}); setFormError('') }

    const selectExercise = (exercise) => {
        resetMessages()
        setEditingIndex(null)

        // One equipment option is picked for you; otherwise reuse what you used last time
        const lastEquipment = getLastEquipment(workouts, exercise._id)
        const equipment = exercise.equipment?.length === 1
            ? exercise.equipment[0]
            : exercise.equipment?.find(item => item.toLowerCase() === (lastEquipment || '').toLowerCase()) || ''

        setCurrentExercise({
            exerciseId: exercise._id,
            exerciseName: exercise.name,
            muscleGroup: exercise.muscleGroup,
            trackingMode: exercise.trackingMode,
            equipment: exercise.equipment,
            selectedEquipment: equipment,
            sets: []
        })

        const session = equipment ? getLastSession(workouts, exercise._id, equipment) : null
        setCurrentSet(suggestSet(exercise.trackingMode, equipment, [], session))
    }

    const changeEquipment = (equipment) => {
        resetMessages()
        setCurrentExercise(prev => ({ ...prev, selectedEquipment: equipment }))
        const session = equipment ? getLastSession(workouts, exerciseId, equipment) : null
        if (editingIndex === null) setCurrentSet(suggestSet(mode, equipment, sets, session))
    }

    const changeExercise = async () => {
        if (sets.length > 0 && !(await alerts.changeExercise(sets.length))) return
        resetMessages()
        setEditingIndex(null)
        setCurrentExercise(EMPTY_EXERCISE)
        setCurrentSet({})
    }

    const onFieldChange = (name, value) => {
        setCurrentSet(prev => ({ ...prev, [name]: value }))
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }))
    }

    const submitSet = () => {
        setFormError('')

        if (!selectedEquipment) {
            setFormError('Choose the equipment you used first.')
            return
        }

        const { valid, errors: fieldErrors } = validateSet(mode, currentSet, useImperial)
        if (!valid) {
            setErrors(fieldErrors)
            return
        }

        const newSet = buildSet(mode, currentSet, useImperial)
        const updatedSets = editingIndex !== null
            ? sets.map((set, i) => (i === editingIndex ? newSet : set))
            : [...sets, newSet]

        setCurrentExercise(prev => ({ ...prev, sets: updatedSets }))
        setCurrentSet(suggestSet(mode, selectedEquipment, updatedSets, lastSession))
        setErrors({})

        if (editingIndex !== null) {
            setEditingIndex(null)
        } else if (restTimerDuration > 0) {
            startRestTimer()
        }

        focusFirstField()
    }

    const editSet = (index) => {
        resetMessages()
        setEditingIndex(index)
        setCurrentSet(setToRaw(mode, sets[index], useImperial))
        focusFirstField()
    }

    const cancelEdit = () => {
        resetMessages()
        setEditingIndex(null)
        setCurrentSet(suggestSet(mode, selectedEquipment, sets, lastSession))
    }

    const deleteSet = (index) => {
        const remaining = sets.filter((_, i) => i !== index)
        setCurrentExercise(prev => ({ ...prev, sets: remaining }))
        if (editingIndex === index) setEditingIndex(null)
        else if (editingIndex !== null && editingIndex > index) setEditingIndex(editingIndex - 1)
        setCurrentSet(suggestSet(mode, selectedEquipment, remaining, lastSession))
    }

    const finishExercise = () => {
        if (!selectedEquipment) {
            setFormError('Choose the equipment you used first.')
            return
        }
        if (sets.length === 0) {
            setFormError('Add at least one set before finishing this exercise.')
            return
        }

        setExercises(prev => [...prev, {
            exercise: exerciseId,
            selectedEquipment,
            exerciseName: currentExercise.exerciseName,
            muscleGroup: currentExercise.muscleGroup,
            trackingMode: mode,
            sets
        }])
        resetMessages()
        setEditingIndex(null)
        setCurrentExercise(EMPTY_EXERCISE)
        setCurrentSet({})
    }

    // PB hint: what to beat, or a note that you already have
    const reading = personalBest && sets.length ? measurePB(mode, sets) : null
    const pbBeaten = reading && beatsPB(personalBest.metric, personalBest.value, reading.value)

    return (
        <div className="space-y-4">
            {!hasExercise ? (
                <ExerciseSearch
                    allExercises={allExercises}
                    workouts={workouts}
                    onSelect={selectExercise}
                    onCreate={(name) => setCreating(name)}
                />
            ) : (
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h3 className="font-display text-2xl font-bold text-fg">{currentExercise.exerciseName}</h3>
                        <p className="text-sm text-muted">{currentExercise.muscleGroup}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={changeExercise}>Change</Button>
                </div>
            )}

            {hasExercise && !supported && (
                <p role="alert" className="text-sm text-accent-fg">This exercise type cannot be logged yet.</p>
            )}

            {hasExercise && supported && (
                <>
                    {currentExercise.equipment?.length > 1 && (
                        <Select
                            label="Equipment"
                            value={selectedEquipment}
                            onChange={(event) => changeEquipment(event.target.value)}
                        >
                            <option value="">Choose equipment…</option>
                            {currentExercise.equipment.map(item => <option key={item} value={item}>{item}</option>)}
                        </Select>
                    )}

                    {(lastSession || personalBest) && (
                        <div className="space-y-1 rounded-xl bg-bg/60 p-3 text-sm">
                            {lastSession && (
                                <p className="text-muted">
                                    <span className="font-semibold text-fg">Last time ({formatShortDate(lastSession.date)}):</span>{' '}
                                    {lastSession.sets.slice(0, MAX_LAST_SETS_SHOWN).map(set => formatSet(mode, set, useImperial)).join(' · ')}
                                    {lastSession.sets.length > MAX_LAST_SETS_SHOWN && ` · +${lastSession.sets.length - MAX_LAST_SETS_SHOWN} more`}
                                </p>
                            )}
                            {personalBest && (
                                <p className="text-muted">
                                    <span className="font-semibold text-fg">Personal best:</span>{' '}
                                    {formatPBValue(personalBest.metric, personalBest.value, useImperial)}
                                    {pbBeaten && <span className="ml-2 font-semibold text-success">New PB on the way!</span>}
                                </p>
                            )}
                        </div>
                    )}

                    {sets.length > 0 && (
                        <ul className="space-y-2" aria-label="Sets logged for this exercise">
                            {sets.map((set, index) => (
                                <SetRow
                                    key={index}
                                    set={set}
                                    number={index + 1}
                                    trackingMode={mode}
                                    useImperial={useImperial}
                                    active={editingIndex === index}
                                    onEdit={() => editSet(index)}
                                    onDelete={() => deleteSet(index)}
                                />
                            ))}
                        </ul>
                    )}

                    <SetForm
                        ref={firstFieldRef}
                        trackingMode={mode}
                        values={currentSet}
                        errors={errors}
                        onChange={onFieldChange}
                        onSubmit={submitSet}
                        onCancel={cancelEdit}
                        editing={editingIndex !== null}
                        useImperial={useImperial}
                    />

                    {formError && <p role="alert" className="text-sm text-accent-fg">{formError}</p>}

                    {sets.length > 0 && editingIndex === null && (
                        <Button variant="outline" fullWidth onClick={finishExercise}>Finish exercise</Button>
                    )}
                </>
            )}

            <CreateExerciseDialog
                open={creating !== null}
                initialName={creating || ''}
                onClose={() => setCreating(null)}
                onCreated={(exercise) => { setCreating(null); selectExercise(exercise) }}
            />
        </div>
    )
}

export default ExerciseForm
