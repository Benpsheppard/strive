// ProgressBar.jsx

// Imports
import { useSelector } from 'react-redux'

const ProgressBar = () => {
    const { user } = useSelector((state) => state.auth)

    const currentLevel = user.level

    const currentLevelMinSP = 100 * Math.pow(currentLevel - 1, 2)
    const nextLevelMinSP = 100 * Math.pow(currentLevel, 2)

    const progressWithinLevel = user.strivepoints - currentLevelMinSP
    const totalSPForLevel = nextLevelMinSP - currentLevelMinSP

    const progressPercentage = (progressWithinLevel / totalSPForLevel) * 100

    const spToNextLevel = nextLevelMinSP - user.strivepoints

    return (
        <div className='mt-4'>
            <div className='relative w-full bg-[#2B2D42] rounded-full h-6 overflow-hidden'>

                {/* Fill */}
                <div className='bg-[#EF233C] h-6 transition-all duration-500 ease-out' style={{ width: `${progressPercentage}%` }} />

                {/* Text Overlay */}
                <div className='absolute inset-0 flex items-center justify-center'>
                    <span className='text-xs font-bold text-white'>
                        {Math.floor(progressWithinLevel)} / {totalSPForLevel} SP
                    </span>
                </div>
            </div>

            {/* SP needed for next level */}
            <p className='mt-2 text-sm text-[#EDF2F4]/80'>
                {spToNextLevel} SP until Level {currentLevel + 1}
            </p>
        </div>
    )
}

export default ProgressBar