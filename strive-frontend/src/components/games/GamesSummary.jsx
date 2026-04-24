// GamesSummary.jsx

// Imports
import { formatNumber } from "../../utils/formatValues"

// Component Imports
import ProgressBar from "./ProgressBar"

const GamesSummary = ({ user }) => {
    const currentLevel = user.level

    const currentLevelMinSP = 100 * Math.pow(currentLevel - 1, 2)
    const nextLevelMinSP = 100 * Math.pow(currentLevel, 2)

    const progressWithinLevel = user.strivepoints - currentLevelMinSP
    const totalSPForLevel = nextLevelMinSP - currentLevelMinSP

    const spToNextLevel = nextLevelMinSP - user.strivepoints

    return (
        <div className='fade-in-card bg-[#8D99AE] p-6 rounded-2xl shadow-lg text-center' style={{ animationDelay: '0.2s' }}>
            <p className='text-[#EDF2F4] text-xl font-semibold'>
                Level: <span className='text-[#EF233C]'>{user?.level}</span>
            </p>
            <p className='text-[#EDF2F4] text-xl font-semibold'>
                Strive Points: <span className='text-[#EF233C]'>{formatNumber(user?.strivepoints, 0)} SP</span>
            </p>

            {/* Progress Bar */}
            <div className='mt-4'>
                <ProgressBar numerator={progressWithinLevel} denominator={totalSPForLevel} unit={'SP'} />

                {/* SP needed for next level */}
                <p className='mt-2 text-sm text-[#EDF2F4]/80'>
                    {spToNextLevel} SP until Level {currentLevel + 1}
                </p>
            </div>
        </div>
    )
}

export default GamesSummary