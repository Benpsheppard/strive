// Quests.jsx

// Imports
import { useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'

// Function Imports
import { reset, getQuests } from '../../features/quests/questSlice'

// Component Imports
import QuestCard from './QuestCard'
import InlineSpinner from '../spinners/InlineSpinner'

const Quests = () => {
    const dispatch = useDispatch()

    const { quests, isLoading } = useSelector((state) => state.quest)
    const { daily, weekly, monthly } = quests

    useEffect(() => {
        dispatch(getQuests())

        return () => {
            dispatch(reset())
        }
    }, [dispatch])

    console.log('isLoading:', isLoading, 'quests:', quests)

    return (
        <>
            {/* Daily Quests */}
            <div className='bg-[#8D99AE] p-6 rounded-2xl shadow-lg text-center'>
                <h2 className='text-[#EDF2F4] text-2xl font-bold'>
                    Daily Quests
                </h2>

                {isLoading ? (
                    <InlineSpinner />
                ) : quests.daily ? (
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                        {daily.map(q => (
                            <QuestCard key={q._id} quest={q} />
                        ))}
                    </div>
                ) : (
                    <>
                        <h1 className='text-lg text-[#EDF2F4] font-bold' >No Active Daily Quests</h1>
                        <p>Come back tomorrow for new Quests!</p>
                    </>
                )}
            </div>

            {/* Weekly Quests */}
            <div className='bg-[#8D99AE] p-6 rounded-2xl shadow-lg text-center'>
                <h2 className='text-[#EDF2F4] text-2xl font-bold'>
                    Weekly Quests
                </h2>

                {isLoading ? (
                    <InlineSpinner />
                ) : quests.weekly ? (
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        {weekly.map(q => (
                            <QuestCard key={q._id} quest={q} />
                        ))}
                    </div>
                ) : (
                    <>
                    <h1 className='text-lg text-[#EDF2F4] font-bold'>No Active Weekly Quests</h1>
                    <p>Come back next week for new Quests!</p>
                    </>
                )}
            </div>

            {/* Monthly Quest */}
            <div className='bg-[#8D99AE] p-6 rounded-2xl shadow-lg text-center'>
                <h2 className='text-[#EDF2F4] text-2xl font-bold'>
                    Monthly Quests
                </h2>

                {isLoading ? (
                    <InlineSpinner />
                ) : quests.monthly ? (
                    <div className='grid grid-cols-1 md:grid-cols-1 gap-4'>
                        {monthly.map(q => (
                            <QuestCard key={q._id} quest={q} />
                        ))}
                    </div>
                ) : (
                    <>
                    <h1 className='text-lg text-[#EDF2F4] font-bold'>No Active Monthly Quests</h1>
                    <p>Come back next month for a new Quest!</p>
                    </>
                )}
            </div>
        </>
    )
}

export default Quests