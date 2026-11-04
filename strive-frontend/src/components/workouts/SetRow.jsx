// SetRow.jsx
// One logged set. Shows edit and delete controls when handlers are given.

import { FaPen, FaTrash } from 'react-icons/fa'
import { formatSet } from '../../utils/trackingModes.js'
import { cx } from '../../utils/cx.js'

const IconButton = ({ label, onClick, danger, children }) => (
    <button
        type="button"
        aria-label={label}
        onClick={onClick}
        className={cx(
            'flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-line/60',
            danger ? 'hover:text-accent-fg' : 'hover:text-fg'
        )}
    >
        {children}
    </button>
)

const SetRow = ({ set, number, trackingMode, useImperial, active, onEdit, onDelete }) => (
    <li
        className={cx(
            'flex items-center justify-between gap-2 rounded-xl bg-bg/60 py-1.5 pl-3 pr-1.5',
            active && 'ring-2 ring-accent-fg/60'
        )}
    >
        <span className="text-sm text-muted">Set {number}</span>
        <span className="flex-1 text-right font-semibold text-fg">{formatSet(trackingMode, set, useImperial)}</span>
        {(onEdit || onDelete) && (
            <span className="flex">
                {onEdit && <IconButton label={`Edit set ${number}`} onClick={onEdit}><FaPen aria-hidden="true" /></IconButton>}
                {onDelete && <IconButton label={`Delete set ${number}`} onClick={onDelete} danger><FaTrash aria-hidden="true" /></IconButton>}
            </span>
        )}
    </li>
)

export default SetRow
