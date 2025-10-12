const Footer = () => {
    return (
        <footer className="bg-[#2B2D42] text-[#8D99AE] py-6">
            <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
                <div className="mb-4 md:mb-0 text-center md:text-left">
                    <h2 className="text-lg font-bold text-[#EDF2F4]">Strive</h2>
                    <p className="text-sm">Build habits. Track progress. Stay consistent.</p>
                </div>
                <div className="flex space-x-6">
                    <a href="/profile" className="hover:text-[#EF233C]">Profile</a>
                    <a href="/prev-workouts" className="hover:text-[#EF233C]">Workouts</a>
                    <a href="/contact" className="hover:text-[#EF233C]">Contact</a>
                    <a href="https://github.com/Benpsheppard" target="_blank" className="hover:text-[#EF233C]">GitHub</a>
                    <a href="/privacy-policy" className="hover:text-[#EF233C]">Privacy Policy</a>
                    <a href="/help" className="hover:text-[#EF233C]">Help</a>
                </div>
            </div>
            <div className="text-center text-xs text-gray-500 mt-4">
                © 2025 Strive. All rights reserved.
            </div>
        </footer>
    )
};


export default Footer;