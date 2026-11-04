import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, render, screen, act, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'

vi.mock('../features/workouts/workoutsService.js', () => ({
    default: { createWorkout: vi.fn(), getWorkouts: vi.fn().mockResolvedValue([]) }
}))
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }))

const navigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => ({ ...(await importOriginal()), useNavigate: () => navigate }))

import { toast } from 'react-toastify'
import workoutsService from '../features/workouts/workoutsService.js'
import authReducer from '../features/auth/authSlice.js'
import workoutReducer from '../features/workouts/workoutsSlice.js'
import { useWorkoutSubmit } from '../hooks/useWorkoutSubmit.js'
import { useSyncPendingWorkouts } from '../hooks/useSyncPendingWorkouts.js'
import PendingBanner from '../components/layout/PendingBanner.jsx'
import {
    addPendingWorkout, getPendingWorkouts, removePendingWorkout, countPendingWorkouts, clearPendingWorkouts
} from '../utils/pendingWorkouts.js'
import { isRetryableError } from '../utils/getErrorMessage.js'

const USER = { _id: 'u1', username: 'ben', token: 't', isGuest: false, level: 1, strivepoints: 0 }

const makeStore = () => configureStore({
    reducer: { auth: authReducer, workout: workoutReducer },
    preloadedState: {
        auth: { user: USER, isError: false, isSuccess: false, isLoading: false, message: '' },
        workout: { workouts: [], lastWorkoutStats: null, isError: false, isSuccess: false, isLoading: false, message: '' }
    }
})

const wrapper = (store) => ({ children }) => (
    <Provider store={store}><MemoryRouter>{children}</MemoryRouter></Provider>
)

const exercises = [{ exercise: 'abc', selectedEquipment: 'Barbell', sets: [{ weight: 50, reps: 5 }] }]
const networkError = () => Object.assign(new Error('Network Error'), { response: undefined })
const serverError = (status, message = 'nope') => ({ response: { status, data: { message } } })

const setOnline = (online) => Object.defineProperty(navigator, 'onLine', { value: online, configurable: true })

beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    setOnline(true)
})
afterEach(cleanup)

describe('pending workout queue', () => {
    const payload = (id) => ({ title: 'Push', duration: 30, exercises, clientId: id })

    test('keeps workouts per user and removes them by id', () => {
        expect(addPendingWorkout('u1', payload('client-aaaaaaaa'))).toBe(true)
        expect(addPendingWorkout('u2', payload('client-bbbbbbbb'))).toBe(true)

        expect(getPendingWorkouts('u1').map(i => i.payload.clientId)).toEqual(['client-aaaaaaaa'])
        expect(countPendingWorkouts('u2')).toBe(1)

        removePendingWorkout('u1', 'client-aaaaaaaa')
        expect(countPendingWorkouts('u1')).toBe(0)
        expect(countPendingWorkouts('u2')).toBe(1)
    })

    test('the same workout is only queued once', () => {
        addPendingWorkout('u1', payload('client-aaaaaaaa'))
        addPendingWorkout('u1', payload('client-aaaaaaaa'))
        expect(countPendingWorkouts('u1')).toBe(1)
    })

    test('refuses a workout with no id, and a queue that is too long', () => {
        expect(addPendingWorkout('u1', { title: 'x', exercises })).toBe(false)

        for (let i = 0; i < 25; i++) addPendingWorkout('u1', payload(`client-${String(i).padStart(8, '0')}`))
        expect(addPendingWorkout('u1', payload('client-overflow'))).toBe(false)
    })

    test('survives corrupt storage', () => {
        localStorage.setItem('Strive:pendingWorkouts', '{not json')
        expect(getPendingWorkouts('u1')).toEqual([])
        expect(addPendingWorkout('u1', payload('client-aaaaaaaa'))).toBe(true)
    })

    test('can be cleared', () => {
        addPendingWorkout('u1', payload('client-aaaaaaaa'))
        clearPendingWorkouts()
        expect(countPendingWorkouts('u1')).toBe(0)
    })
})

describe('which failures are worth retrying', () => {
    test.each([
        ['no connection', networkError(), true],
        ['server error', serverError(500), true],
        ['bad gateway', serverError(502), true],
        ['rate limited', serverError(429), true],
        ['timeout', serverError(408), true],
        ['validation error', serverError(400), false],
        ['not allowed', serverError(403), false],
        ['guest limit', serverError(403, 'limit'), false],
        ['signed out', serverError(401), false]
    ])('%s', (_label, error, expected) => {
        expect(isRetryableError(error)).toBe(expected)
    })
})

describe('saving a workout', () => {
    const setup = () => {
        const store = makeStore()
        const resetWorkoutState = vi.fn()
        const { result } = renderHook(
            () => useWorkoutSubmit({ title: 'Push day', startTime: Date.now() - 30 * 60000, clientId: 'client-abcdef12', resetWorkoutState }),
            { wrapper: wrapper(store) }
        )
        return { store, result, resetWorkoutState }
    }

    test('sends the clientId and shows the summary when it works', async () => {
        workoutsService.createWorkout.mockResolvedValue({ workout: { _id: 'w1' }, user: { strivepoints: 100 }, gamification: { levelUp: 2 } })
        const { result, store, resetWorkoutState } = setup()

        let saved
        await act(async () => { saved = await result.current.submitWorkout(exercises) })

        expect(saved).toBe(true)
        expect(workoutsService.createWorkout.mock.calls[0][0]).toMatchObject({ title: 'Push day', clientId: 'client-abcdef12' })
        expect(navigate).toHaveBeenCalledWith('/workout-complete')
        expect(resetWorkoutState).toHaveBeenCalled()
        expect(store.getState().workout.lastWorkoutStats.workout._id).toBe('w1')
        expect(countPendingWorkouts('u1')).toBe(0)
    })

    test('with no connection the workout is kept on the device, not lost', async () => {
        workoutsService.createWorkout.mockRejectedValue(networkError())
        const { result, store, resetWorkoutState } = setup()

        let saved
        await act(async () => { saved = await result.current.submitWorkout(exercises) })

        expect(saved).toBe(true)
        expect(countPendingWorkouts('u1')).toBe(1)
        expect(getPendingWorkouts('u1')[0].payload).toMatchObject({ clientId: 'client-abcdef12', title: 'Push day' })
        expect(toast.info).toHaveBeenCalled()
        expect(resetWorkoutState).toHaveBeenCalled()
        expect(navigate).toHaveBeenCalledWith('/')
        // The page is not left in an error state
        expect(store.getState().workout.isError).toBe(false)
    })

    test('a server error is kept for retry too', async () => {
        workoutsService.createWorkout.mockRejectedValue(serverError(503, 'unavailable'))
        const { result } = setup()

        await act(async () => { await result.current.submitWorkout(exercises) })

        expect(countPendingWorkouts('u1')).toBe(1)
    })

    test('a refused workout stays on screen with the reason, and is not queued', async () => {
        workoutsService.createWorkout.mockRejectedValue(serverError(400, 'Sets contain invalid values'))
        const { result, resetWorkoutState } = setup()

        let saved
        await act(async () => { saved = await result.current.submitWorkout(exercises) })

        expect(saved).toBe(false)
        expect(countPendingWorkouts('u1')).toBe(0)
        expect(toast.error).toHaveBeenCalledWith('Sets contain invalid values')
        expect(resetWorkoutState).not.toHaveBeenCalled()
        expect(navigate).not.toHaveBeenCalled()
    })

    test('refuses an empty workout', async () => {
        const { result } = setup()

        let saved
        await act(async () => { saved = await result.current.submitWorkout([]) })

        expect(saved).toBe(false)
        expect(workoutsService.createWorkout).not.toHaveBeenCalled()
    })
})

describe('uploading queued workouts', () => {
    const queue = (...ids) => ids.forEach(id => addPendingWorkout('u1', { title: id, duration: 30, exercises, clientId: id }))
    const mount = () => renderHook(() => useSyncPendingWorkouts(), { wrapper: wrapper(makeStore()) })

    test('uploads everything waiting, in order, and tells the user', async () => {
        queue('client-aaaaaaaa', 'client-bbbbbbbb')
        workoutsService.createWorkout.mockResolvedValue({ workout: { _id: 'w' }, user: { strivepoints: 1 }, gamification: null })

        mount()

        await waitFor(() => expect(countPendingWorkouts('u1')).toBe(0))
        expect(workoutsService.createWorkout.mock.calls.map(c => c[0].clientId)).toEqual(['client-aaaaaaaa', 'client-bbbbbbbb'])
        await waitFor(() => expect(toast.success).toHaveBeenCalledWith('2 offline workouts have been uploaded.'))
    })

    test('stops at the first retryable failure and keeps the rest', async () => {
        queue('client-aaaaaaaa', 'client-bbbbbbbb')
        workoutsService.createWorkout.mockRejectedValue(networkError())

        mount()

        await waitFor(() => expect(workoutsService.createWorkout).toHaveBeenCalledTimes(1))
        expect(countPendingWorkouts('u1')).toBe(2)
        expect(toast.success).not.toHaveBeenCalled()
    })

    test('drops a workout the server refuses, telling the user why', async () => {
        queue('client-aaaaaaaa')
        workoutsService.createWorkout.mockRejectedValue(serverError(400, 'Sets contain invalid values'))

        mount()

        await waitFor(() => expect(countPendingWorkouts('u1')).toBe(0))
        expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Sets contain invalid values'))
    })

    test('does nothing while offline, then uploads when the connection returns', async () => {
        queue('client-aaaaaaaa')
        workoutsService.createWorkout.mockResolvedValue({ workout: { _id: 'w' }, user: { strivepoints: 1 }, gamification: null })
        setOnline(false)

        mount()
        await new Promise(resolve => setTimeout(resolve, 50))
        expect(workoutsService.createWorkout).not.toHaveBeenCalled()

        setOnline(true)
        act(() => { window.dispatchEvent(new Event('online')) })

        await waitFor(() => expect(countPendingWorkouts('u1')).toBe(0))
    })

    test("only uploads the signed-in user's workouts", async () => {
        addPendingWorkout('someone-else', { title: 'theirs', duration: 30, exercises, clientId: 'client-other-1234' })
        workoutsService.createWorkout.mockResolvedValue({ workout: { _id: 'w' }, user: {}, gamification: null })

        mount()
        await new Promise(resolve => setTimeout(resolve, 50))

        expect(workoutsService.createWorkout).not.toHaveBeenCalled()
        expect(countPendingWorkouts('someone-else')).toBe(1)
    })
})

describe('pending banner', () => {
    test('shows how many are waiting and lets the user retry now', async () => {
        addPendingWorkout('u1', { title: 'a', duration: 30, exercises, clientId: 'client-aaaaaaaa' })
        addPendingWorkout('u1', { title: 'b', duration: 30, exercises, clientId: 'client-bbbbbbbb' })
        const onSync = vi.fn()
        const user = userEvent.setup()

        render(<Provider store={makeStore()}><PendingBanner onSync={onSync} /></Provider>)

        expect(screen.getByRole('status').textContent).toMatch(/2 workouts are waiting to upload/)
        await user.click(screen.getByRole('button', { name: 'Try now' }))
        expect(onSync).toHaveBeenCalled()
    })

    test('is hidden when nothing is waiting', () => {
        render(<Provider store={makeStore()}><PendingBanner onSync={vi.fn()} /></Provider>)
        expect(screen.queryByRole('status')).toBeNull()
    })
})
