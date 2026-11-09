// Header.jsx
// App navigation: top bar (with level, streak and momentum) plus a bottom tab bar on phones

import { useSelector } from 'react-redux'
import { Link, NavLink } from 'react-router-dom'
import { FaDumbbell, FaHistory, FaChartBar, FaGamepad, FaUser, FaFire, FaBolt, FaStar } from 'react-icons/fa'
import Wordmark from './Wordmark.jsx'
import ThemeToggle from '../ui/ThemeToggle.jsx'
import { cx } from '../../utils/cx.js'

const NAV_ITEMS = [
    { to: '/', label: 'Workout', icon: FaDumbbell, end: true },
    { to: '/prev-workouts', label: 'History', icon: FaHistory },
    { to: '/progress', label: 'Progress', icon: FaChartBar },
    { to: '/games', label: 'Games', icon: FaGamepad },
    { to: '/profile', label: 'Profile', icon: FaUser }
]

const Stat = ({ icon: Icon, value, label, colour }) => (
    <Link
        to="/how-it-works"
        title={`${label} - tap to learn how it works`}
        className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-base font-semibold text-fg hover:bg-surface-2"
    >
        <Icon size={16} aria-hidden="true" className={colour} />
        <span className="tabular-nums">{value}</span>
        <span className="sr-only text-sm font-normal text-muted lg:not-sr-only">{label}</span>
    </Link>
)

const Header = () => {
    const { user } = useSelector((state) => state.auth)

    return (
        <>
            <header className="sticky top-0 z-40 border-b border-line/60 bg-bg/90 backdrop-blur">
                <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4">
                    <div className="flex items-center gap-6">
                        <Wordmark />

                        {/* Desktop navigation */}
                        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
                            {NAV_ITEMS.map(({ to, label, end }) => (
                                <NavLink
                                    key={to}
                                    to={to}
                                    end={end}
                                    className={({ isActive }) => cx(
                                        'rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors',
                                        isActive ? 'bg-surface-2 text-fg' : 'text-muted hover:text-fg'
                                    )}
                                >
                                    {label}
                                </NavLink>
                            ))}
                        </nav>
                    </div>

                    <div className="flex items-center gap-1" role="group" aria-label="Your progress">
                        <Stat icon={FaStar} value={user?.level ?? 0} label="Level" colour="text-warning" />
                        <Stat icon={FaFire} value={user?.streak?.current ?? 0} label="Streak" colour="text-accent-fg" />
                        <Stat icon={FaBolt} value={user?.momentum?.current ?? 0} label="Momentum" colour="text-secondary" />
                        <ThemeToggle />
                    </div>
                </div>
            </header>

            {/* Phone tab bar */}
            <nav
                aria-label="Main"
                className="fixed inset-x-0 bottom-0 z-40 border-t border-line/60 bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
            >
                <ul className="mx-auto flex max-w-md items-stretch justify-around">
                    {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
                        <li key={to} className="flex-1">
                            <NavLink
                                to={to}
                                end={end}
                                className={({ isActive }) => cx(
                                    'flex min-h-[4rem] flex-col items-center justify-center gap-1 py-2 text-sm font-semibold transition-colors',
                                    isActive ? 'text-accent-fg' : 'text-muted hover:text-fg'
                                )}
                            >
                                <Icon size={26} aria-hidden="true" />
                                <span>{label}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
        </>
    )
}

export default Header
