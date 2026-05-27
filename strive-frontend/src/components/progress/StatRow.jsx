// StatRow.jsx

// Imports
import { FaArrowUp, FaArrowDown, FaMinus } from 'react-icons/fa'

const StatRow = ({ label, value, current, previous }) => {  

    const Comparison = ({ current, previous }) => {
        const change = calculatePercentageChange(current, previous)

        if (current > previous) {
            return (
                <span className="flex items-center ml-2 text-green-400 text-sm">
                    {change}
                    <FaArrowUp className="ml-1" />
                </span>
            )
        }

        if (current < previous) {
            return (
                <span className="flex items-center ml-2 text-[#EF233C]/80 text-sm">
                    {change}
                    <FaArrowDown className="ml-1" />
                </span>
            )
        }

        return (
            <span className="flex items-center ml-2 text-[#EDF2F4]/50 text-sm">
                {change}
                <FaMinus className="ml-1" />
            </span>
        )
    }

    const calculatePercentageChange = (current, previous) => {
        if (previous === 0) {
            if (current === 0) {
                return '0%'
            }

            return 'New!'
        }

        let change = Math.round(((current - previous) / previous) * 100)

        if (change > 999) {
            change = 999
        }

        if (change > 0) {
            return `+${change}%`
        } else if (change < 0) {
            return `-${change}%`
        } else {
            return `0%`
        }
    }

    return (
        <div className="flex flex-row justify-between items-center border-b border-[#EDF2F4]/40">
            <p>
                {label}
            </p>

            <div className="flex flex-row justify-between items-center text-[#EF233C] font-bold">
                <p>
                    {value}
                </p>
                
                <Comparison
                    current={current}
                    previous={previous}
                />
            </div>
        </div>
    )
}

export default StatRow;