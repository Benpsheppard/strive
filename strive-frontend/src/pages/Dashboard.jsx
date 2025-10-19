// Dashboard.jsx

// Imports
import { useSelector } from 'react-redux';

// Component Imports
import Header from '../components/headers/Header.jsx'; 
import Hero from '../components/dashboard/Hero.jsx';
import About from '../components/dashboard/About.jsx';    
import Features from '../components/dashboard/Features.jsx';  
import Footer from '../components/dashboard/Footer.jsx';
import Spinner from '../components/Spinner.jsx';
import GuestHeader from '../components/headers/GuestHeader.jsx';

// Dashboard
const Dashboard = () => {
    const { user, isLoading } = useSelector((state) => state.auth);
    const { workouts } = useSelector((state) => state.workout);

    if(isLoading){
        return (
            <Spinner />
        )
    }

    return (
        <section className="mt-15">
            <Header />
            {user && user.isGuest && <GuestHeader currentWorkouts={workouts.length}/>}
            <Hero />
            <About />
            <Features />
            <Footer />
        </section>
    )
};

// Export Dashboard
export default Dashboard;