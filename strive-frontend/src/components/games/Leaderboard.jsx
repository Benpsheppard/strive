// Leaderboard.jsx

// Imports
import { useDispatch, useSelector } from "react-redux"
import { useState, useEffect } from 'react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'

// Function Imports
import { getLeaderboard } from '../../features/leaderboard/leaderboardSlice' 

// Metrics
const metrics = [
    { key: "totalSP", label: "Total" },
    { key: "totalVolumeSP", label: "Volume" },
    { key: "totalStrengthSP", label: "Strength" },
    { key: "totalProgressionSP", label: "Progression" }
]

const Leaderboard = () => {
    const { leaderboard } = useSelector((state) => state.leaderboard)

    const [metricIndex, setMetricIndex] = useState(0)
    const currentMetric = metrics[metricIndex]

    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(getLeaderboard(currentMetric.key))
    }, [dispatch, currentMetric])

    const handleNext = () => {
        setMetricIndex((prev) => (prev + 1) % metrics.length)
    }

    const handlePrev = () => {
        setMetricIndex((prev) => (prev - 1 + metrics.length) % metrics.length)
    }

    return (
        <div className="bg-[#8D99AE] text-[#EDF2F4] flex flex-col text-center rounded-2xl px-6 py-5">
            <div className='font-bold text-2xl flex flex-row justify-between mb-5'>
                <div onClick={handlePrev} className='text-[#EDF2F4]/40 hover:text-[#EDF2F4]'>
                    <FaChevronLeft />
                </div>
                <h2>
                    {currentMetric.label} SP {' '}
                    <span className='text-[#EF233C]'>LeaderBoard</span>
                </h2>
                <div onClick={handleNext} className='text-[#EDF2F4]/40 hover:text-[#EDF2F4]'>
                    <FaChevronRight />
                </div>
            </div>

            <h2 className='font-bold text-xl'>
                
            </h2>

            <AnimatePresence mode='wait'>
                <motion.div key={currentMetric.key} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.25 }} >
                {leaderboard.map((entry, index) => (
                    <div key={entry._id} className='flex flex-row justify-between items-center border-b border-[#EDF2F4]/40'>
                        <span>#{index + 1}</span>
                        <span>{entry.user.username || 'Unknown'}</span>
                        <span>{entry[currentMetric.key] || 0}SP</span>
                    </div>
                ))}
                </motion.div>
            </AnimatePresence>
        </div>
    )
}

export default Leaderboard