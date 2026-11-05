// chartTheme.js
// Chart libraries need literal colours, so these are read from the CSS tokens in index.css.
// Call useChartColours() inside a component so charts re-render when the theme changes.

import { useTheme } from '../hooks/useTheme.js'

const read = (name, fallback) => {
    if (typeof document === 'undefined') return fallback
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback
}

export function useChartColours() {
    const { theme } = useTheme()
    const light = theme === 'light'
    return {
        text: read('--color-fg', '#edf2f4'),
        muted: read('--color-muted', '#a9b1c9'),
        grid: light ? 'rgba(75, 80, 105, 0.2)' : 'rgba(169, 177, 201, 0.2)',
        surface: read('--color-surface', '#2b2d42'),
        accent: read('--color-accent-fg', '#ff8593')
    }
}
