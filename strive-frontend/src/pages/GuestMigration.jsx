// GuestMigration.jsx

// Imports
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react' 
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

// Function Imports
import { migrate } from '../features/auth/authSlice'

// Component Imports
import AuthHeader from '../components/headers/AuthHeader'
import Spinner from '../components/spinners/Spinner'

const GuestMigration = () => {
    const { user, isLoading, isError, isSuccess, message } = useSelector((state) => state.auth)

    const navigate = useNavigate()
    const dispatch = useDispatch()

    // Set fields to blank
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        password: '',
        password2: ''
    })

    // Desconstruct data from form data
    const { email, username, password, password2 } = formData 

    // Password criteria
    const passwordChecks = {
        length: password.length >= 8,
        lowercase: /[a-z]/.test(password),
        uppercase: /[A-Z]/.test(password),
        number: /[0-9]/.test(password),
        symbol: /[^A-Za-z0-9]/.test(password)
    }

    // Submit form
    const onSubmit = (e) => {
        e.preventDefault()

        // Check passwords match 
        if(password !== password2) {
            toast.error("Passwords do not match!")
            return
        }

        // User data object
        const userData = {
            username,
            email,
            password
        }

        // Dispatch register
        dispatch(migrate(userData))
    }

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value
        }))
    }

    useEffect(() => {
        if (!user) {
            navigate('/login')
            return
        }

        if (!user.isGuest) {
            navigate('/')
            return
        }

        if (isError) {
            toast.error(message)
        }

        if (isSuccess && !user.isGuest) {
            toast.success('Account migrated successfully')
            navigate('/')
        }

    }, [user, isError, isSuccess, message, navigate])

    if (isLoading) {
        return (
            <Spinner />
        )
    }

    return (
        <>
            <AuthHeader />
            <div className="flex min-h-screen items-center justify-center px-4">
                <div className="w-full max-w-md rounded-2xl bg-[#8D99AE] p-8 shadow-lg">
                    
                    {/* Title */}
                    <h1 className="mb-6 text-center text-3xl font-bold text-[#EDF2F4]">
                        Welcome to <span className="text-[#EF233C]">Strive</span>
                    </h1>

                    {/* Form */}
                    <form onSubmit={onSubmit} className="space-y-4">
                        <h2 className="mb-2 text-center text-xl font-semibold text-[#EDF2F4]">
                            Migrate
                        </h2>
                        {/* Email input */}
                        <input
                            type="email"
                            id="email"
                            unique="true"
                            required
                            placeholder="Email@gmail.com *"
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
                            placeholder="Username *"
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
                            placeholder="Password *"
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
                            placeholder="Confirm Password *"
                            className="w-full rounded-lg border border-[#EDF2F4]/40 bg-[#2B2D42] px-4 py-2 text-[#EDF2F4] placeholder-gray-300 focus:border-[#EF233C] focus:outline-none focus:ring-2 focus:ring-[#EF233C]/40"
                            name="password2"
                            value={password2}
                            onChange={onChange}
                        />
                        
                        {/* Submit form */}
                        <button id="RegisterBtn" type="submit" className="w-full rounded-lg bg-[#EF233C] px-4 py-2 font-semibold text-[#EDF2F4] transition hover:bg-[#D90429]">
                            Migrate
                        </button>
                    </form>
                </div>
            </div>
        </>
    )
}

export default GuestMigration