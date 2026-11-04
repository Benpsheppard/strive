// EditDetailsDialog.jsx
// Change weekly target, height and body weight

import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'

import { updateProfile } from '../../features/auth/authSlice.js'
import Dialog from '../ui/Dialog.jsx'
import Input from '../ui/Input.jsx'
import Select from '../ui/Select.jsx'
import Button from '../ui/Button.jsx'
import { lbsToKg, kgToLbs } from '../../utils/formatValues.js'

const buildForm = (user) => ({
    target: user.target || 3,
    feet: user.height?.feet || 5,
    inches: user.height?.inches ?? 8,
    weight: user.weight ? String(Math.round((user.useImperial ? kgToLbs(user.weight) : user.weight) * 10) / 10) : ''
})

const EditDetailsDialog = ({ open, user, onClose }) => {
    const dispatch = useDispatch()
    const [form, setForm] = useState(buildForm(user))
    const [weightError, setWeightError] = useState('')
    const [saving, setSaving] = useState(false)

    // Start from the saved values each time the dialog opens
    const [wasOpen, setWasOpen] = useState(false)
    if (open && !wasOpen) {
        setWasOpen(true)
        setForm(buildForm(user))
        setWeightError('')
    }
    if (!open && wasOpen) setWasOpen(false)

    const submit = async (event) => {
        event.preventDefault()
        setWeightError('')

        const weight = Number(form.weight)
        if (form.weight !== '' && (!Number.isFinite(weight) || weight <= 0 || weight > 700)) {
            setWeightError('Enter a realistic weight, or leave it blank')
            return
        }

        const profile = { target: Number(form.target), height: { feet: Number(form.feet), inches: Number(form.inches) } }
        if (form.weight !== '') profile.weight = user.useImperial ? lbsToKg(weight) : weight

        setSaving(true)
        const result = await dispatch(updateProfile(profile))
        setSaving(false)

        if (updateProfile.fulfilled.match(result)) {
            toast.success('Details updated')
            onClose()
        } else {
            toast.error(result.payload || 'Could not save your details')
        }
    }

    return (
        <Dialog open={open} onClose={onClose} title="Edit your details" description="Your weekly target drives your streak and weekly bonus.">
            <form onSubmit={submit} className="space-y-4" noValidate>
                <Select label="Workouts per week (target)" value={form.target} onChange={(e) => setForm(prev => ({ ...prev, target: e.target.value }))}>
                    {[1, 2, 3, 4, 5, 6, 7].map(n => <option key={n} value={n}>{n}</option>)}
                </Select>

                <div className="grid grid-cols-2 gap-3">
                    <Select label="Height (ft)" value={form.feet} onChange={(e) => setForm(prev => ({ ...prev, feet: e.target.value }))}>
                        {[4, 5, 6, 7].map(n => <option key={n} value={n}>{n}</option>)}
                    </Select>
                    <Select label="Height (in)" value={form.inches} onChange={(e) => setForm(prev => ({ ...prev, inches: e.target.value }))}>
                        {Array.from({ length: 12 }, (_, i) => i).map(n => <option key={n} value={n}>{n}</option>)}
                    </Select>
                </div>

                <Input
                    label={`Body weight (${user.useImperial ? 'lbs' : 'kg'})`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.1"
                    value={form.weight}
                    error={weightError}
                    onChange={(e) => setForm(prev => ({ ...prev, weight: e.target.value }))}
                />

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit" loading={saving}>Save</Button>
                </div>
            </form>
        </Dialog>
    )
}

export default EditDetailsDialog
