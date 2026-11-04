import { describe, test, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfirmProvider } from '../components/ui/ConfirmProvider.jsx'
import { useConfirm } from '../components/ui/confirmContext.js'

afterEach(cleanup)

const Harness = ({ options, onResult }) => {
    const confirm = useConfirm()
    return <button onClick={async () => onResult(await confirm(options))}>Open</button>
}

const setup = (options) => {
    const results = []
    render(
        <ConfirmProvider>
            <Harness options={options} onResult={(r) => results.push(r)} />
        </ConfirmProvider>
    )
    return results
}

describe('confirm dialogs', () => {
    test('resolves true when confirmed', async () => {
        const user = userEvent.setup()
        const results = setup({ title: 'Delete?', confirmLabel: 'Delete' })

        await user.click(screen.getByText('Open'))
        expect(await screen.findByText('Delete?')).toBeTruthy()
        await user.click(screen.getByRole('button', { name: 'Delete' }))

        expect(results).toEqual([true])
    })

    test('resolves false when cancelled', async () => {
        const user = userEvent.setup()
        const results = setup({ title: 'Delete?', cancelLabel: 'Keep it' })

        await user.click(screen.getByText('Open'))
        await user.click(await screen.findByRole('button', { name: 'Keep it' }))

        expect(results).toEqual([false])
    })

    test('typed confirmation keeps the button disabled until the text matches', async () => {
        const user = userEvent.setup()
        const results = setup({ title: 'Delete account?', confirmLabel: 'Delete account', requireText: 'DELETE' })

        await user.click(screen.getByText('Open'))
        const confirmButton = await screen.findByRole('button', { name: 'Delete account' })
        expect(confirmButton.disabled).toBe(true)

        await user.type(screen.getByLabelText(/type delete to confirm/i), 'DELET')
        expect(confirmButton.disabled).toBe(true)

        await user.type(screen.getByLabelText(/type delete to confirm/i), 'E')
        expect(confirmButton.disabled).toBe(false)

        await user.click(confirmButton)
        expect(results).toEqual([true])
    })

    test('notices have no cancel button', async () => {
        const user = userEvent.setup()
        setup({ title: 'Heads up', confirmLabel: 'Got it', hideCancel: true })

        await user.click(screen.getByText('Open'))
        await screen.findByText('Heads up')

        expect(screen.queryByRole('button', { name: 'Cancel' })).toBeNull()
    })
})
