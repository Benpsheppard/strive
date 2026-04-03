// QuestCard.jsx

// Imports
import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'

const QuestCard = ({ quest }) => {
    const { user } = useSelector((state) => state.auth)


    const [isOpen, setIsOpen] = useState(false)
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768)
        }

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    return (
        <div onClick={() => {if (isMobile) setIsOpen(!isOpen)}} className={`rounded-2xl shadow-xl bg-[#2B2D42] text-[#EDF2F4] overflow-hidden transition-all duration-300 ${quest.status === 'completed' ? 'opacity-50' : ''} ${isOpen || !isMobile ? 'h-auto' : 'h-[75px] overflow-y-hidden'}`} >
            {/* Main content */}
            <div className='p-5'>
                {/* Header */}
                <div className='flex flex-col justify-between items-center'>
                    <h3 className={`text-2xl text-[#EF233C] font-bold ${isOpen ? '' : 'pb-6'}`}>{quest.title}</h3>
                    <p>{quest.description}</p>
                </div>

                {/* Completion */}
                <div className='flex justify-between items-center mt-4 pt-3 border-t border-[#EDF2F4]/20 text-sm'>
                    <p className='font-semibold'>{quest.completion.exercise}</p>
                    <p>{quest.completion.weight}{user.useImperial ? ' lbs' : ' kg'} x {quest.completion.reps} reps</p>
                </div>

                {/* Footer */}
                <div className='flex justify-between items-center mt-4 pt-3 border-t border-[#EDF2F4]/20 text-sm'>
                    <span className='font-semibold'>Reward: {quest.reward} SP</span>

                    {quest.status === 'active' ? (
                        <span className='text-sm text-[#EDF2F4]/20'>
                            Expires:{' '}
                            {new Date(quest.expiry).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short'
                            })}
                        </span>
                    ) : (
                        <span className='text-sm text-[#EDF2F4]/20'>Completed</span>
                    )}
                </div>
            </div>
        </div>
    )
}

export default QuestCard