// Profile.jsx

// Imports
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, reset, deleteUser, resetUser, updateWeightPreference } from '../features/auth/authSlice.js';
import Header from '../components/Header.jsx';
import { FaUser } from 'react-icons/fa';
import Spinner from '../components/Spinner.jsx';
import GuestHeader from '../components/GuestHeader.jsx';

const Profile = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user, isLoading, isError, message } = useSelector((state) => state.auth);
    const { workouts } = useSelector((state) => state.workout);

    const onLogout = () => {
        dispatch(logout());
        dispatch(reset());
        navigate('/');
    }

    const onDeleteAccount = () => {
        if (window.confirm('Are you sure you want to delete your account? This will permanently delete all your workouts and data. This action cannot be undone.')) {
            dispatch(deleteUser(user._id));
            dispatch(reset());
            navigate('/');
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
                <h1 className="text-3xl text-center mt-25 font-bold text-[#EDF2F4] mb-6">
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

                    {/* Weight Unit Toggle */}
                    <div className="bg-[#2B2D42] rounded-lg p-4 mb-6">
                        <div className="flex items-center justify-between">
                            <span className="text-[#EDF2F4] font-semibold">Weight Unit:</span>
                            <div className="flex items-center gap-3">
                                <span className={`text-sm ${!user.useImperial ? 'text-[#EDF2F4] font-bold' : 'text-[#8D99AE]'}`}>
                                    KG
                                </span>
                                <button
                                    onClick={onWeightToggle}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#EF233C] focus:ring-offset-2 ${
                                        user.useImperial ? 'bg-[#EF233C]' : 'bg-[#8D99AE]'
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-[#EDF2F4] transition-transform ${
                                            user.useImperial ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                    />
                                </button>
                                <span className={`text-sm ${user.useImperial ? 'text-[#EDF2F4] font-bold' : 'text-[#8D99AE]'}`}>
                                    LBS
                                </span>
                            </div>
                        </div>
                    </div>

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
