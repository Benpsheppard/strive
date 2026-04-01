// MonthCalendar.jsx

// Imports
import { useState } from 'react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'

const MonthCalendar = ({ workouts }) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const [currentDate, setCurrentDate] = useState(new Date())

    const getMonthData = () => {
        const year = currentDate.getFullYear()
        const month = currentDate.getMonth()

        // First and last day of month
        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)

        // What day of week does the month start on (adjust for Mon start)
        let startDayIndex = firstDay.getDay() - 1
        if (startDayIndex === -1) startDayIndex = 6

        // Build array of cells (nulls for empty slots + actual dates)
        const cells = []
        for (let i = 0; i < startDayIndex; i++) cells.push(null)
        for (let d = 1; d <= lastDay.getDate(); d++) {
            cells.push(new Date(year, month, d))
        }

        return cells
    }

    const hasWorkout = (date) => {
        if (!date) return false
        return workouts.some((workout) => {
            const workoutDate = new Date(workout.createdAt)
            return (
                workoutDate.getDate() === date.getDate() &&
                workoutDate.getMonth() === date.getMonth() &&
                workoutDate.getFullYear() === date.getFullYear()
            )
        })
    }

    const getWorkoutTitle = (date) => {
        if (!date) return null
        const workout = workouts.find((w) => {
            const workoutDate = new Date(w.createdAt)
            return (
                workoutDate.getDate() === date.getDate() &&
                workoutDate.getMonth() === date.getMonth() &&
                workoutDate.getFullYear() === date.getFullYear()
            )
        })
        return workout ? workout.title : null
    }

    const today = new Date()
    const cells = getMonthData()

    const monthName = currentDate.toLocaleString('default', { month: 'long' })
    const year = currentDate.getFullYear()

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    }

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    }

    // Don't allow navigating to future months
    const isCurrentMonth = currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear()

    return (
        <div className="card-theme w-full h-full bg-[#8D99AE] flex flex-col shadow rounded-2xl px-6 py-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <button onClick={prevMonth} className="text-[#EDF2F4] hover:text-[#EF233C] transition text-xl px-2">
                    <FaChevronLeft />
                </button>

                <p className="text-[#EDF2F4] font-semibold text-lg">
                    {monthName} <span className="text-[#EF233C]">{year}</span>
                </p>

                <button onClick={nextMonth} disabled={isCurrentMonth} className={`text-xl px-2 transition ${isCurrentMonth ? 'text-[#EDF2F4] opacity-20 cursor-not-allowed' : 'text-[#EDF2F4] hover:text-[#EF233C]'}`}>
                    <FaChevronRight />
                </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-2">
                {days.map((day) => (
                    <div key={day} className="text-center text-xs text-[#EDF2F4] opacity-60 font-semibold py-1">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1 flex-1 auto-rows-fr">
                {cells.map((date, index) => {
                    if (!date) return <div key={index} />

                    const trained = hasWorkout(date)
                    const isToday = date.toDateString() === today.toDateString()
                    const isFuture = date > today && !isToday
                    const title = getWorkoutTitle(date)

                    return (
                        <div
                            key={index}
                            title={title || ''}
                            className={`relative flex flex-col items-center justify-center rounded-xl py-2 text-center transition
                                ${isToday ? 'border-2 border-[#EDF2F4]' : ''}
                                ${trained ? 'bg-[#EF233C] cursor-pointer hover:bg-[#D90429]' : ''}
                                ${isToday && !trained ? 'border-2 border-[#EDF2F4]' : ''}
                                ${isFuture ? 'opacity-20' : ''}
                                ${!trained && !isToday && !isFuture ? 'bg-[#2B2D42]/40 hover:bg-[#2B2D42]/60' : ''}
                            `}
                        >
                            <span className={`text-sm font-bold ${trained || isToday ? 'text-[#EDF2F4]' : 'text-[#EDF2F4] opacity-60'}`}>
                                {date.getDate()}
                            </span>
                            {trained && (
                                <span className="text-xs text-[#EDF2F4] opacity-80 truncate w-full px-1 hidden sm:block">
                                    {title}
                                </span>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Legend */}
            <div className="flex gap-4 justify-center mt-4">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#EF233C]" />
                    <span className="text-xs text-[#EDF2F4] opacity-60">Trained</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full border-2 border-[#EDF2F4]" />
                    <span className="text-xs text-[#EDF2F4] opacity-60">Today</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#2B2D42]/40" />
                    <span className="text-xs text-[#EDF2F4] opacity-60">Rest day</span>
                </div>
            </div>
        </div>
    )
}

export default MonthCalendar