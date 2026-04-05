// Profile.jsx

// Imports
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { FaUser } from 'react-icons/fa'
import Swal from 'sweetalert2'

// Function Imports
import { logout, reset, deleteUser, resetUser, updateWeightPreference } from '../features/auth/authSlice.js'
import { formatWeight, formatNumber } from '../utils/formatValues.js'

// Component Imports
import Header from '../components/headers/Header.jsx'
import Spinner from '../components/spinners/Spinner.jsx'
import WeightToggle from '../components/profile/WeightToggle.jsx'
import GuestCard from '../components/guest/GuestCard.jsx'

const Profile = () => {
    const { user, isLoading, isError, message } = useSelector((state) => state.auth)
    const { workouts } = useSelector((state) => state.workout)

    const navigate = useNavigate()
    const dispatch = useDispatch()

    const onLogout = () => {
        Swal.fire({
            title: 'Log Out?',
            text: 'Are you sure you want to log out?',
            icon: 'warning',
            color: '#EDF2F4',
            background: '#8D99AE',
            showCancelButton: true,
            confirmButtonText: 'Logout',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#EF233C',
            cancelButtonColor: '#2B2D42'
        }).then((result) => {
            if (result.isConfirmed) {
                dispatch(logout())
            }
        })
    }

    const onDeleteAccount = () => {
        Swal.fire({
            title: 'Delete Account?',
            html: 'This will permanently delete all your workouts and data. This action cannot be undone.<br><br>Type <strong>DELETE</strong> to confirm.',
            icon: 'warning',
            color: '#EDF2F4',
            background: '#8D99AE',
            input: 'text',
            inputPlaceholder: 'Type DELETE to confirm',
            showCancelButton: true,
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#EF233C',
            cancelButtonColor: '#2B2D42',
            preConfirm: (value) => {
                if (value !== 'DELETE') {
                    Swal.showValidationMessage('You must type DELETE exactly to confirm')
                    return false
                }
            }
        }).then((result) => {
            if (result.isConfirmed) {
                dispatch(deleteUser(user._id))
                dispatch(reset())
            }
        })
    }

    const onResetAccount = () => {
        Swal.fire({
            title: 'Reset Account?',
            html: 'This will permanently delete your workout data but keep your profile intact. This action cannot be undone.<br><br>Type <strong>RESET</strong> to confirm.',
            icon: 'warning',
            color: '#EDF2F4',
            background: '#8D99AE',
            input: 'text',
            inputPlaceholder: 'Type RESET to confirm',
            showCancelButton: true,
            confirmButtonText: 'Reset',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#EF233C',
            cancelButtonColor: '#2B2D42',
            preConfirm: (value) => {
                if (value !== 'RESET') {
                    Swal.showValidationMessage('You must type RESET exactly to confirm')
                    return false
                }
            }
        }).then((result) => {
            if (result.isConfirmed) {
                dispatch(resetUser(user._id))
                dispatch(reset())
            }
        })
    }

    useEffect(() => {
        if (isError) {
            console.log(message)
        }

        if (!user){
            navigate('/login')
            return
        }
    
        return () => {
            dispatch(reset())
        }

    }, [user, isError, message, navigate, dispatch])

    if(isLoading || !user){
        return (
            <Spinner />
        )
    }

    return (
        <section className="min-h-screen mt-0 md:mt-20 flex flex-col items-center px-4 pb-32">            
            <Header />

            <h1 className="text-4xl md:text-6xl font-semibold text-[#EDF2F4] text-center p-4">
                Profile
            </h1>

            <div className='space-y-3 w-full flex flex-col items-center'>
                {/* Guest Card */}
                {user?.isGuest && (
                    <GuestCard workouts={workouts} isMigrate={true} />
                )}

                <div className="bg-[#8D99AE] w-full md:max-w-2xl p-6 item-center text-[#2B2D42] text-center shadow-md rounded-xl space-y-3">
                    <FaUser className="text-8xl bg-[#EDF2F4] rounded-full mx-auto mb-3"/>
                    <p className='text-[#EDF2F4] text-3xl font-semibold'>
                        {user?.username}
                    </p>

                    {!user?.isGuest && (
                        <p className='text-[#EDF2F4] text-xl font-semibold'>
                            Email:<span className="text-[#EF233C]">{user.email}</span>
                        </p>
                    )}

                    <p className='text-[#EDF2F4] text-xl font-semibold'>
                        User since:<span className="text-[#EF233C]">{new Date(user.createdAt).toLocaleDateString()}</span>
                    </p>

                    {/* Weight Unit Toggle */}
                    <WeightToggle useImperial={user.useImperial} />
                </div>

                <div className='bg-[#8D99AE] w-full md:max-w-2xl p-6 item-center text-[#2B2D42] text-center shadow-md rounded-xl'>
                    <p className='text-[#EDF2F4] text-xl font-semibold'>
                        Level: <span className='text-[#EF233C]'>{user?.level}</span>
                    </p>
                    <p className='text-[#EDF2F4] text-xl font-semibold'>
                        Strive Points: <span className='text-[#EF233C]'>{formatNumber(user?.strivepoints, 0)} SP</span>
                    </p>
                </div>

                <div className="bg-[#8D99AE] w-full md:max-w-2xl p-6 item-center text-[#2B2D42] text-center shadow-md rounded-xl">
                    <p className="text-[#EDF2F4] text-xl font-semibold">
                        Target: <span className="text-[#EF233C]"> {user.target}-a-day</span> 
                    </p>
                    <p className="text-[#EDF2F4] text-xl font-semibold">
                        Height: <span className="text-[#EF233C]"> {user.height?.feet}' {user.height?.inches}"</span>
                    </p>
                    <p className="text-[#EDF2F4] text-xl font-semibold">
                        Weight: <span className="text-[#EF233C]"> {formatWeight(user.weight, user.useImperial)}</span>
                    </p>
                </div>

                {/* Account Control buttons */}
                <div className="bg-[#8D99AE] w-full md:max-w-2xl p-6 text-[#2B2D42] text-center shadow-md rounded-xl flex flex-col w-full items-center">
                    <button onClick={onLogout} className="w-full bg-[#EF233C] text-[#EDF2F4] py-2 rounded transition hover:bg-[#D90429]">
                        Logout
                    </button>
                </div>

                <div className="bg-[#8D99AE] w-full md:max-w-2xl p-6 text-[#2B2D42] text-center shadow-md rounded-xl flex flex-col w-full items-center">
                    <button onClick={onDeleteAccount} className="w-full bg-[#2B2D42] text-[#EF233C] border-2 border-[#D90429] py-2 rounded mt-2 transition hover:bg-[#D90429] hover:text-[#EDF2F4]">
                        Delete Account
                    </button>
                    <button onClick={onResetAccount} className="w-full bg-[#2B2D42] text-[#EF233C] border-2 border-[#D90429] py-2 rounded mt-2 transition hover:bg-[#D90429] hover:text-[#EDF2F4]">
                        Reset Account
                    </button>
                </div>
            </div>
        </section> 
    )
}

export default Profile
