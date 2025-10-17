const Footer = () => {
    return (
        <footer className="bg-[#2B2D42] text-[#8D99AE] py-6">
            <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
                <div className="mb-4 md:mb-0 text-center md:text-left">
                    <h2 className="text-lg font-bold text-[#EDF2F4]">Strive</h2>
                    <p className="text-sm">Build habits. Track progress. Stay consistent.</p>
                </div>
                <div className="grid grid-cols-3 gap-4 md:flex md:space-x-6 md:gap-0">
                    <a href="/profile" className="hover:text-[#EF233C] text-center md:text-left">Profile</a>
                    <a href="/prev-workouts" className="hover:text-[#EF233C] text-center md:text-left">Workouts</a>
                    <a href="/contact" className="hover:text-[#EF233C] text-center md:text-left">Contact</a>
                    <a href="/privacy-policy" className="hover:text-[#EF233C] text-center md:text-left">Privacy Policy</a>
                    <a href="/help" className="hover:text-[#EF233C] text-center md:text-left">Help</a>
                </div>
            </div>
            <div className="text-center text-xs text-gray-500 mt-4">
                © 2025 Strive. All rights reserved.
            </div>
        </footer>
    )
};


export default Footer;