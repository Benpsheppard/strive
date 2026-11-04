import { describe, test, expect, beforeEach } from 'vitest'
import authReducer, { getMe } from '../features/auth/authSlice.js'
import workoutReducer, { createWorkout } from '../features/workouts/workoutsSlice.js'
import questReducer, { generateQuests } from '../features/quests/questSlice.js'

beforeEach(() => localStorage.clear())

describe('workouts slice', () => {
    test('a saved workout is added to the list, not the whole response', () => {
        const workout = { _id: 'w1', title: 'Push' }
        const state = workoutReducer(
            undefined,
            createWorkout.fulfilled({ workout, user: {}, gamification: {} }, 'req', {})
        )

        expect(state.workouts).toEqual([workout])
    })

    test('lastWorkoutStats starts empty', () => {
        expect(workoutReducer(undefined, { type: 'init' }).lastWorkoutStats).toBeNull()
    })
})

describe('quest slice', () => {
    test('generated quests replace the list for that duration', () => {
        const quests = [{ _id: 'q1' }]
        const state = questReducer(undefined, generateQuests.fulfilled({ quests }, 'req', 'weekly'))

        expect(state.quests.weekly).toEqual(quests)
        expect(state.quests.daily).toEqual([])
    })
})

describe('auth slice', () => {
    const loggedIn = () => {
        const user = { _id: 'u1', token: 'abc' }
        localStorage.setItem('Strive:user', JSON.stringify(user))
        return { user, isError: false, isSuccess: false, isLoading: true, message: '' }
    }

    const rejectedMe = (status) => ({
        type: getMe.rejected.type,
        payload: 'error',
        meta: { status, requestStatus: 'rejected' }
    })

    test('a 401 from /me logs the user out', () => {
        const state = authReducer(loggedIn(), rejectedMe(401))

        expect(state.user).toBeNull()
        expect(state.isLoading).toBe(false)
        expect(localStorage.getItem('Strive:user')).toBeNull()
    })

    test('a server or network error keeps the user logged in', () => {
        const initial = loggedIn()
        const state = authReducer(initial, rejectedMe(500))

        expect(state.user).toEqual(initial.user)
        expect(state.isLoading).toBe(false)
        expect(localStorage.getItem('Strive:user')).not.toBeNull()
    })

    test('an error with no response keeps the user logged in', () => {
        const state = authReducer(loggedIn(), rejectedMe(undefined))
        expect(state.user).not.toBeNull()
    })
})
