// Hero.jsx
// File to manage hero component

// Imports
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Hero
const Hero = () => {
    const { user } = useSelector((state) => state.auth);
    return (
        <section className="hero bg-[#8D99AE] h-screen flex items-center justify-center">
            <div className="hero-container text-center px-6">
                <h1 className="title text-8xl md:text-6xl font-bold text-[#EDF2F4] mb-4 drop-shadow-lg">
                    STRIVE
                </h1>
                <p className="tag-line text-xl md:text-2xl text-[#EDF2F4] mb-6 drop-shadow-md">
                    Strive for better
                </p>
                <button className="bg-[#EF233C] hover:bg-red-700 text-[#EDF2F4] font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-300">
                    <Link to={user ? ('/new-workout') : ('/login')}>Let's Get Started</Link>
                </button>
            </div>  
        </section>
    )
};

// Export Hero
export default Hero;