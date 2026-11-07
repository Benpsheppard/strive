// BadgeIcon.jsx
// The round icon for an achievement. Colour (and, for legendary and insane, animation) shows the tier; locked ones are muted.

import {
    FaDumbbell, FaStar, FaFire, FaTrophy, FaWeightHanging, FaScroll, FaCloudSun, FaMoon,
    FaShoePrints, FaCircleNotch, FaUndo, FaShieldAlt, FaGlassCheers, FaDice, FaClock,
    FaHatWizard, FaBolt, FaLayerGroup, FaPalette, FaCat, FaLock, FaSun, FaHippo, FaMedal, FaCalendarDay, FaPercentage,
    FaAngleDoubleUp, FaHandRock, FaBullseye, FaHeartbeat, FaChild, FaMountain,
    FaThLarge, FaToolbox, FaBirthdayCake, FaRetweet
} from 'react-icons/fa'
import { cx } from '../../utils/cx.js'

// Icon keys come from the server's definitions
const ICONS = {
    dumbbell: FaDumbbell, level: FaStar, flame: FaFire, trophy: FaTrophy, weight: FaWeightHanging,
    scroll: FaScroll, sunrise: FaCloudSun, moon: FaMoon, legs: FaShoePrints, round: FaCircleNotch,
    comeback: FaUndo, shield: FaShieldAlt, party: FaGlassCheers, dice: FaDice, clock: FaClock,
    hat: FaHatWizard, sun: FaSun, bolt: FaBolt, cards: FaLayerGroup, palette: FaPalette,
    cat: FaCat, turtle: FaHippo, lock: FaLock, calendar: FaCalendarDay, percentage: FaPercentage, variety: FaThLarge, toolbox: FaToolbox, cake: FaBirthdayCake, mirror: FaRetweet,
    back: FaAngleDoubleUp, shoulders: FaMountain, fist: FaHandRock, core: FaBullseye, heart: FaHeartbeat, body: FaChild
}

// Colours are the --color-<tier> tokens in index.css; legendary and insane also animate
const TIER_STYLE = {
    common: 'text-common',
    uncommon: 'text-uncommon',
    rare: 'text-rare',
    epic: 'text-epic',
    legendary: 'text-legendary badge-legendary',
    insane: 'text-insane badge-insane'
}

const BadgeIcon = ({ icon, tier, locked = false, size = 'md' }) => {
    const Icon = ICONS[icon] || FaMedal

    return (
        <span
            aria-hidden="true"
            className={cx(
                'flex shrink-0 items-center justify-center rounded-full border border-line/60',
                size === 'lg' ? 'h-14 w-14 text-2xl' : 'h-12 w-12 text-xl',
                locked ? 'bg-bg text-muted' : cx('bg-surface-2', TIER_STYLE[tier] || 'text-secondary')
            )}
        >
            <Icon />
        </span>
    )
}

export default BadgeIcon
