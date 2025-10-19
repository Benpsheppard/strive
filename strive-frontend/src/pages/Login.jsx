// Login.jsx

// Imports
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react'; 
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// Function Imports
import { login, reset, register } from '../features/auth/authSlice.js';
import { generateRandomPassword } from '../utils/authUtils.js';

// Component Imports
import Spinner from '../components/Spinner.jsx';
import AuthHeader from '../components/headers/AuthHeader.jsx';

// Login
const Login = () => {
    const { user, isLoading, isError, isSuccess, message } = useSelector((state) => state.auth);

    // Nav and Dispatch initialisation
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Setting fields to blank
    const [formData, setFormData] = useState({
        identifier: '',
        password: ''
    })

    // Getting user data from form
    const { identifier, password } = formData; 

    useEffect(() => {
        // Output error
        if (isError) {
            toast.error(message);
        }

        // Navigate user to dashboard
        if (isSuccess || user) {
            navigate('/');
        }

        if (isSuccess && user) {
            toast.success(`Logged in as: ${user.username}`);
        }

        // Reset state to normal
        dispatch(reset());

    }, [user, isError, isSuccess, message, navigate, dispatch]);

    // When input fields change
    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value
        }))
    }

    // Submit Login form
    const onSubmit = (e) => {
        e.preventDefault();
        
        // Validate input fields
        if (!identifier.trim() || !password.trim()) {
            toast.error("Please fill in all fields.");
            return;
        }

        // Determine if identifier is email or username
        const isEmail = identifier.includes('@');

        // User data object
        const userData = isEmail
        ? {email: identifier, password}
        : {username: identifier, password};

        // Dispatch login
        dispatch(login(userData));
    }

    // Log in as Guest account
    const loginGuest = () => {
        // Generate guest username
        const username = `Guest${Date.now()}${Math.floor(Math.random() * 1000)}`;
        
        // Generate guest user data
        const guestData = {
            username,
            email: `${username}@strive.com`,
            password: generateRandomPassword(),
            isGuest: true
        }

        // Dispatch login
        dispatch(register(guestData));
    }

    if(isLoading){
        return (
            <Spinner />
        )
    }

    return (
        <>
            <AuthHeader />
            <div className="flex min-h-screen items-center justify-center bg-[#2B2D42] px-4">
                <div className="w-full max-w-md rounded-2xl bg-[#8D99AE] p-8 shadow-lg">
                    
                    {/* Title */}
                    <h1 className="mb-6 text-center text-3xl font-bold text-[#EDF2F4]">
                        Welcome to <span className="text-[#EF233C]">Strive</span>
                    </h1>

                    {/* Form */}
                    <form onSubmit={onSubmit} className="space-y-4">
                        <h2 className="mb-2 text-center text-xl font-semibold text-[#EDF2F4]">
                            - Login -
                        </h2>

                        <input
                            type="text"
                            id="identifier"
                            required
                            placeholder="Username or Email *"
                            className="w-full rounded-lg border border-[#EDF2F4]/40 bg-[#2B2D42] px-4 py-2 text-[#EDF2F4] placeholder-gray-300 focus:border-[#EF233C] focus:outline-none focus:ring-2 focus:ring-[#EF233C]/40"
                            name="identifier"
                            value={identifier}
                            onChange={onChange}
                        />

                        <input
                            type="password"
                            id="password"
                            required
                            placeholder="Password *"
                            className="w-full rounded-lg border border-[#EDF2F4]/40 bg-[#2B2D42] px-4 py-2 text-[#EDF2F4] placeholder-gray-300 focus:border-[#EF233C] focus:outline-none focus:ring-2 focus:ring-[#EF233C]/40"
                            name="password"
                            value={password}
                            onChange={onChange}
                        />

                        <p className="text-center text-sm text-[#EDF2F4]">
                            Don't have an account?
                            <Link to="/register" className="text-[#EF233C] hover:text-[#D90429] hover:underline">
                                Register Here
                            </Link>
                        </p>

                        <button id="loginBtn" type="submit" className="w-full rounded-lg bg-[#EF233C] px-4 py-2 font-semibold text-[#EDF2F4] transition hover:bg-[#D90429]">
                            Login
                        </button>
                    </form>
                    
                    {/* Guest Login Button */}
                    <div className="mt-4 text-center">
                        <p className="text-sm text-[#EDF2F4] mb-4">Or</p>
                        <button onClick={loginGuest} className="w-full rounded-lg bg-[#8D99AE] border-2 border-[#EF233C] px-4 py-2 font-semibold text-[#EDF2F4] transition hover:bg-[#EF233C]">
                            Continue as Guest
                        </button>
                        <p className="text-xs text-[#EDF2F4] mt-2 opacity-80">
                            Try Strive with up to 5 free workouts
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
};

// Export Login
export default Login;