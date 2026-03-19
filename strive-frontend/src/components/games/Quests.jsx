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

    const { user } = useSelector((state) => state.auth)
    const { quests, isLoading } = useSelector((state) => state.quest)
    const { workouts } = useSelector((state) => state.workout)
    const { daily, weekly, monthly } = quests

    useEffect(() => {
        if (!user?.isQuest && workouts.length >= 3) {
            dispatch(getQuests())
        }

        return () => {
            dispatch(reset())
        }
    }, [dispatch])

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
                    <div className='quest-scroll flex md:grid md:grid-cols-3 gap-4 overflow-x-auto md:overflow-visible snap-x snap-mandatory px-2'>                        
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
                    <div className='quest-scroll flex md:grid md:grid-cols-2 gap-4 overflow-x-auto md:overflow-visible snap-x snap-mandatory px-2'>
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
                    <div className='flex justify-center w-full'>
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