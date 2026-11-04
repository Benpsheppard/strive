// CreateExerciseDialog.jsx
// Lets users add an exercise that is not in the library. Validation is repeated on the server.

import { useState } from 'react'
import { useDispatch } from 'react-redux'
import Dialog from '../ui/Dialog.jsx'
import Input from '../ui/Input.jsx'
import Select from '../ui/Select.jsx'
import Button from '../ui/Button.jsx'
import { createExercise } from '../../features/exercises/exerciseSlice.js'
import { TRACKING_MODES } from '../../utils/trackingModes.js'

const MUSCLE_GROUPS = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Cardio', 'Full body', 'Other']
const EQUIPMENT = [
    'Barbell', 'Dumbbell', 'Machine', 'Smith Machine', 'Bodyweight', 'Kettlebell',
    'Cable', 'Bike', 'Treadmill', 'Stepper', 'Rowing machine', 'Other'
]

const MODE_HINTS = {
    weight_reps: 'e.g. bench press',
    bodyweight_reps: 'e.g. pull ups',
    assisted_reps: 'e.g. assisted dips',
    reps: 'reps only',
    duration: 'e.g. plank',
    distance: 'distance only',
    distance_duration: 'e.g. running'
}

const initialForm = (name = '') => ({ name, muscleGroup: 'Other', trackingMode: 'weight_reps', equipment: ['Other'] })

const CreateExerciseDialog = ({ open, initialName, onClose, onCreated }) => {
    const dispatch = useDispatch()
    const [form, setForm] = useState(initialForm(initialName))
    const [error, setError] = useState('')
    const [saving, setSaving] = useState(false)

    // Reset the form each time the dialog is opened
    const [wasOpen, setWasOpen] = useState(false)
    if (open && !wasOpen) {
        setWasOpen(true)
        setForm(initialForm(initialName))
        setError('')
    }
    if (!open && wasOpen) setWasOpen(false)

    const toggleEquipment = (item) => setForm(prev => ({
        ...prev,
        equipment: prev.equipment.includes(item)
            ? prev.equipment.filter(e => e !== item)
            : [...prev.equipment, item].slice(0, 5)
    }))

    const submit = async (event) => {
        event.preventDefault()
        setError('')

        if (form.equipment.length === 0) {
            setError('Choose at least one piece of equipment')
            return
        }

        setSaving(true)
        const result = await dispatch(createExercise({ ...form, name: form.name.trim() }))
        setSaving(false)

        if (createExercise.fulfilled.match(result)) {
            onCreated(result.payload)
        } else {
            setError(result.payload || 'Could not create the exercise')
        }
    }

    return (
        <Dialog open={open} onClose={onClose} title="Create custom exercise" description="Only you will see this exercise.">
            <form onSubmit={submit} className="space-y-4" noValidate>
                <Input
                    label="Name"
                    value={form.name}
                    maxLength={60}
                    autoFocus
                    onChange={(event) => setForm(prev => ({ ...prev, name: event.target.value }))}
                />

                <Select
                    label="Muscle group"
                    value={form.muscleGroup}
                    onChange={(event) => setForm(prev => ({ ...prev, muscleGroup: event.target.value }))}
                >
                    {MUSCLE_GROUPS.map(group => <option key={group} value={group}>{group}</option>)}
                </Select>

                <Select
                    label="How do you track it?"
                    value={form.trackingMode}
                    onChange={(event) => setForm(prev => ({ ...prev, trackingMode: event.target.value }))}
                >
                    {Object.entries(TRACKING_MODES).map(([mode, config]) => (
                        <option key={mode} value={mode}>{config.label} ({MODE_HINTS[mode]})</option>
                    ))}
                </Select>

                <fieldset>
                    <legend className="mb-1.5 text-sm font-medium text-fg">Equipment (up to 5)</legend>
                    <div className="flex flex-wrap gap-2">
                        {EQUIPMENT.map(item => (
                            <label
                                key={item}
                                className={`cursor-pointer rounded-full border px-3 py-1 text-sm focus-within:ring-2 focus-within:ring-accent-fg ${form.equipment.includes(item) ? 'border-accent bg-accent text-white' : 'border-line bg-bg text-muted'}`}
                            >
                                <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={form.equipment.includes(item)}
                                    onChange={() => toggleEquipment(item)}
                                />
                                {item}
                            </label>
                        ))}
                    </div>
                </fieldset>

                {error && <p role="alert" className="text-sm text-accent-fg">{error}</p>}

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit" loading={saving}>Create exercise</Button>
                </div>
            </form>
        </Dialog>
    )
}

export default CreateExerciseDialog
