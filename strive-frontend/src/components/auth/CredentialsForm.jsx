// CredentialsForm.jsx
// Email, username and password fields with live password rules. Shared by Register and guest migration.

import { useState, useId } from 'react'
import { Link } from 'react-router-dom'
import { FaCheckCircle, FaRegCircle } from 'react-icons/fa'
import Input from '../ui/Input.jsx'
import Button from '../ui/Button.jsx'
import { cx } from '../../utils/cx.js'
import { getPasswordRules, validateCredentials } from '../../utils/credentials.js'

const CredentialsForm = ({ submitLabel, onSubmit }) => {
    const consentId = useId()
    const [form, setForm] = useState({ username: '', email: '', password: '', password2: '', acceptedTerms: false })
    const [errors, setErrors] = useState({})
    const { email, username, password, password2 } = form

    const rules = getPasswordRules(password)

    const onChange = (e) => {
        const { name, value, type, checked } = e.target
        setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
    }

    const submit = (e) => {
        e.preventDefault()

        const found = validateCredentials(form)
        if (Object.keys(found).length > 0) {
            setErrors(found)
            return
        }

        onSubmit({ username: username.trim(), email: email.trim(), password, acceptedTerms: true })
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

            <div>
                <div className="flex items-start gap-3">
                    <input
                        id={consentId}
                        name="acceptedTerms"
                        type="checkbox"
                        checked={form.acceptedTerms}
                        onChange={onChange}
                        aria-invalid={errors.acceptedTerms ? true : undefined}
                        aria-describedby={errors.acceptedTerms ? `${consentId}-error` : undefined}
                        className="mt-1 h-5 w-5 shrink-0 accent-[var(--color-accent)]"
                    />
                    <label htmlFor={consentId} className="text-sm text-muted">
                        I agree to the{' '}
                        <Link to="/terms" target="_blank" rel="noopener" className="text-accent-fg underline">terms of use</Link>
                        {' '}and the{' '}
                        <Link to="/privacy" target="_blank" rel="noopener" className="text-accent-fg underline">privacy policy</Link>.
                    </label>
                </div>
                {errors.acceptedTerms && (
                    <p id={`${consentId}-error`} role="alert" className="mt-1.5 text-sm text-accent-fg">{errors.acceptedTerms}</p>
                )}
            </div>

            <Button type="submit" fullWidth size="lg">{submitLabel}</Button>
        </form>
    )
}

export default CredentialsForm
