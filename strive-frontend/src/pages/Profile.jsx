// Profile.jsx

// Imports
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, reset, deleteUser, resetUser } from '../features/auth/authSlice.js';
import Header from '../components/Header.jsx';
import { FaUser } from 'react-icons/fa';
import Spinner from '../components/Spinner.jsx';

const Profile = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user, isLoading, isError, message } = useSelector((state) => state.auth);

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
        <>
            <Header />
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
        </>
    );
};

export default Profile;
