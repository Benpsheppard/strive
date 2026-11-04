// Onboarding.jsx
// Three quick questions. Everything can be skipped and changed later in Profile.

import { useSelector, useDispatch } from 'react-redux'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

import { updateProfile } from '../features/auth/authSlice.js'

import PublicHeader from '../components/headers/PublicHeader.jsx'
import Toggle from '../components/profile/Toggle.jsx'
import Card from '../components/ui/Card.jsx'
import Input from '../components/ui/Input.jsx'
import Select from '../components/ui/Select.jsx'
import Button from '../components/ui/Button.jsx'
import PageTitle from '../components/ui/PageTitle.jsx'

import { lbsToKg } from '../utils/formatValues.js'
import { cx } from '../utils/cx.js'

const TARGET_HINTS = {
    1: 'A gentle start',
    2: 'Easy to fit in',
    3: 'Recommended for most people',
    4: 'Recommended for most people',
    5: 'Very committed',
    6: 'Serious training',
    7: 'Every single day'
}

const Onboarding = () => {
    const { user } = useSelector((state) => state.auth)

    const [form, setForm] = useState({ target: 3, feet: 5, inches: 8, weight: '' })
    const [weightError, setWeightError] = useState('')
    const [saving, setSaving] = useState(false)

    const navigate = useNavigate()
    const dispatch = useDispatch()

    const onSubmit = async (e) => {
        e.preventDefault()
        setWeightError('')

        const weightValue = Number(form.weight)
        if (form.weight !== '' && (!Number.isFinite(weightValue) || weightValue <= 0 || weightValue > 700)) {
            setWeightError('Enter a realistic weight, or leave it blank to skip')
            return
        }

        const profile = {
            target: form.target,
            height: { feet: form.feet, inches: form.inches }
        }
        if (form.weight !== '') {
            profile.weight = user.useImperial ? lbsToKg(weightValue) : weightValue
        }

        setSaving(true)
        const result = await dispatch(updateProfile(profile))
        setSaving(false)

        if (updateProfile.fulfilled.match(result)) {
            navigate('/', { replace: true })
        } else {
            toast.error(result.payload || 'We could not save your details. You can add them later in Profile.')
        }
    }

    return (
        <>
            <PublicHeader />
            <main className="mx-auto max-w-xl px-4 pb-12">
                <PageTitle
                    accent={user.isGuest ? 'Guest' : user.username}
                    subtitle="Three quick questions help Strive set your goals. You can change these any time in Profile."
                >
                    Welcome,
                </PageTitle>

                <form onSubmit={onSubmit} className="space-y-4" noValidate>
                    <Card as="fieldset" className="space-y-3">
                        <legend className="sr-only">Weekly target</legend>
                        <h2 className="font-display text-2xl font-bold">How many workouts a <span className="text-accent-fg">week</span>?</h2>
                        <p className="text-sm text-muted">
                            This is your weekly target. Hitting it earns a bonus and keeps your streak alive.
                        </p>
                        <div className="grid grid-cols-7 gap-1.5" role="radiogroup" aria-label="Workouts per week">
                            {[1, 2, 3, 4, 5, 6, 7].map(n => (
                                <button
                                    key={n}
                                    type="button"
                                    role="radio"
                                    aria-checked={form.target === n}
                                    onClick={() => setForm(prev => ({ ...prev, target: n }))}
                                    className={cx(
                                        'rounded-xl border py-3 text-lg font-bold transition-colors',
                                        form.target === n ? 'border-accent bg-accent text-white' : 'border-line bg-bg text-fg hover:border-muted'
                                    )}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                        <p className="text-center text-sm text-muted">{TARGET_HINTS[form.target]}</p>
                    </Card>

                    <Card className="space-y-3">
                        <h2 className="font-display text-2xl font-bold">Your <span className="text-accent-fg">body weight</span></h2>
                        <Toggle useImperial={user.useImperial} />
                        <Input
                            label={`Weight (${user.useImperial ? 'lbs' : 'kg'}) - optional`}
                            type="number"
                            inputMode="decimal"
                            min="0"
                            step="0.1"
                            value={form.weight}
                            error={weightError}
                            onChange={(e) => setForm(prev => ({ ...prev, weight: e.target.value }))}
                        />
                    </Card>

                    <Card className="space-y-3">
                        <h2 className="font-display text-2xl font-bold">Your <span className="text-accent-fg">height</span></h2>
                        <div className="grid grid-cols-2 gap-3">
                            <Select label="Feet" value={form.feet} onChange={(e) => setForm(prev => ({ ...prev, feet: Number(e.target.value) }))}>
                                {[4, 5, 6, 7].map(n => <option key={n} value={n}>{n} ft</option>)}
                            </Select>
                            <Select label="Inches" value={form.inches} onChange={(e) => setForm(prev => ({ ...prev, inches: Number(e.target.value) }))}>
                                {Array.from({ length: 12 }, (_, i) => i).map(n => <option key={n} value={n}>{n} in</option>)}
                            </Select>
                        </div>
                    </Card>

                    <div className="flex flex-col gap-2">
                        <Button type="submit" size="lg" fullWidth loading={saving}>Save and start training</Button>
                        <Button variant="ghost" fullWidth onClick={() => navigate('/', { replace: true })}>Skip for now</Button>
                    </div>
                </form>
            </main>
        </>
    )
}

export default Onboarding
