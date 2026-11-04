// ChangePasswordDialog.jsx

import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { changePassword } from '../../features/auth/authSlice.js'
import Dialog from '../ui/Dialog.jsx'
import Input from '../ui/Input.jsx'
import Button from '../ui/Button.jsx'
import { getPasswordRules } from '../../utils/credentials.js'

const empty = { currentPassword: '', newPassword: '', confirm: '' }

const ChangePasswordDialog = ({ open, onClose }) => {
    const dispatch = useDispatch()
    const [form, setForm] = useState(empty)
    const [errors, setErrors] = useState({})
    const [saving, setSaving] = useState(false)

    // Start clean each time the dialog opens
    const [wasOpen, setWasOpen] = useState(false)
    if (open && !wasOpen) {
        setWasOpen(true)
        setForm(empty)
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
        if (!form.currentPassword) found.currentPassword = 'Enter your current password'
        if (getPasswordRules(form.newPassword).some(rule => !rule.met)) found.newPassword = 'Use at least 8 characters with upper and lower case, a number and a symbol'
        if (form.newPassword !== form.confirm) found.confirm = 'Passwords do not match'
        setErrors(found)
        if (Object.keys(found).length > 0) return

        setSaving(true)
        const result = await dispatch(changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword }))
        setSaving(false)

        if (changePassword.fulfilled.match(result)) {
            toast.success('Password changed. Your other devices have been signed out.')
            onClose()
        } else {
            setErrors({ form: result.payload || 'Could not change your password' })
        }
    }

    return (
        <Dialog open={open} onClose={onClose} title="Change password" description="You will stay signed in here; all other devices will be signed out.">
            <form onSubmit={submit} className="space-y-4" noValidate>
                <Input label="Current password" type="password" autoComplete="current-password" value={form.currentPassword} error={errors.currentPassword} onChange={set('currentPassword')} />
                <Input label="New password" type="password" autoComplete="new-password" value={form.newPassword} error={errors.newPassword} onChange={set('newPassword')} />
                <Input label="Confirm new password" type="password" autoComplete="new-password" value={form.confirm} error={errors.confirm} onChange={set('confirm')} />

                {errors.form && <p role="alert" className="text-sm text-accent-fg">{errors.form}</p>}

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit" loading={saving}>Change password</Button>
                </div>
            </form>
        </Dialog>
    )
}

export default ChangePasswordDialog
