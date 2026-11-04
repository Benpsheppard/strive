import { describe, test, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'

import RequireAuth from '../components/layout/RequireAuth.jsx'
import AppLayout from '../components/layout/AppLayout.jsx'
import StatRow from '../components/progress/StatRow.jsx'
import ProgressBar from '../components/games/ProgressBar.jsx'
import Landing from '../pages/Landing.jsx'
import NotFound from '../pages/NotFound.jsx'

afterEach(cleanup)

const storeWith = (user) => configureStore({
    reducer: { auth: () => ({ user }) }
})

const signedIn = { _id: 'u1', username: 'ben', level: 3, streak: { current: 2 }, momentum: { current: 40 } }

const renderAt = (path, user) => render(
    <Provider store={storeWith(user)}>
        <MemoryRouter initialEntries={[path]}>
            <Routes>
                <Route path="/login" element={<p>Login page</p>} />
                <Route element={<RequireAuth />}>
                    <Route element={<AppLayout />}>
                        <Route path="/progress" element={<p>Progress page</p>} />
                    </Route>
                </Route>
            </Routes>
        </MemoryRouter>
    </Provider>
)

describe('route guard', () => {
    test('signed-out visitors are sent to the login page', () => {
        renderAt('/progress', null)
        expect(screen.getByText('Login page')).toBeTruthy()
        expect(screen.queryByText('Progress page')).toBeNull()
    })

    test('signed-in users get the page inside the app shell', () => {
        renderAt('/progress', signedIn)
        expect(screen.getByText('Progress page')).toBeTruthy()
        expect(screen.getAllByRole('navigation', { name: 'Main' }).length).toBeGreaterThan(0)
        expect(screen.getByRole('group', { name: 'Your progress' })).toBeTruthy()
    })

    test('the app shell has a skip link and labelled stats', () => {
        renderAt('/progress', signedIn)
        expect(screen.getByRole('link', { name: 'Skip to content' })).toBeTruthy()
        expect(screen.getByRole('link', { name: 'Level: 3' })).toBeTruthy()
        expect(screen.getByRole('link', { name: 'Streak: 2' })).toBeTruthy()
        expect(screen.getByRole('link', { name: 'Momentum: 40' })).toBeTruthy()
    })
})

describe('public pages', () => {
    const renderPublic = (element) => render(
        <Provider store={storeWith(null)}>
            <MemoryRouter>{element}</MemoryRouter>
        </Provider>
    )

    test('the landing page explains the product and offers sign up', () => {
        renderPublic(<Landing />)
        expect(screen.getByRole('heading', { level: 1 }).textContent).toMatch(/Keep showing up/)
        expect(screen.getAllByRole('link', { name: /Get started/ }).length).toBeGreaterThan(0)
        expect(screen.getByRole('heading', { name: /How it works/ })).toBeTruthy()
    })

    test('unknown pages show a way back', () => {
        renderPublic(<NotFound />)
        expect(screen.getByText('Page not found')).toBeTruthy()
        expect(screen.getByRole('link', { name: 'Back to Strive' })).toBeTruthy()
    })
})

describe('StatRow', () => {
    test('shows the change against the previous period', () => {
        render(<dl><StatRow label="Workouts" value="10" current={10} previous={8} /></dl>)
        expect(screen.getByText('+25%')).toBeTruthy()
    })

    test('can hide the comparison', () => {
        render(<dl><StatRow label="Workouts" value="10" current={10} previous={8} showComparison={false} /></dl>)
        expect(screen.queryByText('+25%')).toBeNull()
    })

    test('a new stat is labelled New', () => {
        render(<dl><StatRow label="Distance" value="5 km" current={5} previous={0} /></dl>)
        expect(screen.getByText('New')).toBeTruthy()
    })
})

describe('ProgressBar', () => {
    test('exposes its value to assistive tech and never overflows', () => {
        render(<ProgressBar numerator={150} denominator={100} label="Quest" />)
        const bar = screen.getByRole('progressbar', { name: 'Quest' })
        expect(bar.getAttribute('aria-valuenow')).toBe('100')
        expect(bar.getAttribute('aria-valuemax')).toBe('100')
    })

    test('a zero denominator does not break it', () => {
        render(<ProgressBar numerator={3} denominator={0} label="Empty" />)
        expect(screen.getByRole('progressbar', { name: 'Empty' })).toBeTruthy()
    })
})
