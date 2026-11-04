// MonthCalendar.jsx
// Month view showing which days you trained

import { useState, useMemo } from 'react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import Card from '../ui/Card.jsx'
import { cx } from '../../utils/cx.js'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const dayKey = (date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`

const MonthCalendar = ({ workouts }) => {
    const [currentDate, setCurrentDate] = useState(new Date())
    const today = new Date()

    // Titles of the workouts done on each day
    const titlesByDay = useMemo(() => {
        const map = new Map()
        workouts.forEach((workout) => {
            const key = dayKey(new Date(workout.createdAt))
            map.set(key, [...(map.get(key) || []), workout.title])
        })
        return map
    }, [workouts])

    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const leadingBlanks = (new Date(year, month, 1).getDay() + 6) % 7 // weeks start on Monday

    const cells = [
        ...Array.from({ length: leadingBlanks }, () => null),
        ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1))
    ]

    const isCurrentMonth = month === today.getMonth() && year === today.getFullYear()
    const changeMonth = (delta) => setCurrentDate(new Date(year, month + delta, 1))

    return (
        <Card as="section" aria-label="Training calendar" className="flex h-full flex-col">
            <div className="mb-4 flex items-center justify-between">
                <button type="button" aria-label="Previous month" onClick={() => changeMonth(-1)} className="flex h-10 w-10 items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-fg">
                    <FaChevronLeft aria-hidden="true" />
                </button>

                <h2 className="font-display text-2xl font-bold" aria-live="polite">
                    {currentDate.toLocaleString('default', { month: 'long' })} <span className="text-accent-fg">{year}</span>
                </h2>

                <button type="button" aria-label="Next month" onClick={() => changeMonth(1)} disabled={isCurrentMonth} className="flex h-10 w-10 items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-fg disabled:opacity-30">
                    <FaChevronRight aria-hidden="true" />
                </button>
            </div>

            <div className="mb-1 grid grid-cols-7">
                {DAYS.map((day) => (
                    <div key={day} className="py-1 text-center text-xs font-semibold text-muted">{day}</div>
                ))}
            </div>

            <div className="grid flex-1 auto-rows-fr grid-cols-7 gap-1">
                {cells.map((date, index) => {
                    if (!date) return <div key={index} />

                    const titles = titlesByDay.get(dayKey(date))
                    const trained = Boolean(titles)
                    const isToday = date.toDateString() === today.toDateString()
                    const isFuture = date > today && !isToday

                    return (
                        <div
                            key={index}
                            title={titles?.join(', ')}
                            aria-label={`${date.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}${trained ? `, trained: ${titles.join(', ')}` : ''}`}
                            className={cx(
                                'flex min-h-10 flex-col items-center justify-center rounded-xl p-1 text-center',
                                trained ? 'bg-accent text-white' : isFuture ? 'bg-bg/60 text-muted' : 'bg-bg/60 text-fg',
                                isToday && 'ring-2 ring-fg',
                                isFuture && 'text-muted'
                            )}
                        >
                            <span className="text-sm font-bold">{date.getDate()}</span>
                            {trained && <span className="hidden w-full truncate text-xs sm:block">{titles[0]}</span>}
                        </div>
                    )
                })}
            </div>

            <div className="mt-4 flex justify-center gap-4 text-xs text-muted">
                <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-accent" />Trained</span>
                <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full ring-2 ring-fg" />Today</span>
                <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-bg/60 ring-1 ring-line" />Rest day</span>
            </div>
        </Card>
    )
}

export default MonthCalendar
