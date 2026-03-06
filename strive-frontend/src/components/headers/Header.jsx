// Header.jsx

// Imports
import { useSelector } from 'react-redux'
import { Link, useLocation } from 'react-router-dom'
import { Dumbbell, Clock, BarChart2, Gamepad2, User, LogIn } from 'lucide-react'

const Header = () => {
    const { user } = useSelector((state) => state.auth)
    const location = useLocation()

    const navOps = "text-[#EDF2F4] hover:text-[#EF233C] inline-block transform transition duration-200 hover:scale-110"

    const mobileNavItems = [
        { to: "/new-workout", label: "Workout", icon: Dumbbell },
        { to: "/prev-workouts", label: "History", icon: Clock },
        { to: "/progress", label: "Progress", icon: BarChart2 },
        { to: "/games", label: "Games", icon: Gamepad2 },
    ]

    return (
        <>
            {/* Main Header */}
            <header className="fixed top-0 left-0 w-full bg-[#2B2D42] backdrop-blur-md text-[#EDF2F4] shadow-[0_8px_30px_rgba(0,0,0,0.5)] z-100 h-16">
                <div className="container mx-auto flex items-center justify-between px-6 py-4">
                    
                    {/* Title */}
                    <div className="text-2xl font-bold tracking-wide">
                        <Link to="/" className={navOps}>STRIVE</Link>
                    </div>

                    {/* Desktop Navbar */}
                    <nav className="hidden md:block">
                        <ul className="flex space-x-6 text-lg">
                            <li><Link to="/new-workout" className={navOps}>New Workout</Link></li>
                            <li><Link to="/prev-workouts" className={navOps}>Previous Workouts</Link></li>
                            <li><Link to="/progress" className={navOps}>Progress</Link></li>
                            <li><Link to="/games" className={navOps}>Games</Link></li>
                            <li>
                                {user ? (
                                    <Link to='/profile' className="text-[#EF233C] hover:text-[#D90429] inline-block transform transition duration-200 hover:scale-110">
                                        {user.isGuest ? "Guest" : user.username}
                                    </Link>
                                ) : (
                                    <Link to='/login' className={navOps}>Sign in</Link>
                                )}
                            </li>
                        </ul>
                    </nav>
                </div>
            </header>

            {/* Mobile Bottom Nav Bar */}
            <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[#2B2D42] border-t border-gray-700 shadow-[0_-4px_20px_rgba(0,0,0,0.4)] z-100 p-5">
                <ul className="flex justify-around items-center py-2">
                    {mobileNavItems.map(({ to, label, icon: Icon }) => {
                        const isActive = location.pathname === to
                        return (
                            <li key={to}>
                                <Link
                                    to={to}
                                    className={`flex flex-col items-center gap-1 text-xs transition duration-200 ${
                                        isActive ? 'text-[#EF233C]' : 'text-[#EDF2F4] hover:text-[#EF233C]'
                                    }`}
                                >
                                    <Icon size={22} />
                                    <span>{label}</span>
                                </Link>
                            </li>
                        )
                    })}

                    {/* Profile / Sign in */}
                    <li>
                        {user ? (
                            <Link
                                to='/profile'
                                className={`flex flex-col items-center gap-1 text-xs transition duration-200 ${
                                    location.pathname === '/profile' ? 'text-[#EF233C]' : 'text-[#EDF2F4] hover:text-[#EF233C]'
                                }`}
                            >
                                <User size={22} />
                                <span>{user.isGuest ? "Guest" : user.username}</span>
                            </Link>
                        ) : (
                            <Link
                                to='/login'
                                className={`flex flex-col items-center gap-1 text-xs transition duration-200 ${
                                    location.pathname === '/login' ? 'text-[#EF233C]' : 'text-[#EDF2F4] hover:text-[#EF233C]'
                                }`}
                            >
                                <LogIn size={22} />
                                <span>Sign in</span>
                            </Link>
                        )}
                    </li>
                </ul>
            </nav>

            {/* Bottom padding so content isn't hidden behind the nav bar */}
            <div className="md:hidden h-16" />
        </>
    )
}

export default Header