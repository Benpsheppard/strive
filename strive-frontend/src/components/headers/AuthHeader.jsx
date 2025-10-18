// Header.jsx

// Imports
import { Link } from 'react-router-dom';

const Header = () => {

    return (
        <header className="header fixed top-0 left-0 w-full bg-[#2B2D42] h-15">
            <div className="container mx-auto flex items-center justify-between px-6 py-4">
                
                {/* Logo / Title */}
                <div className="text-2xl font-bold tracking-wide">
                    <Link to="/" className="text-[#EDF2F4] hover:text-[#EF233C] inline-block transform transition duration-200 hover:scale-110">
                        STRIVE
                    </Link>
                </div>
            </div>
        </header>
    );
};

// Export Header
export default Header;
