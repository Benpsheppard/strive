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
        { id: 'workouts_1', category: 'achievement', tier: 'common', secret: false, name: 'Workout Warrior I', description: 'Complete your first workout', icon: 'dumbbell', unlockedAt: '2026-03-10T12:00:00.000Z' },
        { id: 'workouts_10', category: 'achievement', tier: 'common', secret: false, name: 'Workout Warrior II', description: 'Complete 10 workouts', icon: 'dumbbell', unlockedAt: null },
        { id: 'early_bird', category: 'achievement', tier: 'uncommon', secret: false, name: 'Early Bird', description: 'Finish a workout before 6am', icon: 'sunrise', unlockedAt: null },
    ],
    unlocked: 1,
    total: 3
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

        expect(state.achievements).toHaveLength(3)
        expect(state.unlocked).toBe(1)
        expect(state.total).toBe(3)
        expect(state.secrets).toEqual({ unlocked: 0, total: null })
    })

    test('records a load failure', () => {
        const state = achievementsReducer(undefined, getAchievements.rejected(null, 'req', undefined, 'nope'))

        expect(state.isError).toBe(true)
        expect(state.message).toBe('nope')
    })
})

describe('achievements page', () => {
    test('combines all non-secret badges and hides secrets until unlocked', async () => {
        achievementsService.getAchievements.mockResolvedValue(LIST)

        renderWith(<Achievements />)

        expect(await screen.findByText('Workout Warrior I')).toBeTruthy()
        expect(screen.getByText('Workout Warrior II')).toBeTruthy()
        expect(screen.getByText('Early Bird')).toBeTruthy()
        expect(screen.getByRole('heading', { name: /^Achievements \d/ })).toBeTruthy()
        expect(screen.queryByRole('heading', { name: /Milestones|Wacky/ })).toBeNull()

        // No secret section until at least one secret is unlocked
        expect(screen.queryByRole('heading', { name: /Secret/ })).toBeNull()
        expect(screen.queryByText('High Noon')).toBeNull()

        expect(screen.getByRole('progressbar', { name: 'Achievements unlocked' }).getAttribute('aria-valuenow')).toBe('1')
    })

    test('shows the secret total only once every secret is unlocked', async () => {
        achievementsService.getAchievements.mockResolvedValue({
            ...LIST,
            achievements: [
                ...LIST.achievements,
                { id: 'high_noon', category: 'secret', tier: 'legendary', secret: true, name: 'High Noon', description: 'Secret thing', icon: 'sun', unlockedAt: '2026-03-11T12:00:00.000Z' }
            ],
            secrets: { unlocked: 7, total: 7 }
        })

        renderWith(<Achievements />)

        expect(await screen.findByRole('heading', { name: 'Secrets 7 / 7' })).toBeTruthy()
    })

    test('lists an unlocked secret under a partial count', async () => {
        achievementsService.getAchievements.mockResolvedValue({
            achievements: [
                ...LIST.achievements,
                { id: 'high_noon', category: 'secret', tier: null, secret: true, name: 'High Noon', description: 'Secret thing', icon: 'star', unlockedAt: '2026-03-11T12:00:00.000Z' }
            ],
            unlocked: 2,
            total: 4,
            secrets: { unlocked: 1, total: null }
        })

        renderWith(<Achievements />)

        expect(await screen.findByText('High Noon')).toBeTruthy()
        expect(screen.getByRole('heading', { name: 'Secret 1 / ???' })).toBeTruthy()
    })

    test('shows one card per ladder: the highest rung unlocked', async () => {
        const rung = (n, unlockedAt) => ({ id: `workouts_${n}`, ladder: 'workouts', category: 'achievement', tier: 'common', secret: false, name: `Workout Warrior ${n}`, description: `Complete ${n}`, icon: 'dumbbell', unlockedAt })
        achievementsService.getAchievements.mockResolvedValue({
            achievements: [
                rung(1, '2026-03-10T12:00:00.000Z'),
                rung(10, '2026-03-12T12:00:00.000Z'),
                rung(50, null),
                { id: 'level_5', ladder: 'level', category: 'achievement', tier: 'common', secret: false, name: 'Level Up 5', description: 'Reach 5', icon: 'level', unlockedAt: null },
                { id: 'level_10', ladder: 'level', category: 'achievement', tier: 'uncommon', secret: false, name: 'Level Up 10', description: 'Reach 10', icon: 'level', unlockedAt: null },
                { id: 'early_bird', ladder: null, category: 'achievement', tier: 'uncommon', secret: false, name: 'Early Bird', description: 'Early', icon: 'sunrise', unlockedAt: null }
            ],
            unlocked: 2,
            total: 6,
            secrets: { unlocked: 0, total: null }
        })

        renderWith(<Achievements />)

        // Highest unlocked rung, not the lower or the locked higher ones
        expect(await screen.findByText('Workout Warrior 10')).toBeTruthy()
        expect(screen.queryByText('Workout Warrior 1')).toBeNull()
        expect(screen.queryByText('Workout Warrior 50')).toBeNull()
        // Nothing unlocked on a ladder: the first rung is shown
        expect(screen.getByText('Level Up 5')).toBeTruthy()
        expect(screen.queryByText('Level Up 10')).toBeNull()
        expect(screen.getByText('Early Bird')).toBeTruthy()
        // The section count still covers every achievement
        expect(screen.getByRole('heading', { name: 'Achievements 2 / 6' })).toBeTruthy()
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
            { id: 'workouts_1', name: 'Workout Warrior I', description: 'Complete your first workout', icon: 'dumbbell', tier: 'common' },
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
