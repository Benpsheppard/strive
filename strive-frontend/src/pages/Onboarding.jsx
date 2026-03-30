// Onboarding.jsx

import { useSelector, useDispatch } from 'react-redux'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { updateProfile } from '../features/auth/authSlice.js'
import Picker from 'react-mobile-picker'
import AuthHeader from '../components/headers/AuthHeader'

const Onboarding = () => {
    const { user } = useSelector((state) => state.auth)

    const [formData, setFormData] = useState({
        target: '3',
        height: {
            feet: '5',
            inches: '8'
        },
        weight: '0'
    })

    const navigate = useNavigate()
    const dispatch = useDispatch()

    const onSubmit = (e) => {
        e.preventDefault()

        try {
            dispatch(updateProfile(formData))
        } catch (error) {
            console.error('Error during onboarding submission:', error)
        }

        navigate('/')
    }

    return (
        <section className="min-h-screen mt-0 md:mt-20 flex flex-col items-center px-4 pb-32 pt-20 space-y-3">
            <AuthHeader />

            <div className="text-4xl md:text-6xl font-semibold text-[#EDF2F4] text-center p-4">
                <h1>
                    Welcome to Strive{' '}
                    <span className="text-[#EF233C]">
                        {user.isGuest ? 'Guest' : user.username}
                    </span>
                </h1>
            </div>

            <div className='p-6 w-full sm:max-w-2xl mx-auto text-[#EDF2F4] bg-[#8D99AE] shadow rounded-2xl text-center'>
                <h2 className='text-2xl'>
                    Enter your <span className="text-[#EF233C]">height, weight</span> and{' '}
                    <span className="text-[#EF233C]">consistency target</span>
                </h2>
            </div>

            <form onSubmit={onSubmit} className='space-y-4 w-full flex flex-col items-center'>

                {/* Height */}
                <div className='p-6 w-full sm:max-w-2xl text-[#EDF2F4] bg-[#8D99AE] text-center shadow rounded-2xl'>
                    <h2 className='text-xl mb-4'>
                        How <span className="text-[#EF233C]">Tall</span> are you?
                    </h2>

                    <Picker
                        value={formData.height}
                        onChange={(val) =>
                            setFormData({
                                ...formData,
                                height: val
                            })
                        }
                    >
                        <Picker.Column name="feet">
                            {['4', '5', '6', '7'].map(option => (
                                <Picker.Item key={option} value={option}>
                                    {option} ft
                                </Picker.Item>
                            ))}
                        </Picker.Column>

                        <Picker.Column name="inches">
                            {Array.from({ length: 12 }, (_, i) => i.toString()).map(option => (
                                <Picker.Item key={option} value={option}>
                                    {option} in
                                </Picker.Item>
                            ))}
                        </Picker.Column>
                    </Picker>
                </div>

                {/* Weight */}
                <div className='p-6 w-full sm:max-w-2xl text-[#EDF2F4] bg-[#8D99AE] text-center shadow rounded-2xl'>
                    <h2 className='text-xl mb-4'>
                        What is your <span className="text-[#EF233C]">weight</span>?
                    </h2>

                    <input
                        type="number"
                        placeholder="Enter weight (kg)"
                        value={formData.weight}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                weight: e.target.value
                            })
                        }
                        className="p-2 rounded text-[#2B2D42] w-full max-w-xs text-center"
                    />
                </div>

                {/* Weekly Target */}
                <div className='p-6 w-full sm:max-w-2xl text-[#EDF2F4] bg-[#8D99AE] text-center shadow rounded-2xl'>
                    <h2 className='text-xl mb-4'>
                        How many workouts per <span className="text-[#EF233C]">week?</span>
                    </h2>

                    <Picker
                        value={{ target: formData.target }}
                        onChange={(val) =>
                            setFormData({
                                ...formData,
                                target: val.target
                            })
                        }
                    >
                        <Picker.Column name="target">
                            {['1', '2', '3', '4', '5', '6', '7'].map(option => (
                                <Picker.Item key={option} value={option}>
                                    {option}
                                </Picker.Item>
                            ))}
                        </Picker.Column>
                    </Picker>
                </div>

                {/* Submit */}
                <div className="space-y-4 p-4 w-full sm:max-w-2xl mx-auto bg-[#8D99AE] shadow rounded-2xl flex flex-col items-center">
                    <button
                        type="submit"
                        className="w-full bg-[#EF233C] text-[#EDF2F4] p-2 rounded transition hover:bg-[#D90429]"
                    >
                        Submit
                    </button>
                </div>
            </form>
        </section>
    )
}

export default Onboarding