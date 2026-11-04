// ConfirmProvider.jsx
// Promise-based confirmation and notice dialogs:
//   const confirm = useConfirm()  (from ./confirmContext.js)
//   if (await confirm({ title: 'Delete?', tone: 'danger' })) { ... }
// With askPassword it resolves to the password that was typed (or false if cancelled).

import { useState, useCallback, useRef } from 'react'
import { ConfirmContext } from './confirmContext.js'
import Dialog from './Dialog.jsx'
import Button from './Button.jsx'
import Input from './Input.jsx'

export const ConfirmProvider = ({ children }) => {
    const [request, setRequest] = useState(null)
    const [typed, setTyped] = useState('')
    const [password, setPassword] = useState('')
    const resolver = useRef(null)

    const confirm = useCallback((options) => new Promise((resolve) => {
        resolver.current = resolve
        setTyped('')
        setPassword('')
        setRequest(options)
    }), [])

    const settle = (result) => {
        resolver.current?.(result)
        resolver.current = null
        setRequest(null)
    }

    const needsText = Boolean(request?.requireText)
    const needsPassword = Boolean(request?.askPassword)
    const canConfirm = (!needsText || typed === request.requireText) && (!needsPassword || password.length > 0)

    return (
        <ConfirmContext.Provider value={confirm}>
            {children}
            <Dialog
                open={Boolean(request)}
                onClose={() => settle(false)}
                title={request?.title}
                description={request?.message}
            >
                {needsPassword && (
                    <Input
                        label="Your password"
                        type="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                    />
                )}
                {needsText && (
                    <Input
                        label={`Type ${request.requireText} to confirm`}
                        value={typed}
                        onChange={(event) => setTyped(event.target.value)}
                        autoComplete="off"
                        autoCapitalize="characters"
                    />
                )}
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    {!request?.hideCancel && (
                        <Button variant="secondary" onClick={() => settle(false)}>
                            {request?.cancelLabel || 'Cancel'}
                        </Button>
                    )}
                    <Button
                        disabled={!canConfirm}
                        onClick={() => settle(needsPassword ? password : true)}
                    >
                        {request?.confirmLabel || 'Confirm'}
                    </Button>
                </div>
            </Dialog>
        </ConfirmContext.Provider>
    )
}
