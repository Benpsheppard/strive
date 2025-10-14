// Register.jsx
// File to hold Register page layout and functionality

// Imports
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react'; 
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { register, reset } from '../features/auth/authSlice.js';
import Spinner from '../components/Spinner.jsx';
import AuthHeader from '../components/AuthHeader.jsx';

const Register = () => {

    // Set fields to blank
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        password: '',
        password2: ''
    })

    // Desconstruct data from form data
    const { email, username, password, password2 } = formData; 

    // Password criteria
    const passwordChecks = {
        length: password.length >= 8,
        lowercase: /[a-z]/.test(password),
        uppercase: /[A-Z]/.test(password),
        number: /[0-9]/.test(password),
        symbol: /[^A-Za-z0-9]/.test(password)
    };


    // Nav and Dispatch initialisation
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { user, isLoading, isError, isSuccess, message } = useSelector((state) => state.auth);    // Destructure current state

    useEffect(() => {
        // Output error
        if (isError) {
            toast.error(message);
        }

        // Navigate user to dashboard
        if (isSuccess || user) {
            navigate('/');
        }

        // Reset state to normal
        dispatch(reset());

    }, [user, isError, isSuccess, message, navigate, dispatch]);

    // When form inputted, change what is displayed
    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value
        }))
    }

    // When form is submitted
    const onSubmit = (e) => {
        e.preventDefault();

        // Check passwords match 
        if(password !== password2) {
            toast.error("Passwords do not match!");
            return;
        }

        // User data object
        const userData = {
            username,
            email,
            password
        }

        // Dispatch register
        dispatch(register(userData));
    }

    // If loading, show spinner
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
                            - Register -
                        </h2>
                        {/* Email input */}
                        <input
                            type="email"
                            id="email"
                            unique="true"
                            required
                            placeholder="Email@gmail.com"
                            className="w-full rounded-lg border border-[#EDF2F4]/40 bg-[#2B2D42] px-4 py-2 text-[#EDF2F4] placeholder-gray-300 focus:border-[#EF233C] focus:outline-none focus:ring-2 focus:ring-[#EF233C]/40"
                            name="email"
                            value={email}
                            onChange={onChange}
                        />
                        {/* Username input */}
                        <input
                            type="text"
                            id="username"
                            required
                            placeholder="Username"
                            className="w-full rounded-lg border border-[#EDF2F4]/40 bg-[#2B2D42] px-4 py-2 text-[#EDF2F4] placeholder-gray-300 focus:border-[#EF233C] focus:outline-none focus:ring-2 focus:ring-[#EF233C]/40"
                            name="username"
                            value={username}
                            onChange={onChange}
                        />
                        {/* Password input */}
                        <input
                            type="password"
                            id="password"
                            required
                            placeholder="Password"
                            className="w-full rounded-lg border border-[#EDF2F4]/40 bg-[#2B2D42] px-4 py-2 text-[#EDF2F4] placeholder-gray-300 focus:border-[#EF233C] focus:outline-none focus:ring-2 focus:ring-[#EF233C]/40"
                            name="password"
                            value={password}
                            onChange={onChange}
                        />
                        {/* Password checks */}
                        <ul className="text-[#EDF2F4] list-disc ml-5">
                            {!passwordChecks.length && <li>At least 8 characters</li>}
                            {!passwordChecks.lowercase && <li>At least one lowercase letter</li>}
                            {!passwordChecks.uppercase && <li>At least one uppercase letter</li>}
                            {!passwordChecks.number && <li>At least one number</li>}
                            {!passwordChecks.symbol && <li>At least one symbol</li>}
                        </ul>

                        {/* Confirm password input */}
                        <input
                            type="password"
                            id="password2"
                            required
                            placeholder="Confirm Password"
                            className="w-full rounded-lg border border-[#EDF2F4]/40 bg-[#2B2D42] px-4 py-2 text-[#EDF2F4] placeholder-gray-300 focus:border-[#EF233C] focus:outline-none focus:ring-2 focus:ring-[#EF233C]/40"
                            name="password2"
                            value={password2}
                            onChange={onChange}
                        />
                        {/* Link to login */}
                        <p className="text-center text-sm text-[#EDF2F4]">
                            Already have an account?
                            <Link to="/login" className="text-[#EF233C] hover:text-[#D90429] hover:underline">
                                Login Here
                            </Link>
                        </p>
                        {/* Submit form */}
                        <button id="RegisterBtn" type="submit" className="w-full rounded-lg bg-[#EF233C] px-4 py-2 font-semibold text-[#EDF2F4] transition hover:bg-[#D90429]">
                            Register
                        </button>
                    </form>
                </div>
            </div>
        </>
    )
};

// Export Register
export default Register;