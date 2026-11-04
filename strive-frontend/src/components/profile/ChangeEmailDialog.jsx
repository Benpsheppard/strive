// ChangeEmailDialog.jsx

import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { changeEmail } from '../../features/auth/authSlice.js'
import Dialog from '../ui/Dialog.jsx'
import Input from '../ui/Input.jsx'
import Button from '../ui/Button.jsx'

const ChangeEmailDialog = ({ open, onClose }) => {
    const dispatch = useDispatch()
    const [form, setForm] = useState({ newEmail: '', password: '' })
    const [errors, setErrors] = useState({})
    const [saving, setSaving] = useState(false)

    const [wasOpen, setWasOpen] = useState(false)
    if (open && !wasOpen) {
        setWasOpen(true)
        setForm({ newEmail: '', password: '' })
        setErrors({})
    }
    if (!open && wasOpen) setWasOpen(false)

    const set = (name) => (event) => {
        setForm(prev => ({ ...prev, [name]: event.target.value }))
        setErrors(prev => ({ ...prev, [name]: undefined, form: undefined }))
    }

    const submit = async (event) => {
        event.preventDefault()

        const found = {}
        if (!/^\S+@\S+\.\S+$/.test(form.newEmail.trim())) found.newEmail = 'Enter a valid email address'
        if (!form.password) found.password = 'Enter your password to confirm'
        setErrors(found)
        if (Object.keys(found).length > 0) return

        setSaving(true)
        const result = await dispatch(changeEmail({ newEmail: form.newEmail.trim(), password: form.password }))
        setSaving(false)

        if (changeEmail.fulfilled.match(result)) {
            toast.success('Email changed. Check your inbox to confirm the new address.')
            onClose()
        } else {
            setErrors({ form: result.payload || 'Could not change your email' })
        }
    }

    return (
        <Dialog open={open} onClose={onClose} title="Change email" description="We will send a link to the new address to confirm it.">
            <form onSubmit={submit} className="space-y-4" noValidate>
                <Input label="New email" type="email" autoComplete="email" autoCapitalize="none" value={form.newEmail} error={errors.newEmail} onChange={set('newEmail')} />
                <Input label="Your password" type="password" autoComplete="current-password" value={form.password} error={errors.password} onChange={set('password')} />

                {errors.form && <p role="alert" className="text-sm text-accent-fg">{errors.form}</p>}

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit" loading={saving}>Change email</Button>
                </div>
            </form>
        </Dialog>
    )
}

export default ChangeEmailDialog
