// Button.jsx
// The one button style used across the app

import { cx } from '../../utils/cx.js'

const VARIANTS = {
    primary: 'bg-accent text-white hover:bg-accent-strong',
    secondary: 'bg-surface-2 text-fg border border-line hover:border-muted',
    outline: 'bg-transparent text-fg border border-accent-fg hover:bg-accent hover:border-accent hover:text-white',
    danger: 'bg-transparent text-accent-fg border border-accent-fg hover:bg-accent hover:text-white hover:border-accent',
    ghost: 'bg-transparent text-muted hover:text-fg hover:bg-surface-2'
}

const SIZES = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3.5 text-lg'
}

const Button = ({
    as: Component = 'button',
    variant = 'primary',
    size = 'md',
    loading = false,
    fullWidth = false,
    className,
    children,
    disabled,
    type,
    ...rest
}) => {
    const isButton = Component === 'button'

    return (
        <Component
            {...(isButton ? { type: type || 'button', disabled: disabled || loading } : {})}
            aria-busy={loading || undefined}
            className={cx(
                'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors duration-150',
                'disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]',
                VARIANTS[variant],
                SIZES[size],
                fullWidth && 'w-full',
                className
            )}
            {...rest}
        >
            {loading && (
                <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
            {children}
        </Component>
    )
}

export default Button
