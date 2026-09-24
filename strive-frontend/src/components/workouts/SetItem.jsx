// SetItem.jsx

// Imports
import { motion } from 'framer-motion'
import { formatWeight, formatDistance } from '../../utils/formatValues.js'

const SetItem = ({ set, setNumber, trackingMode, useImperial = false }) => {
    const SET_ITEM_STYLING = 'text-[#2B2D42] bg-[#EDF2F4]/30 rounded-xl flex justify-between p-2 w-full'

    return (
        <>
            {trackingMode === 'weight_reps' && (
                <motion.li initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className={SET_ITEM_STYLING}> 
                    <p className="">
                        Set {setNumber}
                    </p>
                    <p className="text-[#EF233C] font-semibold">
                        {formatWeight(set.weight, useImperial)}
                        <span className="text-[#2B2D42]"> x {' '}</span>
                        <span className="text-[#EDF2F4]">{set.reps} reps</span>
                    </p>
                </motion.li>
            )}

            {trackingMode === 'bodyweight_reps' && (
                <motion.li initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className={SET_ITEM_STYLING}>
                    <p className="">
                        Set {setNumber}
                    </p>
                    <p>
                        {set.reps} reps
                    </p>
                </motion.li>
            )}

            {trackingMode === 'assisted_reps' && (
                <motion.li initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className={SET_ITEM_STYLING}>
                    <p className="">
                        Set {setNumber}
                    </p>
                    <p className="text-[#EF233C] font-semibold">
                        {formatWeight(set.weight, useImperial)}
                        <span className="text-[#2B2D42]"> x {' '}</span>
                        <span className="text-[#EDF2F4]">{set.reps} reps</span>
                    </p>
                </motion.li>
            )}

            {trackingMode === 'reps' && (
                <motion.li initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className={SET_ITEM_STYLING}>
                    {set.reps} reps
                </motion.li>
            )}

            {trackingMode === 'duration' && (
                <motion.li initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className={SET_ITEM_STYLING}>
                    {set.duration} mins
                </motion.li>
            )}

            {trackingMode === 'distance' && (
                <motion.li initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className={SET_ITEM_STYLING}>
                    {formatDistance(set.distance, useImperial)}
                </motion.li>
            )}

            {trackingMode === 'distance_duration' && (
                <motion.li initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className={SET_ITEM_STYLING}>
                    <span className="text-[#EF233C] font-semibold">
                        {formatDistance(set.distance, useImperial)}
                    </span>{' '}
                    in {set.duration} mins
                </motion.li>
            )}

            {trackingMode === 'distance_weight' && (
                <motion.li initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className={SET_ITEM_STYLING}>
                    <span className="text-[#EF233C] font-semibold">
                        {formatDistance(set.distance, useImperial)}
                    </span>{' '}
                    with {formatWeight(set.weight, useImperial)}
                </motion.li>
            )}

            {trackingMode === 'other' && (
                <motion.li initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className={SET_ITEM_STYLING}>
                    {set}
                </motion.li>
            )}
        </>
    )
}

export default SetItem
