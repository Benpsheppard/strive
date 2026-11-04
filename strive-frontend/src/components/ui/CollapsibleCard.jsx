// CollapsibleCard.jsx
// A card whose body can be shown or hidden with a real button (keyboard and screen reader friendly)

import { useState, useId } from 'react'
import { FaChevronDown } from 'react-icons/fa'
import Card from './Card.jsx'
import { cx } from '../../utils/cx.js'

const CollapsibleCard = ({ title, accent, summary, defaultOpen = true, children, className }) => {
    const [open, setOpen] = useState(defaultOpen)
    const panelId = useId()

    return (
        <Card padding="none" className={className}>
            <button
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpen(prev => !prev)}
                className="flex w-full items-center justify-between gap-3 rounded-2xl p-4 text-left sm:p-5"
            >
                <span>
                    <span className="font-display text-2xl font-bold text-fg">
                        {title}
                        {accent && <span className="text-accent-fg"> {accent}</span>}
                    </span>
                    {summary && <span className="mt-0.5 block text-sm text-muted">{summary}</span>}
                </span>
                <FaChevronDown
                    aria-hidden="true"
                    className={cx('shrink-0 text-muted transition-transform duration-200', open && 'rotate-180')}
                />
            </button>

            {open && (
                <div id={panelId} className="px-4 pb-4 sm:px-5 sm:pb-5">
                    {children}
                </div>
            )}
        </Card>
    )
}

export default CollapsibleCard
