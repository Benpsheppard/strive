// Games.jsx

// Imports
import { useSelector } from 'react-redux'

// Component Imports
import Header from '../components/headers/Header'
import Quests from '../components/games/Quests.jsx'
import Spinner from '../components/spinners/Spinner.jsx'

const Games = () => {
    const { user, isLoading } = useSelector((state) => state.auth)

    if (isLoading) {
        return <Spinner />
    }

    return (
        <>
            <Header />

            <section className='min-h-screen bg-[#2B2D42] text-[#EDF2F4] px-6 mt-15'>
                {/* Title */}
                <h1 className='p-4 text-[#EDF2F4] text-6xl font-semibold text-center'>
                    Strive <span className='text-[#EF233C]'>Games</span>
                </h1>
                
                <div className='space-y-5'>
                    {/* User Games' Summary */}
                    <div className='bg-[#8D99AE] p-6 rounded-2xl shadow-lg text-center'>
                        <h2 className='text-[#EDF2F4] text-3xl font-bold'>
                            {user.username}
                        </h2>
                        <p className='text-[#EDF2F4] text-xl font-semibold'>
                            Level: <span className='text-[#EF233C]'>{user?.level}</span>
                        </p>
                        <p className='text-[#EDF2F4] text-xl font-semibold'>
                            Strive Points: <span className='text-[#EF233C]'>{user?.strivepoints} SP</span>
                        </p>
                    </div>

                    {/* Quest lists */}
                    <Quests />
                </div>
            </section>
        </>
    )
}

export default Games