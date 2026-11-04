import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useRestTimer } from '../hooks/useRestTimer.js'

beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-11-04T12:00:00Z'))
})

afterEach(() => vi.useRealTimers())

describe('useRestTimer', () => {
    test('counts down from the chosen duration', () => {
        const { result } = renderHook(() => useRestTimer(60))
        expect(result.current.restTimeRemaining).toBe(0)

        act(() => result.current.startRestTimer())
        expect(result.current.restTimeRemaining).toBe(60)

        act(() => vi.advanceTimersByTime(10_000))
        expect(result.current.restTimeRemaining).toBe(50)
    })

    test('finishes by itself, buzzing and clearing the saved end time', () => {
        const vibrate = vi.fn()
        Object.defineProperty(navigator, 'vibrate', { value: vibrate, configurable: true })

        const { result } = renderHook(() => useRestTimer(5))
        act(() => result.current.startRestTimer())
        act(() => vi.advanceTimersByTime(6_000))

        expect(result.current.restTimeRemaining).toBe(0)
        expect(vibrate).toHaveBeenCalled()
        expect(localStorage.getItem('restTimerEnd')).toBeNull()
    })

    test('can be skipped', () => {
        const { result } = renderHook(() => useRestTimer(60))
        act(() => result.current.startRestTimer())
        act(() => result.current.skipTimer())

        expect(result.current.restTimeRemaining).toBe(0)
        expect(localStorage.getItem('restTimerEnd')).toBeNull()
    })

    test('+15 and -15 adjust the time left', () => {
        const { result } = renderHook(() => useRestTimer(60))
        act(() => result.current.startRestTimer())

        act(() => result.current.adjustRest(15))
        expect(result.current.restTimeRemaining).toBe(75)

        act(() => result.current.adjustRest(-30))
        expect(result.current.restTimeRemaining).toBe(45)
    })

    test('subtracting more than is left ends the rest', () => {
        const { result } = renderHook(() => useRestTimer(10))
        act(() => result.current.startRestTimer())
        act(() => result.current.adjustRest(-15))

        expect(result.current.restTimeRemaining).toBe(0)
    })

    test('a rest in progress survives a reload', () => {
        const first = renderHook(() => useRestTimer(60))
        act(() => first.result.current.startRestTimer())
        first.unmount()

        act(() => vi.advanceTimersByTime(20_000))
        const second = renderHook(() => useRestTimer(60))
        expect(second.result.current.restTimeRemaining).toBe(40)
    })

    test('a duration of zero never starts a rest', () => {
        const { result } = renderHook(() => useRestTimer(0))
        act(() => result.current.startRestTimer())
        expect(result.current.restTimeRemaining).toBe(0)
    })
})
