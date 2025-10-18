// PrevWorkouts.jsx

// Imports
import Header from '../components/Header.jsx';
import WorkoutItem from '../components/WorkoutItem.jsx';
import Spinner from '../components/Spinner.jsx';
import GuestHeader from '../components/GuestHeader.jsx';
import Offline from '../components/Offline.jsx';

import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { getWorkouts, reset } from '../features/workouts/workoutsSlice.js';
import { useOnlineStatus } from '../hooks/onlineStatus.js';

const PrevWorkouts = () => {
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
            // Online
            dispatch(getWorkouts()).unwrap()
                .then((data) => localStorage.setItem('prevWorkouts', JSON.stringify(data)))
                .catch((err) => console.log(err));
        } else {
            // Offline
            const cached = localStorage.getItem('prevWorkouts');
            setWorkouts(cached ? JSON.parse(cached) : []);
        }

        return () => {
            dispatch(reset());
        }
    }, [user, isError, message, navigate, dispatch, isOnline]);

    // Use Redux workouts if online, local state if offline
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
                <h1>Your Completed <span className="text-[#EF233C]">Workouts</span></h1>
            </section>

            <section className="workout-content w-full">
                {displayedWorkouts.length > 0 ? (
                <div className="w-full px-4">
                    {displayedWorkouts.map((workout) => (
                    <WorkoutItem key={workout._id} workout={workout} />
                    ))}
                </div>
                ) : (
                <div className="text-[#EDF2F4] text-xl text-center mt-10">
                    <h3>You have not completed any workouts!</h3>
                    <button className="rounded-lg bg-[#EF233C] px-4 py-2 mt-10 font-semibold text-[#EDF2F4] transition hover:bg-[#D90429]">
                    <Link to='/new-workout'>New Workout</Link>
                    </button>
                </div>
                )}
            </section>
        </section>
    );
};

export default PrevWorkouts;