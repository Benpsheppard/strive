// Header.jsx

// Imports
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

const Header = () => {
    const { user } = useSelector((state) => state.auth)

    const [isOpen, setIsOpen] = useState(false)

    // Navigation options styling
    const navOps = "text-[#EDF2F4] hover:text-[#EF233C] inline-block transform transition duration-200 hover:scale-110"

    return (
        <header className="header fixed top-0 left-0 w-full bg-[#2B2D42] backdrop-blur-md text-[#EDF2F4] shadow-[0_8px_30px_rgba(0,0,0,0.5)] z-100 h-15">
            <div className="container mx-auto flex items-center justify-between px-6 py-4">
                
                {/* Logo / Title */}
                <div className="text-2xl font-bold tracking-wide">
                    <Link to="/" className={navOps}>
                        STRIVE
                    </Link>
                </div>

                {/* Desktop Navbar */}
                <nav className="hidden md:block">
                    <ul className="flex space-x-6 text-lg">
                        <li><Link to="/new-workout" className={navOps}>New Workout</Link></li>
                        <li><Link to="/prev-workouts" className={navOps}>Previous Workouts</Link></li>
                        <li><Link to="/progress" className={navOps}>Progress</Link></li>
                        <li><Link to="/games" onClick={() => setIsOpen(false)} className={navOps}>Games</Link></li>
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

                {/* Mobile Burger Icon */}
                <button
                    className="md:hidden text-[#EDF2F4] hover:text-[#EF233C] transition"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Toggle menu"
                >
                    {isOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* Mobile Dropdown Menu */}
            {isOpen && (
                <nav className="md:hidden bg-[#2B2D42] border-t border-gray-700 px-6 py-4">
                    <ul className="flex flex-col space-y-3 text-lg text-center">
                        <li><Link to="/new-workout" onClick={() => setIsOpen(false)} className={navOps}>New Workout</Link></li>
                        <li><Link to="/prev-workouts" onClick={() => setIsOpen(false)} className={navOps}>Previous Workouts</Link></li>
                        <li><Link to="/progress" onClick={() => setIsOpen(false)} className={navOps}>Progress</Link></li>
                        <li><Link to="/games" onClick={() => setIsOpen(false)} className={navOps}>Games</Link></li>
                        <li>
                            {user ? (
                                <Link to='/profile' onClick={() => setIsOpen(false)} className="text-[#EF233C] hover:text-[#D90429] inline-block transform transition duration-200 hover:scale-110">
                                    {user.isGuest ? "Guest" : user.username}
                                </Link>
                            ) : (
                                <Link to='/login' onClick={() => setIsOpen(false)} className={navOps}>Sign in</Link>
                            )}
                        </li>
                    </ul>
                </nav>
            )}
        </header>
    )
}

// Export
export default Header