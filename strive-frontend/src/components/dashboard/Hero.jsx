// Hero.jsx

// Imports
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'

const Hero = () => {
    const { user } = useSelector((state) => state.auth)

    return (
        <section className="bg-[#8D99AE] h-screen flex items-center justify-center -mt-20 md:mt-0">
            <div className="text-center px-6">
                <h1 className="text-8xl md:text-9xl font-bold text-[#EDF2F4] mb-4 drop-shadow-lg">
                    STRIVE
                </h1>
                <button className="bg-[#EF233C] hover:bg-red-700 text-[#EDF2F4] font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-300">
                    {user ? (
                        <Link to='/'>Let's Get Started</Link>
                    ) : (
                        <Link to='/login'>Log in</Link>
                    )}
                </button>
            </div>  
        </section>
    )
}

// Export
export default Hero