// Calendar.jsx

// Imports
import { FaFire } from 'react-icons/fa'

const Calendar = ({ workouts }) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    
    const getStartOfWeek = () => {
        const now = new Date()
        const day = now.getDay()
        const diff = day === 0 ? -6 : 1 - day
        const monday = new Date(now)

        monday.setDate(now.getDate() + diff)
        monday.setHours(0, 0, 0, 0)

        return monday
    }

    const startOfWeek = getStartOfWeek()

    const weekDates = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(startOfWeek)
        date.setDate(startOfWeek.getDate() + i)
        return date
    })

    const hasWorkout = (date) => {
        return workouts.some((workout) => {
            const workoutDate = new Date(workout.createdAt)
            return (
                workoutDate.getDate() === date.getDate() &&
                workoutDate.getMonth() === date.getMonth() &&
                workoutDate.getFullYear() === date.getFullYear()
            )
        })
    }

    const today = new Date()

    return (
        <div className="w-full mx-auto bg-[#8D99AE] shadow rounded-2xl p-4">
            <p className="text-xl text-[#EDF2F4] font-semibold text-center mb-3">
                This <span className="text-[#EF233C]">Week</span>
            </p>
            <div className="flex justify-between items-center">
                {weekDates.map((date, index) => {
                    const trained = hasWorkout(date)
                    const isToday = date.toDateString() === today.toDateString()

                    return (
                        <div key={index} className="flex flex-col items-center gap-1">
                            <span className="text-xs text-[#EDF2F4] opacity-70">{days[index]}</span>

                            <div className="relative w-10 h-10 md:w-16 md:h-16 flex items-center justify-center">
                                {trained ? (
                                    <>
                                        <FaFire className="absolute text-[#EF233C] text-5xl md:text-6xl" />
                                        <span className="text-xl relative font-bold text-[#EDF2F4]">
                                            {date.getDate()}
                                        </span>
                                    </>
                                ) : (
                                    <div className={`w-10 h-10 md:w-16 md:h-16 rounded-full flex items-center justify-center text-xl font-bold
                                        ${isToday ? 'border-2 border-[#EF233C] text-[#EDF2F4]' : 'bg-[#2B2D42]/40 text-[#EDF2F4] opacity-50'}
                                    `}>
                                        {date.getDate()}
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default Calendar