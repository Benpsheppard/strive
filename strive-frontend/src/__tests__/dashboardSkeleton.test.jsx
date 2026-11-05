import { describe, test, expect, afterEach, vi } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'

import WorkoutDashboardSkeleton from '../components/workouts/WorkoutDashboardSkeleton.jsx'

afterEach(cleanup)

const user = { _id: 'u1', username: 'ben' }

describe('dashboard skeleton', () => {
    test('shows the real title and announces that it is loading', () => {
        render(<WorkoutDashboardSkeleton user={user} onStart={() => {}} />)
        expect(screen.getByRole('status').getAttribute('aria-busy')).toBe('true')
        expect(screen.getByText('ben')).toBeTruthy()
    })

    test('does not claim the user has no workouts while history loads', () => {
        render(<WorkoutDashboardSkeleton user={user} onStart={() => {}} />)
        expect(screen.queryByText(/first/i)).toBeNull()
        expect(screen.queryByText('Your workouts will show up here.')).toBeNull()
    })

    test('start works straight away', () => {
        const onStart = vi.fn()
        render(<WorkoutDashboardSkeleton user={user} onStart={onStart} />)
        fireEvent.click(screen.getByRole('button', { name: 'Start workout' }))
        expect(onStart).toHaveBeenCalledOnce()
    })

    test('start is disabled when told to wait, or when there is nothing to start', () => {
        const { rerender } = render(<WorkoutDashboardSkeleton user={user} onStart={() => {}} startDisabled />)
        expect(screen.getByRole('button', { name: 'Start workout' }).disabled).toBe(true)
        rerender(<WorkoutDashboardSkeleton user={user} />)
        expect(screen.getByRole('button', { name: 'Start workout' }).disabled).toBe(true)
    })
})
