// Footer.jsx

const Footer = () => {
    return (
        <footer className="bg-[#2B2D42] text-[#8D99AE] py-6">
            <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
                <div className="mb-4 md:mb-0 text-center md:text-left">
                    <h2 className="text-lg font-bold text-[#EDF2F4]">Strive</h2>
                    <p className="text-sm">Build habits. Track progress. Stay consistent.</p>
                </div>

                {/* Links section */}
                <div className="flex flex-col items-center space-y-2 md:flex-row md:space-y-0 md:space-x-6">
                    {/* Top row */}
                    <div className="flex justify-center space-x-4">
                        <a href="/profile" className="hover:text-[#EF233C]">Profile</a>
                        <a href="/prev-workouts" className="hover:text-[#EF233C]">Workouts</a>
                        <a href="/contact" className="hover:text-[#EF233C]">Contact</a>
                    </div>

                    {/* Bottom row */}
                    <div className="flex justify-center space-x-4">
                        <a href="/privacy-policy" className="hover:text-[#EF233C]">Privacy Policy</a>
                        <a href="/help" className="hover:text-[#EF233C]">Help</a>
                    </div>
                </div>
            </div>

            <div className="text-center text-xs text-gray-500 mt-4">
                © 2025 Strive. All rights reserved.
            </div>
        </footer>
    )
}

export default Footer
