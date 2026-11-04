// Field.jsx
// Label, hint and error wrapper shared by Input and Select

import { cx } from '../../utils/cx.js'

const Field = ({ id, label, hint, error, className, children }) => (
    <div className={cx('flex flex-col gap-1.5', className)}>
        {label && (
            <label htmlFor={id} className="text-sm font-medium text-fg">
                {label}
            </label>
        )}
        {children}
        {hint && !error && <p id={`${id}-hint`} className="text-sm text-muted">{hint}</p>}
        {error && <p id={`${id}-error`} role="alert" className="text-sm text-accent-fg">{error}</p>}
    </div>
)

export default Field
