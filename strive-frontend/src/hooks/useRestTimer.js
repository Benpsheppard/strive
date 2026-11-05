// useRestTimer.js
// Rest countdown between sets. Based on an end time (so it survives tab switches and reloads),
// with a sound and vibration when it finishes.

import { useState, useRef, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'restTimerEnd'
const ADJUST_SECONDS = 15

const getRemaining = (endTime) => Math.max(0, Math.ceil((endTime - Date.now()) / 1000))

// A short two-tone beep. Fails silently where audio isn't available or allowed.
const playBeep = (audioContext) => {
    try {
        if (!audioContext) return
        const now = audioContext.currentTime
        ;[880, 1175].forEach((frequency, i) => {
            const oscillator = audioContext.createOscillator()
            const gain = audioContext.createGain()
            oscillator.frequency.value = frequency
            gain.gain.setValueAtTime(0.0001, now + i * 0.18)
            gain.gain.exponentialRampToValueAtTime(0.25, now + i * 0.18 + 0.02)
            gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.18 + 0.16)
            oscillator.connect(gain).connect(audioContext.destination)
            oscillator.start(now + i * 0.18)
            oscillator.stop(now + i * 0.18 + 0.18)
        })
    } catch {
        // Audio is a nice-to-have
    }
}

export const useRestTimer = (restTimerDuration) => {
    const [endTime, setEndTime] = useState(() => {
        const saved = Number(localStorage.getItem(STORAGE_KEY))
        return saved && saved > Date.now() ? saved : null
    })
    const [restTimeRemaining, setRestTimeRemaining] = useState(() => (endTime ? getRemaining(endTime) : 0))
    const audioRef = useRef(null)

    useEffect(() => {
        if (!endTime) return

        const tick = () => {
            const remaining = getRemaining(endTime)
            setRestTimeRemaining(remaining)

            if (remaining <= 0) {
                clearInterval(interval)
                localStorage.removeItem(STORAGE_KEY)
                setEndTime(null)
                if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([200, 100, 200])
                playBeep(audioRef.current)
            }
        }

        const interval = setInterval(tick, 250)
        tick()
        return () => clearInterval(interval)
    }, [endTime])

    const start = useCallback((seconds) => {
        if (!seconds || seconds <= 0) return

        // Created inside a user action so browsers allow the sound later
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext
            if (AudioContextClass && !audioRef.current) audioRef.current = new AudioContextClass()
            audioRef.current?.resume?.()
        } catch {
            audioRef.current = null
        }

        const end = Date.now() + seconds * 1000
        localStorage.setItem(STORAGE_KEY, String(end))
        setEndTime(end)
    }, [])

    const startRestTimer = useCallback(() => start(restTimerDuration), [start, restTimerDuration])

    const skipTimer = useCallback(() => {
        localStorage.removeItem(STORAGE_KEY)
        setEndTime(null)
    }, [])

    const adjustRest = useCallback((deltaSeconds) => {
        setEndTime((current) => {
            if (!current) return current
            const next = current + deltaSeconds * 1000
            if (next <= Date.now()) {
                localStorage.removeItem(STORAGE_KEY)
                return null
            }
            localStorage.setItem(STORAGE_KEY, String(next))
            return next
        })
    }, [])

    return { restTimeRemaining: endTime ? restTimeRemaining : 0, startRestTimer, skipTimer, adjustRest, adjustSeconds: ADJUST_SECONDS }
}
