// BadgeIcon.jsx
// The round icon for an achievement. Colour shows the tier; locked ones are muted.

import {
    FaDumbbell, FaStar, FaFire, FaTrophy, FaWeightHanging, FaScroll, FaCloudSun, FaMoon,
    FaShoePrints, FaCircleNotch, FaUndo, FaShieldAlt, FaGlassCheers, FaDice, FaClock,
    FaHatWizard, FaBolt, FaLayerGroup, FaPalette, FaCat, FaLock, FaSun, FaHippo, FaMedal
} from 'react-icons/fa'
import { cx } from '../../utils/cx.js'

// Icon keys come from the server's definitions
const ICONS = {
    dumbbell: FaDumbbell, level: FaStar, flame: FaFire, trophy: FaTrophy, weight: FaWeightHanging,
    scroll: FaScroll, sunrise: FaCloudSun, moon: FaMoon, legs: FaShoePrints, round: FaCircleNotch,
    comeback: FaUndo, shield: FaShieldAlt, party: FaGlassCheers, dice: FaDice, clock: FaClock,
    hat: FaHatWizard, sun: FaSun, bolt: FaBolt, cards: FaLayerGroup, palette: FaPalette,
    cat: FaCat, turtle: FaHippo, lock: FaLock
}

const TIER_COLOUR = { gold: 'text-warning', silver: 'text-fg', bronze: 'text-accent-fg' }

const BadgeIcon = ({ icon, tier, locked = false, size = 'md' }) => {
    const Icon = ICONS[icon] || FaMedal

    return (
        <span
            aria-hidden="true"
            className={cx(
                'flex shrink-0 items-center justify-center rounded-full border border-line/60',
                size === 'lg' ? 'h-14 w-14 text-2xl' : 'h-12 w-12 text-xl',
                locked ? 'bg-bg text-muted' : cx('bg-surface-2', TIER_COLOUR[tier] || 'text-secondary')
            )}
        >
            <Icon />
        </span>
    )
}

export default BadgeIcon
