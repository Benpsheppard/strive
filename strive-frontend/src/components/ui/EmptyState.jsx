// EmptyState.jsx
// Friendly message with an optional action, for screens with nothing to show yet

import { Link } from 'react-router-dom'
import Button from './Button.jsx'
import { cx } from '../../utils/cx.js'

const EmptyState = ({ icon: Icon, title, message, actionLabel, actionTo, onAction, className }) => (
    <div className={cx('mx-auto flex max-w-md flex-col items-center gap-3 py-10 text-center', className)}>
        {Icon && <Icon aria-hidden="true" className="text-4xl text-muted" />}
        <h2 className="font-display text-2xl font-bold text-fg">{title}</h2>
        {message && <p className="text-muted">{message}</p>}
        {actionLabel && actionTo && (
            <Button as={Link} to={actionTo} className="mt-2">{actionLabel}</Button>
        )}
        {actionLabel && onAction && !actionTo && (
            <Button onClick={onAction} className="mt-2">{actionLabel}</Button>
        )}
    </div>
)

export default EmptyState
