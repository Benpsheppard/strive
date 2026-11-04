import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'

vi.mock('../features/auth/authService.js', () => ({
    default: {
        forgotPassword: vi.fn(),
        resetPassword: vi.fn(),
        verifyEmail: vi.fn(),
        resendVerification: vi.fn(),
        getMe: vi.fn(),
        changePassword: vi.fn()
    }
}))
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

import authService from '../features/auth/authService.js'
import authReducer, { getMe, changePassword } from '../features/auth/authSlice.js'
import CredentialsForm from '../components/auth/CredentialsForm.jsx'
import ForgotPassword from '../pages/ForgotPassword.jsx'
import ResetPassword from '../pages/ResetPassword.jsx'
import VerifyEmail from '../pages/VerifyEmail.jsx'
import EmailBanner from '../components/layout/EmailBanner.jsx'
import { ConfirmProvider } from '../components/ui/ConfirmProvider.jsx'
import { useConfirm } from '../components/ui/confirmContext.js'

beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    sessionStorage.clear()
})
afterEach(cleanup)

const storeWith = (user) => configureStore({
    reducer: { auth: (state = { user }) => state }
})

const renderPage = (element, { path = '/', user = null } = {}) => render(
    <Provider store={storeWith(user)}>
        <MemoryRouter initialEntries={[path]}>
            <Routes>
                <Route path="/" element={element} />
                <Route path="/forgot-password" element={element} />
                <Route path="/reset-password" element={element} />
                <Route path="/verify-email" element={element} />
                <Route path="/login" element={<p>Login page</p>} />
            </Routes>
        </MemoryRouter>
    </Provider>
)

const strong = 'Passw0rd!long'

describe('sign-up consent', () => {
    const fill = async (user) => {
        await user.type(screen.getByLabelText('Email'), 'ben@example.com')
        await user.type(screen.getByLabelText('Username'), 'ben')
        await user.type(screen.getByLabelText('Password', { exact: true }), strong)
        await user.type(screen.getByLabelText('Confirm password'), strong)
    }

    test('cannot submit until the terms are accepted', async () => {
        const user = userEvent.setup()
        const onSubmit = vi.fn()
        renderPage(<CredentialsForm submitLabel="Create account" onSubmit={onSubmit} />)

        await fill(user)
        await user.click(screen.getByRole('button', { name: 'Create account' }))

        expect(onSubmit).not.toHaveBeenCalled()
        expect(screen.getByRole('alert').textContent).toMatch(/accept the terms and privacy policy/)
    })

    test('submits with consent recorded once ticked, with links to both documents', async () => {
        const user = userEvent.setup()
        const onSubmit = vi.fn()
        renderPage(<CredentialsForm submitLabel="Create account" onSubmit={onSubmit} />)

        await fill(user)
        await user.click(screen.getByRole('checkbox', { name: /I agree to the/ }))
        await user.click(screen.getByRole('button', { name: 'Create account' }))

        expect(onSubmit).toHaveBeenCalledWith({ username: 'ben', email: 'ben@example.com', password: strong, acceptedTerms: true })
        expect(screen.getByRole('link', { name: 'terms of use' }).getAttribute('href')).toBe('/terms')
        expect(screen.getByRole('link', { name: 'privacy policy' }).getAttribute('href')).toBe('/privacy')
    })
})

describe('forgot password page', () => {
    test('shows the same confirmation after sending', async () => {
        authService.forgotPassword.mockResolvedValue({ message: 'ok' })
        const user = userEvent.setup()
        renderPage(<ForgotPassword />, { path: '/forgot-password' })

        await user.type(screen.getByLabelText('Email'), 'ben@example.com')
        await user.click(screen.getByRole('button', { name: 'Send reset link' }))

        expect(await screen.findByRole('status')).toBeTruthy()
        expect(screen.getByText(/a reset link is on its way/)).toBeTruthy()
        expect(authService.forgotPassword).toHaveBeenCalledWith('ben@example.com')
    })

    test('rejects an invalid email without calling the server', async () => {
        const user = userEvent.setup()
        renderPage(<ForgotPassword />, { path: '/forgot-password' })

        await user.type(screen.getByLabelText('Email'), 'nope')
        await user.click(screen.getByRole('button', { name: 'Send reset link' }))

        expect(screen.getByText('Enter a valid email address')).toBeTruthy()
        expect(authService.forgotPassword).not.toHaveBeenCalled()
    })

    test('shows server problems such as rate limiting', async () => {
        authService.forgotPassword.mockRejectedValue({ response: { data: { message: 'Too many reset requests' } } })
        const user = userEvent.setup()
        renderPage(<ForgotPassword />, { path: '/forgot-password' })

        await user.type(screen.getByLabelText('Email'), 'ben@example.com')
        await user.click(screen.getByRole('button', { name: 'Send reset link' }))

        expect(await screen.findByText('Too many reset requests')).toBeTruthy()
    })
})

describe('reset password page', () => {
    test('a link with no token explains the problem and offers a new one', () => {
        renderPage(<ResetPassword />, { path: '/reset-password' })

        expect(screen.getByRole('alert').textContent).toMatch(/invalid or has expired/)
        expect(screen.getByRole('link', { name: 'Get a new link' }).getAttribute('href')).toBe('/forgot-password')
    })

    test('sets the new password, then sends the user to sign in', async () => {
        authService.resetPassword.mockResolvedValue({})
        const user = userEvent.setup()
        renderPage(<ResetPassword />, { path: `/reset-password?token=${'a'.repeat(64)}` })

        await user.type(screen.getByLabelText('New password', { exact: true }), 'Brand-New1!pass')
        await user.type(screen.getByLabelText('Confirm new password'), 'Brand-New1!pass')
        await user.click(screen.getByRole('button', { name: 'Change password' }))

        await waitFor(() => expect(screen.getByText('Login page')).toBeTruthy())
        expect(authService.resetPassword).toHaveBeenCalledWith('a'.repeat(64), 'Brand-New1!pass')
    })

    test('weak or mismatched passwords never reach the server', async () => {
        const user = userEvent.setup()
        renderPage(<ResetPassword />, { path: `/reset-password?token=${'a'.repeat(64)}` })

        await user.type(screen.getByLabelText('New password', { exact: true }), 'weak')
        await user.type(screen.getByLabelText('Confirm new password'), 'different')
        await user.click(screen.getByRole('button', { name: 'Change password' }))

        expect(screen.getByText(/does not meet all the rules/)).toBeTruthy()
        expect(screen.getByText('Passwords do not match')).toBeTruthy()
        expect(authService.resetPassword).not.toHaveBeenCalled()
    })

    test('an expired link from the server is explained', async () => {
        authService.resetPassword.mockRejectedValue({ response: { data: { message: 'This reset link is invalid or has expired' } } })
        const user = userEvent.setup()
        renderPage(<ResetPassword />, { path: `/reset-password?token=${'a'.repeat(64)}` })

        await user.type(screen.getByLabelText('New password', { exact: true }), 'Brand-New1!pass')
        await user.type(screen.getByLabelText('Confirm new password'), 'Brand-New1!pass')
        await user.click(screen.getByRole('button', { name: 'Change password' }))

        expect(await screen.findByRole('alert')).toBeTruthy()
        expect(screen.getByRole('link', { name: 'Get a new link' })).toBeTruthy()
    })
})

describe('verify email page', () => {
    test('confirms the address once', async () => {
        authService.verifyEmail.mockResolvedValue({})
        renderPage(<VerifyEmail />, { path: `/verify-email?token=${'b'.repeat(64)}` })

        expect(await screen.findByRole('heading', { name: /Email confirmed/ })).toBeTruthy()
        expect(authService.verifyEmail).toHaveBeenCalledTimes(1)
        expect(authService.verifyEmail).toHaveBeenCalledWith('b'.repeat(64))
    })

    test('shows why a link did not work', async () => {
        authService.verifyEmail.mockRejectedValue({ response: { data: { message: 'This confirmation link is invalid or has expired' } } })
        renderPage(<VerifyEmail />, { path: `/verify-email?token=${'b'.repeat(64)}` })

        expect(await screen.findByText('We could not confirm that link')).toBeTruthy()
        expect(screen.getByText(/invalid or has expired/)).toBeTruthy()
    })

    test('a link with no token does not call the server', () => {
        renderPage(<VerifyEmail />, { path: '/verify-email' })

        expect(screen.getByText('We could not confirm that link')).toBeTruthy()
        expect(authService.verifyEmail).not.toHaveBeenCalled()
    })
})

describe('email confirmation banner', () => {
    const member = { _id: 'u1', isGuest: false, emailVerified: false, token: 't' }

    test('asks unconfirmed members to confirm and can resend', async () => {
        authService.resendVerification.mockResolvedValue({ message: 'Sent' })
        const user = userEvent.setup()
        renderPage(<EmailBanner />, { user: member })

        expect(screen.getByText('Confirm your email')).toBeTruthy()
        await user.click(screen.getByRole('button', { name: 'Resend email' }))

        expect(authService.resendVerification).toHaveBeenCalledWith('t')
    })

    test('can be dismissed for the session', async () => {
        const user = userEvent.setup()
        renderPage(<EmailBanner />, { user: member })

        await user.click(screen.getByRole('button', { name: 'Not now' }))
        expect(screen.queryByText('Confirm your email')).toBeNull()
    })

    test('not shown to confirmed members, guests or signed-out visitors', () => {
        renderPage(<EmailBanner />, { user: { ...member, emailVerified: true } })
        expect(screen.queryByText('Confirm your email')).toBeNull()
        cleanup()

        renderPage(<EmailBanner />, { user: { ...member, isGuest: true } })
        expect(screen.queryByText('Confirm your email')).toBeNull()
        cleanup()

        renderPage(<EmailBanner />, { user: null })
        expect(screen.queryByText('Confirm your email')).toBeNull()
    })
})

describe('password confirmation dialog', () => {
    const Harness = ({ onResult }) => {
        const confirm = useConfirm()
        return <button onClick={async () => onResult(await confirm({ title: 'Delete?', confirmLabel: 'Delete', askPassword: true }))}>Open</button>
    }

    test('resolves to the typed password and stays disabled until one is typed', async () => {
        const user = userEvent.setup()
        const results = []
        render(<ConfirmProvider><Harness onResult={(r) => results.push(r)} /></ConfirmProvider>)

        await user.click(screen.getByText('Open'))
        const button = await screen.findByRole('button', { name: 'Delete' })
        expect(button.disabled).toBe(true)

        await user.type(screen.getByLabelText('Your password'), 'hunter2')
        expect(button.disabled).toBe(false)
        await user.click(button)

        expect(results).toEqual(['hunter2'])
    })

    test('cancelling resolves to false', async () => {
        const user = userEvent.setup()
        const results = []
        render(<ConfirmProvider><Harness onResult={(r) => results.push(r)} /></ConfirmProvider>)

        await user.click(screen.getByText('Open'))
        await user.click(await screen.findByRole('button', { name: 'Cancel' }))

        expect(results).toEqual([false])
    })
})

describe('auth state keeps the session token', () => {
    const loggedIn = { user: { _id: 'u1', token: 'old-token' }, isError: false, isSuccess: false, isLoading: false, message: '' }

    test('/me does not send a token, but the one in use is kept', () => {
        const state = authReducer(loggedIn, getMe.fulfilled({ _id: 'u1', level: 5, emailVerified: true }, 'req'))

        expect(state.user.token).toBe('old-token')
        expect(state.user.level).toBe(5)
        expect(JSON.parse(localStorage.getItem('Strive:user')).token).toBe('old-token')
    })

    test('changing the password swaps in the new token from the server', () => {
        const state = authReducer(loggedIn, changePassword.fulfilled({ _id: 'u1', token: 'new-token' }, 'req', {}))

        expect(state.user.token).toBe('new-token')
        expect(JSON.parse(localStorage.getItem('Strive:user')).token).toBe('new-token')
    })
})
