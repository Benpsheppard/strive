// ForgotPassword.jsx

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { toast } from "react-toastify"

import AuthHeader from "../components/headers/AuthHeader.jsx"
import { forgotPassword, reset } from "../features/auth/authSlice.js"

const ForgotPassword = () => {
    const [email, setEmail] = useState('')

    const dispatch = useDispatch()

    const { isLoading, isError, isSuccess, message } = useSelector((state) => state.auth)

    useEffect(() => {
        if (isError) {
            toast.error(message)
        }

        if (isSuccess) {
            toast.success('If an account exists, a reset link has been sent')
        }

        dispatch(reset())
    }, [isError, isSuccess, message, dispatch])

    const onSubmit = (e) => {
        e.preventDefault()

        if (!email.trim()) {
            toast.error('Please enter your email')
            return
        }

        dispatch(forgotPassword({ email }))
    }

    return (
        <>
            <AuthHeader />
            <div className="flex min-h-screen items-center justify-center px-4">
                <div className="w-full max-w-md rounded-2xl bg-[#8D99AE] p-8 shadow-lg">

                    <form onSubmit={onSubmit} className="space-y-4">
                        <h2 className="mb-2 text-center text-xl font-semibold text-[#EDF2F4]">
                            Forgot Password
                        </h2>

                        <input
                            type="email"
                            required
                            placeholder="Email *"
                            className="w-full rounded-lg border border-[#EDF2F4]/40 bg-[#2B2D42] px-4 py-2 text-[#EDF2F4]"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <p className="text-center text-sm text-[#EDF2F4]">
                            Don't need a reset?{' '}
                            <Link to="/login" className="text-[#EF233C] hover:underline">
                                Login Here
                            </Link>
                        </p>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full rounded-lg bg-[#EF233C] px-4 py-2 font-semibold text-[#EDF2F4]"
                        >
                            {isLoading ? 'Sending...' : 'Send'}
                        </button>
                    </form>

                </div>
            </div>
        </>
    )
}

export default ForgotPassword