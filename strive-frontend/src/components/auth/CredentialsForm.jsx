// CredentialsForm.jsx
// Email, username and password fields with live password rules. Shared by Register and guest migration.

import { useState } from 'react'
import { FaCheckCircle, FaRegCircle } from 'react-icons/fa'
import Input from '../ui/Input.jsx'
import Button from '../ui/Button.jsx'
import { cx } from '../../utils/cx.js'
import { getPasswordRules, validateCredentials } from '../../utils/credentials.js'

const CredentialsForm = ({ submitLabel, onSubmit }) => {
    const [form, setForm] = useState({ username: '', email: '', password: '', password2: '' })
    const [errors, setErrors] = useState({})
    const { email, username, password, password2 } = form

    const rules = getPasswordRules(password)

    const onChange = (e) => {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
    }

    const submit = (e) => {
        e.preventDefault()

        const found = validateCredentials(form)
        if (Object.keys(found).length > 0) {
            setErrors(found)
            return
        }

        onSubmit({ username: username.trim(), email: email.trim(), password })
    }

    return (
        <form onSubmit={submit} className="space-y-4" noValidate>
            <Input label="Email" name="email" type="email" autoComplete="email" autoCapitalize="none" value={email} error={errors.email} onChange={onChange} />
            <Input label="Username" name="username" autoComplete="username" autoCapitalize="none" value={username} error={errors.username} onChange={onChange} />
            <Input label="Password" name="password" type="password" autoComplete="new-password" value={password} error={errors.password} onChange={onChange} />

            <ul className="grid grid-cols-1 gap-1 text-sm sm:grid-cols-2" aria-label="Password rules">
                {rules.map(rule => (
                    <li key={rule.label} className={cx('flex items-center gap-2', rule.met ? 'text-success' : 'text-muted')}>
                        {rule.met ? <FaCheckCircle aria-label="Met" /> : <FaRegCircle aria-label="Not met" />}
                        {rule.label}
                    </li>
                ))}
            </ul>

            <Input label="Confirm password" name="password2" type="password" autoComplete="new-password" value={password2} error={errors.password2} onChange={onChange} />

            <Button type="submit" fullWidth size="lg">{submitLabel}</Button>
        </form>
    )
}

export default CredentialsForm
