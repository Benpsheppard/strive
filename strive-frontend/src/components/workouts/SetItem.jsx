// SetItem.jsx

// Imports
import { motion } from 'framer-motion'
import { formatWeight } from '../../utils/formatValues.js'

const SetItem = ({ set, trackingMode, useImperial = false }) => {

    return (
        <>
            {trackingMode === 'weight_reps' && (
                <motion.li initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className='relative bg-[#2B2D42] text-[#EDF2F4] border border-[#EDF2F4]/30 rounded-full px-3 py-1 text-sm shadow-sm' >
                    <span className="text-[#EF233C] font-semibold">
                        {formatWeight(set.weight, useImperial)}
                    </span>{' '}
                    × {set.reps} reps
                </motion.li>
            )}

            {trackingMode === 'bodyweight_reps' && (
                <motion.li initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className='relative bg-[#2B2D42] text-[#EDF2F4] border border-[#EDF2F4]/30 rounded-full px-3 py-1 text-sm shadow-sm' >
                    {set.reps} reps
                </motion.li>
            )}

            {trackingMode === 'assisted_reps' && (
                <motion.li initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className='relative bg-[#2B2D42] text-[#EDF2F4] border border-[#EDF2F4]/30 rounded-full px-3 py-1 text-sm shadow-sm' >
                    <span className="text-[#EF233C] font-semibold">
                        {formatWeight(set.weight, useImperial)}
                    </span>{' '}
                    × {set.reps} reps
                </motion.li>
            )}

            {trackingMode === 'reps' && (
                <motion.li initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className='relative bg-[#2B2D42] text-[#EDF2F4] border border-[#EDF2F4]/30 rounded-full px-3 py-1 text-sm shadow-sm' >
                    {set.reps} reps
                </motion.li>
            )}

            {trackingMode === 'duration' && (
                <motion.li initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className='relative bg-[#2B2D42] text-[#EDF2F4] border border-[#EDF2F4]/30 rounded-full px-3 py-1 text-sm shadow-sm' >
                    {set.duration} mins
                </motion.li>
            )}

            {trackingMode === 'distance' && (
                <motion.li initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className='relative bg-[#2B2D42] text-[#EDF2F4] border border-[#EDF2F4]/30 rounded-full px-3 py-1 text-sm shadow-sm' >
                    {set.distance} km
                </motion.li>
            )}

            {trackingMode === 'distance_duration' && (
                <motion.li initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className='relative bg-[#2B2D42] text-[#EDF2F4] border border-[#EDF2F4]/30 rounded-full px-3 py-1 text-sm shadow-sm' >
                    <span className="text-[#EF233C] font-semibold">
                        {set.distance} km
                    </span>{' '}
                    in {set.duration} mins
                </motion.li>
            )}

            {trackingMode === 'distance_weight' && (
                <motion.li initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className='relative bg-[#2B2D42] text-[#EDF2F4] border border-[#EDF2F4]/30 rounded-full px-3 py-1 text-sm shadow-sm' >
                    <span className="text-[#EF233C] font-semibold">
                        {set.distance} km
                    </span>{' '}
                    with {formatWeight(set.weight, useImperial)}
                </motion.li>
            )}

            {trackingMode === 'other' && (
                <motion.li initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className='relative bg-[#2B2D42] text-[#EDF2F4] border border-[#EDF2F4]/30 rounded-full px-3 py-1 text-sm shadow-sm' >
                    {set}
                </motion.li>
            )}
        </>
    )
}

export default SetItem
