// ThemeToggle.jsx
// Cycles System -> Light -> Dark. System follows the device setting automatically.

import { FaSun, FaMoon, FaCircleHalfStroke } from 'react-icons/fa6'
import { useTheme } from '../../hooks/useTheme.js'

const ORDER = ['system', 'light', 'dark']
const LABELS = { system: 'System', light: 'Light', dark: 'Dark' }
const ICONS = { system: FaCircleHalfStroke, light: FaSun, dark: FaMoon }

const ThemeToggle = ({ showLabel = false }) => {
    const { preference, setPreference } = useTheme()
    const next = ORDER[(ORDER.indexOf(preference) + 1) % ORDER.length]
    const Icon = ICONS[preference]

    return (
        <button
            type="button"
            onClick={() => setPreference(next)}
            title={`Theme: ${LABELS[preference]} (switch to ${LABELS[next]})`}
            aria-label={`Theme: ${LABELS[preference]}. Switch to ${LABELS[next]}`}
            className="flex min-h-10 min-w-10 items-center justify-center gap-2 rounded-lg px-2 text-muted hover:bg-surface-2 hover:text-fg"
        >
            <Icon size={16} aria-hidden="true" />
            {showLabel && <span className="text-sm font-semibold">{LABELS[preference]}</span>}
        </button>
    )
}

export default ThemeToggle
