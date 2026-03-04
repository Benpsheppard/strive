// SetList.jsx

// Imports
import { AnimatePresence } from 'framer-motion'

// Function / Component Imports
import SetItem from './SetItem.jsx'

const SetList = ({ sets, useImperial = false }) => {
    if (!sets || sets.length === 0) {
        return null
    }

    return (
        <AnimatePresence>
            <ul className="flex flex-wrap justify-center gap-2 mb-2">
                {sets.map((s, i) => (
                    <SetItem key={i} set={s} useImperial={useImperial} />
                ))}
            </ul>
        </AnimatePresence>
    )
}

// Export
export default SetList