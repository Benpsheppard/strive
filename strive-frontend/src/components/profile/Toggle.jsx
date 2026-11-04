// Toggle.jsx
// Metric / imperial switch

import { useSelector, useDispatch } from 'react-redux'
import { updateUnitPreference } from '../../features/auth/authSlice.js'
import { cx } from '../../utils/cx.js'

const Toggle = ({ useImperial }) => {
    const { user } = useSelector((state) => state.auth)
    const dispatch = useDispatch()

    return (
        <div className="flex items-center justify-between gap-3 rounded-xl bg-bg/60 p-3">
            <span id="units-label" className="font-semibold text-fg">Units</span>

            <div className="flex items-center gap-3">
                <span className={cx('text-sm', !useImperial ? 'font-bold text-fg' : 'text-muted')}>Metric (kg, km)</span>
                <button
                    type="button"
                    role="switch"
                    aria-checked={Boolean(useImperial)}
                    aria-labelledby="units-label"
                    onClick={() => dispatch(updateUnitPreference(!user.useImperial))}
                    className={cx(
                        'relative inline-flex h-7 w-12 items-center rounded-full transition-colors',
                        useImperial ? 'bg-accent' : 'bg-line'
                    )}
                >
                    <span
                        aria-hidden="true"
                        className={cx('inline-block h-5 w-5 transform rounded-full bg-fg transition-transform', useImperial ? 'translate-x-6' : 'translate-x-1')}
                    />
                </button>
                <span className={cx('text-sm', useImperial ? 'font-bold text-fg' : 'text-muted')}>Imperial (lbs, mi)</span>
            </div>
        </div>
    )
}

export default Toggle
