// Games.jsx

// Imports
import { useSelector } from 'react-redux'

// Component Imports
import Header from '../components/headers/Header'
import Quests from '../components/games/Quests.jsx'
import Spinner from '../components/spinners/Spinner.jsx'
import ProgressBar from '../components/games/ProgressBar.jsx'

const Games = () => {
    const { user, isLoading } = useSelector((state) => state.auth)

    if (isLoading) {
        return <Spinner />
    }

    return (
        <section className="min-h-screen mt-0 md:mt-20 flex flex-col items-center px-4 pb-32">
            <Header />
            {user?.isGuest && <GuestHeader currentWorkouts={workouts.length}/>}

            {/* Title */}
            <h1 className="text-5xl md:text-6xl font-semibold text-[#EDF2F4] text-center p-4">
                Strive <span className='text-[#EF233C]'>Games</span>
            </h1>
            
            <div className='space-y-6 w-full'>
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

                    {/* Progress Bar */}
                    <ProgressBar />
                </div>

                {/* Quest lists */}
                <Quests />
            </div>
        </section>
    )
}

export default Games