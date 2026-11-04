// Dialog.jsx
// Accessible modal built on the native <dialog> element: focus is trapped, Escape closes it
// and the page behind is inert while it is open.

import { useEffect, useRef, useId } from 'react'
import { cx } from '../../utils/cx.js'

const Dialog = ({ open, onClose, title, description, children, className }) => {
    const ref = useRef(null)
    const titleId = useId()
    const descriptionId = useId()

    useEffect(() => {
        const dialog = ref.current
        if (!dialog) return

        if (open && !dialog.open) {
            // jsdom and very old browsers lack showModal; fall back to the open attribute
            if (typeof dialog.showModal === 'function') dialog.showModal()
            else dialog.setAttribute('open', '')
        }
        if (!open && dialog.open) {
            if (typeof dialog.close === 'function') dialog.close()
            else dialog.removeAttribute('open')
        }
    }, [open])

    return (
        <dialog
            ref={ref}
            aria-labelledby={titleId}
            aria-describedby={description ? descriptionId : undefined}
            onCancel={(event) => {
                event.preventDefault()
                onClose?.()
            }}
            onClick={(event) => {
                // Clicking the backdrop (the dialog element itself) closes it
                if (event.target === ref.current) onClose?.()
            }}
            className={cx(
                'm-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-line bg-surface p-0 text-fg shadow-card',
                'backdrop:bg-black/60 backdrop:backdrop-blur-sm',
                className
            )}
        >
            {open && (
                <div className="flex flex-col gap-4 p-5 sm:p-6">
                    <div>
                        <h2 id={titleId} className="font-display text-2xl font-bold">{title}</h2>
                        {description && <p id={descriptionId} className="mt-1 text-muted">{description}</p>}
                    </div>
                    {children}
                </div>
            )}
        </dialog>
    )
}

export default Dialog
