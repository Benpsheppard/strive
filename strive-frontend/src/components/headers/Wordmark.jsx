// Wordmark.jsx

import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { cx } from '../../utils/cx.js'
import { useAchievementEvent } from '../../hooks/useAchievementEvent.js'

const Wordmark = ({ className }) => {
    const reportEvent = useAchievementEvent()
    const taps = useRef(0)

    // Secret achievement for the curious
    const onClick = () => {
        taps.current += 1
        if (taps.current === 10) reportEvent('logo_tap_10')
    }

    return (
        <Link
            to="/"
            onClick={onClick}
            aria-label="Strive home"
            className={cx('font-display text-2xl font-extrabold tracking-wider text-fg hover:text-accent-fg', className)}
        >
            STRIVE
        </Link>
    )
}

export default Wordmark
