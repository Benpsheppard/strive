// SaveRoutineDialog.jsx
// Names and saves a list of exercises as a routine (no sets are saved)

import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { createRoutine } from '../../features/routines/routineSlice.js'
import Dialog from '../ui/Dialog.jsx'
import Input from '../ui/Input.jsx'
import Button from '../ui/Button.jsx'

const SaveRoutineDialog = ({ open, initialName = '', exercises, onClose, onSaved }) => {
    const dispatch = useDispatch()
    const [name, setName] = useState(initialName)
    const [error, setError] = useState('')
    const [saving, setSaving] = useState(false)

    // Start from the suggested name each time the dialog opens
    const [wasOpen, setWasOpen] = useState(false)
    if (open && !wasOpen) {
        setWasOpen(true)
        setName(initialName)
        setError('')
    }
    if (!open && wasOpen) setWasOpen(false)

    const submit = async (event) => {
        event.preventDefault()

        if (!name.trim()) {
            setError('Give the routine a name')
            return
        }

        setSaving(true)
        const result = await dispatch(createRoutine({ name: name.trim(), exercises }))
        setSaving(false)

        if (createRoutine.fulfilled.match(result)) {
            toast.success(`Saved "${result.payload.name}" as a routine`)
            onSaved?.(result.payload)
            onClose()
        } else {
            setError(result.payload || 'Could not save the routine')
        }
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            title="Save as routine"
            description={`${exercises.length} ${exercises.length === 1 ? 'exercise' : 'exercises'} will be saved. Sets and weights are not saved, so you enter your own each time.`}
        >
            <form onSubmit={submit} className="space-y-4" noValidate>
                <Input
                    label="Routine name"
                    value={name}
                    maxLength={60}
                    autoFocus
                    error={error}
                    onChange={(event) => { setName(event.target.value); setError('') }}
                />

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit" loading={saving}>Save routine</Button>
                </div>
            </form>
        </Dialog>
    )
}

export default SaveRoutineDialog
