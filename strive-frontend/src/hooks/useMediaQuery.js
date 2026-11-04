// useMediaQuery.js

import { useState, useEffect } from 'react'

// True while the viewport matches the query. Safe when matchMedia is unavailable.
export const useMediaQuery = (query) => {
    const getMatch = () => typeof window !== 'undefined' && typeof window.matchMedia === 'function'
        ? window.matchMedia(query).matches
        : false

    const [matches, setMatches] = useState(getMatch)

    useEffect(() => {
        if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
        const media = window.matchMedia(query)
        const onChange = () => setMatches(media.matches)
        onChange()
        media.addEventListener('change', onChange)
        return () => media.removeEventListener('change', onChange)
    }, [query])

    return matches
}

// Matches Tailwind's `md` breakpoint
export const useIsMobile = () => useMediaQuery('(max-width: 767px)')
