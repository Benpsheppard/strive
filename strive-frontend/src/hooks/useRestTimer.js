// useRestTimer.js

// Imports
import { useState, useRef, useEffect } from 'react'
import { showRestCompleteAlert } from '../alerts/workout.js'

export const useRestTimer = (restTimerDuration) => {
    const [restTimeRemaining, setRestTimeRemaining] = useState(0)
    const restIntervalRef = useRef(null)

    // Cleanup on unmount
    useEffect(() => {
        return () => { 
            if (restIntervalRef.current) {
                clearInterval(restIntervalRef.current) 
            }
        }
    }, [])

    // Restore timer from localStorage on mount
    useEffect(() => {
        const savedEnd = localStorage.getItem('restTimerEnd')
        if (savedEnd) {
            const endTime = Number(savedEnd)
            const remaining = Math.floor((endTime - Date.now()) / 1000)
            if (remaining > 0) updateRestTimer(endTime)
            else localStorage.removeItem('restTimerEnd')
        }
    }, [])

    const updateRestTimer = (endTime) => {
        setRestTimeRemaining(Math.max(0, Math.floor((endTime - Date.now()) / 1000)))
        restIntervalRef.current = setInterval(() => {
            const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000))
            setRestTimeRemaining(remaining)
            if (remaining <= 0) {
                clearInterval(restIntervalRef.current)
                restIntervalRef.current = null
                localStorage.removeItem('restTimerEnd')
                showRestCompleteAlert()
            }
        }, 1000)
    }

    const startRestTimer = () => {
        if (restIntervalRef.current) clearInterval(restIntervalRef.current)
        const endTime = Date.now() + restTimerDuration * 1000
        localStorage.setItem('restTimerEnd', endTime)
        updateRestTimer(endTime)
    }

    const skipTimer = () => {
        clearInterval(restIntervalRef.current)
        localStorage.removeItem('restTimerEnd')
        setRestTimeRemaining(0)
    }

    return { restTimeRemaining, startRestTimer, skipTimer }
}