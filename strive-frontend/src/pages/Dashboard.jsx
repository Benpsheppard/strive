// Dashboard.jsx

// Imports
import { useSelector } from 'react-redux'

// Component Imports
import Header from '../components/headers/Header.jsx' 
import Hero from '../components/dashboard/Hero.jsx'
import About from '../components/dashboard/About.jsx'    
import Features from '../components/dashboard/Features.jsx'  
import Footer from '../components/dashboard/Footer.jsx'
import Spinner from '../components/spinners/Spinner.jsx'

// Dashboard
const Dashboard = () => {
    const { isLoading } = useSelector((state) => state.auth)

    if(isLoading){
        return (
            <Spinner />
        )
    }

    return (
        <section>
            <Header />
            <Hero />
            <About />
            <Features />
            <Footer />
        </section>
    )
}

// Export Dashboard
export default Dashboard