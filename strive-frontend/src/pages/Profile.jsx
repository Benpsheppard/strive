// Profile.jsx

// Imports
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FaUser } from 'react-icons/fa';

// Function Imports
import { logout, reset, deleteUser, resetUser, updateWeightPreference } from '../features/auth/authSlice.js';

// Component Imports
import Header from '../components/headers/Header.jsx';
import Spinner from '../components/Spinner.jsx';
import GuestHeader from '../components/headers/GuestHeader.jsx';
import WeightToggle from '../components/profile/WeightToggle.jsx';

const Profile = () => {
    const { user, isLoading, isError, message } = useSelector((state) => state.auth);
    const { workouts } = useSelector((state) => state.workout);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const onLogout = () => {
        dispatch(logout());
        dispatch(reset());
    }

    const onDeleteAccount = () => {
        if (window.confirm('Are you sure you want to delete your account? This will permanently delete all your workouts and data. This action cannot be undone.')) {
            dispatch(deleteUser(user._id));
            dispatch(reset());
        }
    }

    const onResetAccount = () => {
        if (window.confirm('Are you sure you want to reset your account? Doing so will permanently delete any workout data but keep your profile in tact. This action cannot be undone.')) {
            dispatch(resetUser(user._id));
            dispatch(reset());
        }
    }

    const onWeightToggle = () => {
        dispatch(updateWeightPreference(!user.useImperial));
    }

    useEffect(() => {
            if (isError) {
                console.log(message);
            }
    
            if (!user){
                navigate('/login');
                return;
            }
        
            return () => {
                dispatch(reset());
            }
    
        }, [user, isError, message, navigate, dispatch]);

    if(isLoading || !user){
        return (
            <Spinner />
        )
    }

    return (
        <section className="bg-[#2B2D42] mt-15 min-h-screen flex flex-col items-center justify-start overflow-x-hidden">
            <Header />
            {user.isGuest && <GuestHeader currentWorkouts={workouts.length}/>}
            <div className="container bg-[#2B2D42] min-h-screen mx-auto px-6 py-10">
                <h1 className="text-6xl text-center font-bold text-[#EDF2F4] mb-6">
                    Profile
                </h1>

                <div className="bg-[#8D99AE] mx-auto item-center text-center shadow-md rounded-xl p-6 max-w-md">
                    <FaUser className="text-8xl text-[#2B2D42] bg-[#EDF2F4] rounded-full mx-auto mb-3"/>
                    <p className="text-lg mb-2 text-[#2B2D42]">
                        <span className="font-semibold">Username:</span> {user.username}
                    </p>
                    <p className="text-lg mb-2 text-[#2B2D42]">
                        <span className="font-semibold">Email:</span> {user.email}
                    </p>
                    <p className="text-lg mb-6 text-[#2B2D42]">
                        <span className="font-semibold">User since:</span>{" "}
                        {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-lg mb-2 text-[#2B2D42]">
                        <span className="font-semibold">Level:</span> {user.level}
                    </p>
                    <p className="text-lg mb-2 text-[#2B2D42]">
                        <span className="font-semibold">Strive Points:</span> {user.strivepoints}
                    </p>

                    {/* Weight Unit Toggle */}
                    <WeightToggle useImperial={user.useImperial} onToggle={onWeightToggle} />

                    {/* Account Control buttons */}
                    <div className="flex flex-col w-full items-center">
                        <button onClick={onLogout} className="w-full bg-[#EF233C] text-[#EDF2F4] py-2 rounded mt-4 transition hover:bg-[#D90429]">
                            Logout
                        </button>

                        <div className="flex items-center gap-2 w-full">
                            <button onClick={onDeleteAccount} className="w-1/2 bg-[#8D99AE] text-[#EDF2F4] py-2 rounded mt-2 transition hover:bg-[#D90429]">
                                Delete Account
                            </button>
                            <button onClick={onResetAccount} className="w-1/2 bg-[#8D99AE] text-[#EDF2F4] py-2 rounded mt-2 transition hover:bg-[#D90429]">
                                Reset Account
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Profile;
