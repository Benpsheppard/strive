import { describe, test, expect, vi, beforeEach } from 'vitest'
import { configureStore } from '@reduxjs/toolkit'

vi.mock('../features/auth/authService.js', () => ({
    default: { getMe: vi.fn() }
}))

import authService from '../features/auth/authService.js'
import authReducer, { getMe } from '../features/auth/authSlice.js'

const makeStore = () => {
    localStorage.setItem('Strive:user', JSON.stringify({ _id: 'u1', token: 'abc' }))
    return configureStore({
        reducer: { auth: authReducer },
        preloadedState: { auth: { user: { _id: 'u1', token: 'abc' }, isError: false, isSuccess: false, isLoading: false, message: '' } }
    })
}

beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
})

describe('getMe thunk', () => {
    test('a real 401 response logs the user out', async () => {
        authService.getMe.mockRejectedValue({ response: { status: 401, data: { message: 'Not authorised' } } })
        const store = makeStore()

        await store.dispatch(getMe())

        expect(store.getState().auth.user).toBeNull()
        expect(localStorage.getItem('Strive:user')).toBeNull()
    })

    test('a network failure keeps the user logged in', async () => {
        authService.getMe.mockRejectedValue(new Error('Network Error'))
        const store = makeStore()

        await store.dispatch(getMe())

        expect(store.getState().auth.user).not.toBeNull()
        expect(store.getState().auth.isLoading).toBe(false)
    })

    test('a server error keeps the user logged in', async () => {
        authService.getMe.mockRejectedValue({ response: { status: 500, data: { message: 'Oops' } } })
        const store = makeStore()

        await store.dispatch(getMe())

        expect(store.getState().auth.user).not.toBeNull()
    })
})
