// Card.jsx

import { cx } from '../../utils/cx.js'

const PADDING = { none: '', sm: 'p-3', md: 'p-4 sm:p-5', lg: 'p-5 sm:p-6' }

const Card = ({ as: Component = 'div', padding = 'md', raised = false, className, children, ...rest }) => (
    <Component
        className={cx(
            'rounded-2xl border border-line/60 shadow-card',
            raised ? 'bg-surface-2' : 'bg-surface',
            PADDING[padding],
            className
        )}
        {...rest}
    >
        {children}
    </Component>
)

export const CardTitle = ({ as: Component = 'h2', accent, children, className, ...rest }) => (
    <Component className={cx('font-display text-2xl font-bold text-fg', className)} {...rest}>
        {children}
        {accent && <span className="text-accent-fg"> {accent}</span>}
    </Component>
)

export default Card
