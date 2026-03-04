// SetItem.jsx

// Imports
import { motion } from 'framer-motion'
import { formatWeight } from '../../utils/weightUnits.js'

const SetItem = ({ set, local, useImperial = false }) => {

    return (
        <>
            <motion.li 
                initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} 
                className='relative bg-[#2B2D42] text-[#EDF2F4] border border-[#EDF2F4]/30 rounded-full px-3 py-1 text-sm shadow-sm'
            >
                <span className="text-[#EF233C] font-semibold">
                    {formatWeight(set.weight, useImperial)}
                </span>{' '}
                × {set.reps} reps
            </motion.li>
        </>
    )
}

export default SetItem
