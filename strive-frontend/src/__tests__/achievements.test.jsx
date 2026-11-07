import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'

vi.mock('../features/achievements/achievementsService.js', () => ({
    default: { getAchievements: vi.fn(), reportEvent: vi.fn() }
}))
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }))

import { toast } from 'react-toastify'
import achievementsService from '../features/achievements/achievementsService.js'
import achievementsReducer, { getAchievements } from '../features/achievements/achievementsSlice.js'
import { useAchievementEvent, resetSentEvents } from '../hooks/useAchievementEvent.js'
import Achievements from '../pages/Achievements.jsx'
import BadgesEarned from '../components/workout-complete/BadgesEarned.jsx'
import ThemeToggle from '../components/ui/ThemeToggle.jsx'

const USER = { _id: 'u1', username: 'ben', token: 't', achievementCount: 1 }

const LIST = {
    achievements: [
        { id: 'workouts_1', category: 'milestone', tier: 'bronze', secret: false, name: 'Workout Warrior I', description: 'Complete your first workout', icon: 'dumbbell', unlockedAt: '2026-03-10T12:00:00.000Z' },
        { id: 'workouts_10', category: 'milestone', tier: 'bronze', secret: false, name: 'Workout Warrior II', description: 'Complete 10 workouts', icon: 'dumbbell', unlockedAt: null },
        { id: 'early_bird', category: 'wacky', tier: null, secret: false, name: 'Early Bird', description: 'Finish a workout before 6am', icon: 'sunrise', unlockedAt: null },
        { id: 'high_noon', category: 'secret', tier: null, secret: true, name: '???', description: 'A secret achievement. Keep exploring.', icon: 'lock', unlockedAt: null }
    ],
    unlocked: 1,
    total: 4
}

const makeStore = () => configureStore({
    reducer: { auth: (state = { user: USER }) => state, achievements: achievementsReducer }
})

const renderWith = (ui, store = makeStore()) => render(
    <Provider store={store}><MemoryRouter>{ui}</MemoryRouter></Provider>
)

beforeEach(() => {
    vi.clearAllMocks()
    resetSentEvents()
})
afterEach(cleanup)

describe('achievements slice', () => {
    test('stores the list and counts from the server', () => {
        const state = achievementsReducer(undefined, getAchievements.fulfilled(LIST, 'req'))

        expect(state.achievements).toHaveLength(4)
        expect(state.unlocked).toBe(1)
        expect(state.total).toBe(4)
    })

    test('records a load failure', () => {
        const state = achievementsReducer(undefined, getAchievements.rejected(null, 'req', undefined, 'nope'))

        expect(state.isError).toBe(true)
        expect(state.message).toBe('nope')
    })
})

describe('achievements page', () => {
    test('shows unlocked, locked and masked secret badges grouped by category', async () => {
        achievementsService.getAchievements.mockResolvedValue(LIST)

        renderWith(<Achievements />)

        expect(await screen.findByText('Workout Warrior I')).toBeTruthy()
        expect(screen.getByText('Workout Warrior II')).toBeTruthy()
        expect(screen.getByText('Early Bird')).toBeTruthy()
        expect(screen.getByRole('heading', { name: /Milestones/ })).toBeTruthy()
        expect(screen.getByRole('heading', { name: /Secret/ })).toBeTruthy()

        // The secret stays hidden
        expect(screen.getByText('???')).toBeTruthy()
        expect(screen.queryByText(/12:00/)).toBeNull()

        expect(screen.getByRole('progressbar', { name: 'Achievements unlocked' }).getAttribute('aria-valuenow')).toBe('1')
    })

    test('shows a message when the list cannot be loaded', async () => {
        achievementsService.getAchievements.mockRejectedValue(new Error('Network Error'))

        renderWith(<Achievements />)

        expect(await screen.findByText(/could not be loaded/)).toBeTruthy()
    })
})

describe('badges earned card', () => {
    test('renders nothing when no badges were earned', () => {
        const { container } = renderWith(<BadgesEarned badges={[]} />)
        expect(container.firstChild).toBeNull()

        cleanup()
        const missing = renderWith(<BadgesEarned />)
        expect(missing.container.firstChild).toBeNull()
    })

    test('lists each badge earned by the workout', () => {
        renderWith(<BadgesEarned badges={[
            { id: 'workouts_1', name: 'Workout Warrior I', description: 'Complete your first workout', icon: 'dumbbell', tier: 'bronze' },
            { id: 'early_bird', name: 'Early Bird', description: 'Finish a workout before 6am', icon: 'sunrise', tier: null }
        ]} />)

        expect(screen.getByRole('heading', { name: 'Achievements unlocked' })).toBeTruthy()
        expect(screen.getByText('Workout Warrior I')).toBeTruthy()
        expect(screen.getByText('Early Bird')).toBeTruthy()
    })
})

describe('reporting events', () => {
    const Probe = ({ event }) => {
        const report = useAchievementEvent()
        return <button onClick={() => report(event)}>go</button>
    }

    test('celebrates a new unlock with a toast', async () => {
        achievementsService.reportEvent.mockResolvedValue({ unlocked: { id: 'logo_tapper', name: 'Curious Cat' } })

        renderWith(<Probe event="logo_tap_10" />)
        await userEvent.click(screen.getByText('go'))

        await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Achievement unlocked: Curious Cat'))
    })

    test('stays quiet when it was already unlocked', async () => {
        achievementsService.reportEvent.mockResolvedValue({ unlocked: null })

        renderWith(<Probe event="logo_tap_10" />)
        await userEvent.click(screen.getByText('go'))

        await waitFor(() => expect(achievementsService.reportEvent).toHaveBeenCalledTimes(1))
        expect(toast.success).not.toHaveBeenCalled()
    })

    test('only sends each event once per page load', async () => {
        achievementsService.reportEvent.mockResolvedValue({ unlocked: null })

        renderWith(<Probe event="logo_tap_10" />)
        await userEvent.click(screen.getByText('go'))
        await userEvent.click(screen.getByText('go'))

        await waitFor(() => expect(achievementsService.reportEvent).toHaveBeenCalledTimes(1))
    })

    test('the theme toggle reports the secret on the fifth switch', async () => {
        achievementsService.reportEvent.mockResolvedValue({ unlocked: null })

        renderWith(<ThemeToggle />)
        const button = screen.getByRole('button')

        for (let i = 0; i < 4; i++) await userEvent.click(button)
        expect(achievementsService.reportEvent).not.toHaveBeenCalled()

        await userEvent.click(button)
        await waitFor(() => expect(achievementsService.reportEvent).toHaveBeenCalledWith('theme_toggle_5', 't'))
    })
})
