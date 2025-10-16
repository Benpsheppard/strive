// Dashboard.jsx
// File to hold Dashboard page layout and functionality

// Imports
import Header from '../components/Header.jsx';  // Import header component
import Hero from '../components/Hero.jsx';  // Import hero component
import About from '../components/About.jsx';    // Import about component
import Features from '../components/Features.jsx';  // Import Features component
import Footer from '../components/Footer.jsx';
import Spinner from '../components/Spinner.jsx';
import GuestHeader from '../components/GuestHeader.jsx';
import { useSelector } from 'react-redux';

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