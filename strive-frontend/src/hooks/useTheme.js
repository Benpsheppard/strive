// useTheme.js
// Theme preference: 'system' (default, follows the OS), 'light' or 'dark'.
// A tiny external store so any component can read it without a provider.

import { useSyncExternalStore } from 'react'

const STORAGE_KEY = 'theme'
const THEME_COLOURS = { light: '#f3f4fa', dark: '#1b1d2e' }
const listeners = new Set()

const query = () => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-color-scheme: light)') : null)

const readPreference = () => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY)
        return saved === 'light' || saved === 'dark' ? saved : 'system'
    } catch {
        return 'system'
    }
}

const resolve = (preference) => {
    if (preference === 'system') return query()?.matches ? 'light' : 'dark'
    return preference
}

let preference = readPreference()
let resolved = resolve(preference)

const apply = () => {
    resolved = resolve(preference)
    document.documentElement.setAttribute('data-theme', resolved)
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOURS[resolved])
    listeners.forEach((l) => l())
}

export const setThemePreference = (next) => {
    preference = next
    try {
        if (next === 'system') localStorage.removeItem(STORAGE_KEY)
        else localStorage.setItem(STORAGE_KEY, next)
    } catch { /* storage unavailable: preference lasts for this session only */ }
    apply()
}

// Follow live changes to the OS setting while on 'system'
query()?.addEventListener?.('change', () => {
    if (preference === 'system') apply()
})

const subscribe = (listener) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
}

// Snapshot is a string so React can compare it by value
const getSnapshot = () => `${preference}|${resolved}`

export function useTheme() {
    const [pref, res] = useSyncExternalStore(subscribe, getSnapshot, () => 'system|dark').split('|')
    return { preference: pref, theme: res, setPreference: setThemePreference }
}
