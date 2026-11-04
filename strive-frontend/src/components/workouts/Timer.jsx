// Timer.jsx
// Sticky workout clock with the rest countdown. Stays on screen while you scroll.

import { useState, useEffect } from 'react'
import { FaClock, FaBell } from 'react-icons/fa'
import { formatElapsed, formatSeconds } from '../../utils/formatValues'
import Button from '../ui/Button.jsx'
import { cx } from '../../utils/cx.js'

const REST_TIMER_OPTIONS = [
    { label: 'Off', value: 0 },
    { label: '30s', value: 30 },
    { label: '1m', value: 60 },
    { label: '1m 30s', value: 90 },
    { label: '2m', value: 120 },
    { label: '3m', value: 180 }
]

const Timer = ({ started, startTime, restTimerDuration, setRestTimerDuration, restTimeRemaining, skipTimer, adjustRest, adjustSeconds = 15 }) => {
    const [elapsed, setElapsed] = useState(() => (startTime ? Math.floor((Date.now() - startTime) / 1000) : 0))
    const [showSettings, setShowSettings] = useState(false)

    useEffect(() => {
        if (!started || !startTime) return
        const tick = () => setElapsed(Math.floor((Date.now() - startTime) / 1000))
        tick()
        const interval = setInterval(tick, 1000)
        return () => clearInterval(interval)
    }, [started, startTime])

    const resting = restTimeRemaining > 0

    return (
        <div className="sticky top-0 z-30 -mx-4 border-b border-line bg-bg/95 px-4 py-2 backdrop-blur sm:mx-0 sm:rounded-b-2xl">
            <div className="flex items-center justify-between gap-3">
                <p className="flex items-center gap-2 font-semibold text-fg" aria-label="Workout time">
                    <FaClock aria-hidden="true" className="text-accent-fg" />
                    <span className="tabular-nums">{formatElapsed(elapsed)}</span>
                </p>

                {resting ? (
                    <div className="flex items-center gap-1" role="timer" aria-live="off" aria-label="Rest timer">
                        <Button variant="ghost" size="sm" onClick={() => adjustRest(-adjustSeconds)} aria-label={`Subtract ${adjustSeconds} seconds`}>
                            −{adjustSeconds}
                        </Button>
                        <span className={cx('min-w-[4.5rem] text-center text-2xl font-bold tabular-nums', restTimeRemaining <= 5 ? 'text-accent-fg' : 'text-fg')}>
                            {formatSeconds(restTimeRemaining)}
                        </span>
                        <Button variant="ghost" size="sm" onClick={() => adjustRest(adjustSeconds)} aria-label={`Add ${adjustSeconds} seconds`}>
                            +{adjustSeconds}
                        </Button>
                        <Button variant="secondary" size="sm" onClick={skipTimer}>Skip</Button>
                    </div>
                ) : (
                    <Button
                        variant="secondary"
                        size="sm"
                        aria-expanded={showSettings}
                        onClick={() => setShowSettings(prev => !prev)}
                    >
                        <FaBell aria-hidden="true" />
                        Rest: {restTimerDuration === 0 ? 'Off' : formatSeconds(restTimerDuration)}
                    </Button>
                )}
            </div>

            {showSettings && !resting && (
                <div className="mt-2 flex flex-wrap justify-center gap-2" role="group" aria-label="Rest timer length">
                    {REST_TIMER_OPTIONS.map(option => (
                        <button
                            key={option.value}
                            type="button"
                            aria-pressed={restTimerDuration === option.value}
                            onClick={() => { setRestTimerDuration(option.value); setShowSettings(false) }}
                            className={cx(
                                'rounded-full border px-3 py-1 text-sm transition-colors',
                                restTimerDuration === option.value
                                    ? 'border-accent bg-accent text-white'
                                    : 'border-line bg-surface text-muted hover:text-fg'
                            )}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

export default Timer
