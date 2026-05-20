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

// Animation Variants
const variants = {
    enter: (dir) => ({
        x: dir * 40,
        opacity: 0
    }),
    center: {
        x: 0,
        opacity: 1
    },
    exit: (dir) => ({
        x: -dir * 40,
        opacity: 0
    })
}

const Leaderboard = () => {
    const { leaderboard } = useSelector((state) => state.leaderboard)

    const [metricIndex, setMetricIndex] = useState(0)
    const [direction, setDirection] = useState(1)

    const currentMetric = metrics[metricIndex]

    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(getLeaderboard(currentMetric.key))
    }, [dispatch, currentMetric])

    const handleNext = () => {
        setDirection(1)
        setMetricIndex((prev) => (prev + 1) % metrics.length)
    }

    const handlePrev = () => {
        setDirection(-1)
        setMetricIndex((prev) => (prev - 1 + metrics.length) % metrics.length)
    }

    return (
        <div className="bg-[#8D99AE] text-[#EDF2F4] flex flex-col text-center rounded-2xl px-6 py-5">
            <h2 className='font-bold text-3xl mb-5'>
                Weekly 
                <span className='text-[#EF233C]'> Leaderboard</span>
            </h2>
            <div className='font-bold text-2xl flex flex-row justify-between items-center mb-5 rounded-2xl shadow p-2'>
                <div onClick={handlePrev} className='text-[#EDF2F4]/40 text-lg hover:text-[#EDF2F4]'>
                    <FaChevronLeft />
                </div>
                <h2>
                    {currentMetric.label} SP {' '}
                </h2>
                <div onClick={handleNext} className='text-[#EDF2F4]/40 text-lg hover:text-[#EDF2F4]'>
                    <FaChevronRight />
                </div>
            </div>

            <div className="rounded-2xl shadow p-2">
                <AnimatePresence mode='wait' custom={direction} >
                    <motion.div className="space-y-3" key={currentMetric.key} custom={direction} variants={variants} initial='enter' animate='center' exit='exit' transition={{ duration: '0.25' }} >
                    {leaderboard.map((entry, index) => (
                        <div key={entry._id} className='flex flex-row justify-between items-center bg-[#2B2D42] rounded-xl p-2 text-xl'>
                            <span>#{index + 1}</span>
                            <span>{entry.user.username || 'Unknown'}</span>
                            <span>{entry[currentMetric.key] || 0}SP</span>
                        </div>
                    ))}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    )
}

export default Leaderboard