// Header.jsx

const Header = () => {

    return (
        <header className="fixed top-0 left-0 w-full bg-[#2B2D42] backdrop-blur-md text-[#EDF2F4] shadow-[0_8px_30px_rgba(0,0,0,0.5)] z-100 h-16">
            <div className="mx-auto flex items-center justify-between px-6 py-4">
                
                {/* Logo / Title */}
                <div className="text-2xl font-bold tracking-wide">
                    <h1 className="text-[#EDF2F4] hover:text-[#EF233C] inline-block transform transition duration-200 hover:scale-110">
                        STRIVE
                    </h1>
                </div>
            </div>
        </header>
    )
}

// Export
export default Header
