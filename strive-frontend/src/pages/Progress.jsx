// Progress.jsx

// Imports
import Header from '../components/Header.jsx';
import Spinner from '../components/Spinner.jsx';
import GuestHeader from '../components/GuestHeader.jsx';
import Offline from '../components/Offline.jsx';
import ProgressChart from '../components/ProgressChart.jsx';

import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { getWorkouts, reset } from '../features/workouts/workoutsSlice.js';
import { useOnlineStatus } from '../hooks/onlineStatus.js';

const Progress = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { user } = useSelector((state) => state.auth);
    const { workouts: reduxWorkouts, isLoading, isError, message } = useSelector((state) => state.workout);
    const isOnline = useOnlineStatus();

    // Local state for offline support
    const [workouts, setWorkouts] = useState([]);

    useEffect(() => {
        if (isError) {
            console.log(message);
        }

        if (!user) {
            navigate('/login');
            return;
        }

        if (isOnline) {
            dispatch(getWorkouts()).unwrap()
                .then((data) => localStorage.setItem('progressWorkouts', JSON.stringify(data)))
                .catch((err) => console.log(err));
        } else {
            const cached = localStorage.getItem('progressWorkouts');
            setWorkouts(cached ? JSON.parse(cached) : []);
        }

        return () => {
            dispatch(reset());
        }
    }, [user, isError, message, navigate, dispatch, isOnline]);

    const displayedWorkouts = isOnline ? reduxWorkouts : workouts;

    if (isLoading && isOnline) { 
        return <Spinner />;
    }

    return (
        <section className="bg-[#2B2D42] min-h-screen mt-15 flex flex-col items-center">
            <Header />
            {user.isGuest && <GuestHeader currentWorkouts={displayedWorkouts.length} />}
            {!isOnline && <Offline />}
            <section className="mt-15 text-6xl text-[#EDF2F4] font-semibold text-center px-4 py-4">
                <h1>Your <span className="text-[#EF233C]">Progress</span></h1>
            </section>

            <section className="w-full max-w-3xl px-4 mb-10">
                {displayedWorkouts.length > 0 ? (
                <ProgressChart workouts={displayedWorkouts} />
                ) : (
                <div className="text-[#EDF2F4] text-xl text-center mt-10">
                    <h3>No workout data to show yet!</h3>
                </div>
                )}
            </section>
        </section>
    );
};

export default Progress;