// SetForm.jsx
// Inputs for one set. Which fields appear (and their units) comes from the exercise's tracking mode.

import { forwardRef } from 'react'
import Input from '../ui/Input.jsx'
import Button from '../ui/Button.jsx'
import { getModeFields, isSupportedMode } from '../../utils/trackingModes.js'

const SetForm = forwardRef(({ trackingMode, values, errors = {}, onChange, onSubmit, onCancel, editing, useImperial }, firstFieldRef) => {
    if (!isSupportedMode(trackingMode)) {
        return <p role="alert" className="text-sm text-accent-fg">This exercise type cannot be logged yet.</p>
    }

    const fields = getModeFields(trackingMode, useImperial)

    return (
        <form
            onSubmit={(event) => { event.preventDefault(); onSubmit() }}
            className="space-y-3"
            noValidate
        >
            <div className={fields.length > 1 ? 'grid grid-cols-2 gap-3' : 'grid grid-cols-1 gap-3'}>
                {fields.map((field, index) => (
                    <Input
                        key={field.name}
                        ref={index === 0 ? firstFieldRef : undefined}
                        label={field.label}
                        name={field.name}
                        type="number"
                        inputMode={field.inputMode}
                        step={field.step}
                        min="0"
                        enterKeyHint={index === fields.length - 1 ? 'done' : 'next'}
                        value={values[field.name] ?? ''}
                        error={errors[field.name]}
                        onChange={(event) => onChange(field.name, event.target.value)}
                    />
                ))}
            </div>

            <div className="flex gap-2">
                <Button type="submit" fullWidth>{editing ? 'Update set' : 'Add set'}</Button>
                {editing && <Button variant="secondary" onClick={onCancel}>Cancel</Button>}
            </div>
        </form>
    )
})

SetForm.displayName = 'SetForm'
export default SetForm
