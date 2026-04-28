// ResetPassword.jsx

import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

// Components
import AuthHeader from '../components/headers/AuthHeader.jsx'

// Redux
import { resetPassword, reset } from '../features/auth/authSlice.js'

const ResetPassword = () => {
    const { token } = useParams()
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const { isLoading, isError, isSuccess, message } = useSelector( (state) => state.auth )

    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    })

    const { password, confirmPassword } = formData

    useEffect(() => {
        if (isError) {
            toast.error(message)
        }

        if (isSuccess) {
            toast.success('Password reset successful')
            navigate('/login')
        }

        dispatch(reset())
    }, [isError, isSuccess, message, navigate, dispatch])

    const onChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    const onSubmit = (e) => {
        e.preventDefault()

        if (!password || !confirmPassword) {
            toast.error('Please fill in all fields')
            return
        }

        if (password !== confirmPassword) {
            toast.error('Passwords do not match')
            return
        }

        dispatch(resetPassword({ token, password }))
    }

    return (
        <>
            <AuthHeader />
            <div className="flex min-h-screen items-center justify-center px-4">
                <div className="w-full max-w-md rounded-2xl bg-[#8D99AE] p-8 shadow-lg">

                    <h1 className="mb-6 text-center text-3xl font-bold text-[#EDF2F4]">
                        Reset Password
                    </h1>

                    <form onSubmit={onSubmit} className="space-y-4">

                        <input
                            type="password"
                            name="password"
                            placeholder="New Password"
                            className="w-full rounded-lg border border-[#EDF2F4]/40 bg-[#2B2D42] px-4 py-2 text-[#EDF2F4]"
                            value={password}
                            onChange={onChange}
                        />

                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm Password"
                            className="w-full rounded-lg border border-[#EDF2F4]/40 bg-[#2B2D42] px-4 py-2 text-[#EDF2F4]"
                            value={confirmPassword}
                            onChange={onChange}
                        />

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full rounded-lg bg-[#EF233C] px-4 py-2 font-semibold text-[#EDF2F4]"
                        >
                            {isLoading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>

                </div>
            </div>
        </>
    )
}

export default ResetPassword