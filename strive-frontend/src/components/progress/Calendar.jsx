// Calendar.jsx
// This week's training days and progress towards the weekly target

import { FaFire } from 'react-icons/fa'
import Card from '../ui/Card.jsx'
import { cx } from '../../utils/cx.js'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const getStartOfWeek = () => {
    const now = new Date()
    const day = now.getDay()
    const monday = new Date(now)
    monday.setDate(now.getDate() + (day === 0 ? -6 : 1 - day))
    monday.setHours(0, 0, 0, 0)
    return monday
}

const isSameDay = (a, b) => a.toDateString() === b.toDateString()

const Calendar = ({ workouts, target }) => {
    const startOfWeek = getStartOfWeek()
    const today = new Date()

    const weekDates = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(startOfWeek)
        date.setDate(startOfWeek.getDate() + i)
        return date
    })

    const trainedOn = (date) => workouts.some(workout => isSameDay(new Date(workout.createdAt), date))

    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 7)
    const workoutsThisWeek = workouts.filter(w => {
        const d = new Date(w.createdAt)
        return d >= startOfWeek && d < endOfWeek
    }).length

    return (
        <Card as="section" aria-label="This week" className="space-y-3">
            <div className="flex items-baseline justify-between">
                <h2 className="font-display text-2xl font-bold">This <span className="text-accent-fg">week</span></h2>
                {target ? (
                    <p className="text-sm text-muted">
                        <span className="font-semibold text-fg">{workoutsThisWeek}</span> of {target} workouts
                    </p>
                ) : null}
            </div>

            <ol className="flex justify-between">
                {weekDates.map((date, index) => {
                    const trained = trainedOn(date)
                    const isToday = isSameDay(date, today)

                    return (
                        <li key={index} className="flex flex-col items-center gap-1" aria-label={`${DAYS[index]} ${date.getDate()}${trained ? ', trained' : ''}${isToday ? ', today' : ''}`}>
                            <span className="text-xs text-muted">{DAYS[index]}</span>
                            <div
                                className={cx(
                                    'flex h-10 w-10 items-center justify-center rounded-full text-base font-bold sm:h-12 sm:w-12',
                                    trained ? 'bg-accent text-white' : isToday ? 'border-2 border-accent-fg text-fg' : 'bg-bg/60 text-muted'
                                )}
                            >
                                {trained ? <FaFire aria-hidden="true" /> : date.getDate()}
                            </div>
                        </li>
                    )
                })}
            </ol>
        </Card>
    )
}

export default Calendar
