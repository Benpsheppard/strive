// SetItem.jsx

// Imports
import { motion } from 'framer-motion'
import { formatWeight } from '../../utils/formatValues.js'

const SetItem = ({ set, setNumber, trackingMode, useImperial = false }) => {
    const SET_ITEM_STYLING = 'text-[#2B2D42] bg-[#EDF2F4]/30 rounded-xl flex justify-between p-2 w-full'
    const MotionListItem = motion.li

    if (trackingMode !== 'weight_reps') {
        return (
            <MotionListItem
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`${SET_ITEM_STYLING} text-[#EF233C]`}
                role="alert"
            >
                Tracking mode is not supported
            </MotionListItem>
        )
    }

    return (
        <MotionListItem
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={SET_ITEM_STYLING}
        >
            <p>Set {setNumber}</p>
            <p className="text-[#EF233C] font-semibold">
                {formatWeight(set.weight, useImperial)}
                <span className="text-[#2B2D42]"> x {' '}</span>
                <span className="text-[#EDF2F4]">{set.reps} reps</span>
            </p>
        </MotionListItem>
    )
}

export default SetItem
