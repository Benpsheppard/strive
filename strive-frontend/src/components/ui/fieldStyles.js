// fieldStyles.js
// Shared styling and accessibility helpers for form controls

export const CONTROL_CLASSES = 'w-full rounded-xl border bg-bg px-4 py-2.5 text-fg placeholder:text-muted transition-colors focus:border-accent-fg focus:outline-none focus:ring-2 focus:ring-accent-fg/40 disabled:opacity-50'

// Ties a control to its hint or error text for screen readers
export const describedBy = (id, hint, error) =>
    error ? `${id}-error` : hint ? `${id}-hint` : undefined
