// StatRow.jsx

// Imports
import { FaArrowUp, FaArrowDown, FaMinus } from 'react-icons/fa'

const StatRow = ({ label, value, current, previous }) => {  
    const ComparisonArrow = ({ current, previous }) => {
        if (current > previous) {
            return (
                <FaArrowUp className="text-green-400 text-sm ml-2" />
            )
        }

        if (current < previous) {
            return (
                <FaArrowDown className="text-red-400 text-sm ml-2" />
            )
        }

        return (
            <FaMinus className="text-[#EDF2F4]/50 text-sm ml-2" />
        )
    }

    return (
        <p className="flex justify-between items-center border-b border-[#EDF2F4]/40">
            <span>{label}</span>

            <span className="flex items-center text-[#EF233C] font-bold">
                {value}

                <ComparisonArrow
                    current={current}
                    previous={previous}
                />
            </span>
        </p>
    )
}

export default StatRow;