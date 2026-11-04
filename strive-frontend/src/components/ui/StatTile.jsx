// StatTile.jsx

import { cx } from '../../utils/cx.js'

const StatTile = ({ value, label, className }) => (
    <div className={cx('rounded-xl bg-bg/60 p-3 text-center', className)}>
        <p className="text-xl font-bold text-accent-fg sm:text-2xl">{value}</p>
        <p className="text-xs text-muted sm:text-sm">{label}</p>
    </div>
)

export default StatTile
