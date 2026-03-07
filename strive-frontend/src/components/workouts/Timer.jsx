// Timer.jsx

// Imports
import { useState, useEffect } from 'react'
import { FaClock, FaCog } from 'react-icons/fa'
import { formatElapsed } from '../../utils/formatValues'
import { useLocalStorage } from '../../hooks/useLocalStorage.js'


const REST_TIMER_OPTIONS = [
    { label: 'Off', value: 0 },
    { label: '30s', value: 30 },
    { label: '1 min', value: 60 },
    { label: '1m 30s', value: 90 },
    { label: '2 mins', value: 120 },
    { label: '3 mins', value: 180 },
]

const Timer = ({ started, startTime, restTimerDuration, setRestTimerDuration }) => {

    const [elapsedTime, setElapsedTime] = useState(0)
    const [showRestSettings, setShowRestSettings] = useState(false)

    // Timer
    useEffect(() => {
        if (!started || !startTime) return

        const interval = setInterval(() => {
            setElapsedTime(Math.floor((Date.now() - startTime) / 1000))
        }, 1000)

        return () => clearInterval(interval)
    }, [started, startTime])

    return (
        <div className="w-full sm:max-w-2xl mx-auto bg-[#8D99AE] shadow rounded-2xl m-3 px-6 py-4 flex flex-wrap justify-between items-center gap-y-3">
            {/* Workout Timer */}
            <div className="flex items-center gap-2 text-[#EF233C] font-bold text-lg">
                <FaClock />
                <span>{formatElapsed(elapsedTime)}</span>
            </div>

            {/* Rest Timer Toggle */}
            <button onClick={() => setShowRestSettings(!showRestSettings)} className="flex items-center gap-2 bg-[#2B2D42] text-[#EDF2F4] px-3 py-1 rounded-full text-sm hover:bg-[#EF233C]/40 transition">
                <FaCog /> Rest: <span className="text-[#EF233C] font-semibold">{restTimerDuration === 0 ? 'Off' : `${restTimerDuration}s`}</span>
            </button>

            {/* Rest Settings - full width forces it below */}
            {showRestSettings && (
                <div className="w-full pt-3 shadow-lg rounded-lg">
                    <p className="text-[#EDF2F4] text-sm font-semibold text-center mb-2">Rest Timer</p>
                    <div className="flex flex-wrap gap-2 w-full justify-center">
                        {REST_TIMER_OPTIONS.map((option) => (
                            <button key={option.value} onClick={() => setRestTimerDuration(option.value)} className={`px-3 py-1 rounded-lg text-sm transition hover:text-[#EF233C] ${restTimerDuration === option.value ? 'text-[#EF233C]' : 'text-[#EDF2F4]'}`}>
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default Timer