// StatRow.jsx
// One statistic with how it compares to the previous period

import { FaArrowUp, FaArrowDown, FaMinus } from 'react-icons/fa'

const percentageChange = (current, previous) => {
    if (previous === 0) return current === 0 ? '0%' : 'New'

    const change = Math.min(999, Math.round(((current - previous) / previous) * 100))
    return change > 0 ? `+${change}%` : `${change}%`
}

const Comparison = ({ current, previous }) => {
    const text = percentageChange(current, previous)

    if (current > previous) {
        return <span className="ml-2 flex items-center text-sm text-success">{text}<FaArrowUp aria-label="up" className="ml-1" /></span>
    }
    if (current < previous) {
        return <span className="ml-2 flex items-center text-sm text-accent-fg">{text}<FaArrowDown aria-label="down" className="ml-1" /></span>
    }
    return <span className="ml-2 flex items-center text-sm text-muted">{text}<FaMinus aria-label="no change" className="ml-1" /></span>
}

const StatRow = ({ label, value, current, previous, showComparison = true }) => (
    <div className="flex items-center justify-between border-b border-line/60 py-1.5">
        <dt className="text-fg">{label}</dt>
        <dd className="flex items-center font-bold text-fg">
            {value}
            {showComparison && <Comparison current={current} previous={previous} />}
        </dd>
    </div>
)

export default StatRow
