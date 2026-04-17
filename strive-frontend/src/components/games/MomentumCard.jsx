// MomentumCard.jsx

// Component Imports
import ProgressBar from "./ProgressBar.jsx"

const MomentumCard = ({ user }) => {
    const getMomentumLabel = (momentum) => {
        if (momentum <= 20) return 'Warming Up'
        if (momentum <= 40) return 'Building'
        if (momentum <= 60) return 'Consistent'
        if (momentum <= 80) return 'Locked In'
        return 'Peak'
    }

    return (
        <div className="flex flex-col items-center p-6 w-full space-y-3 bg-[#8D99AE] shadow rounded-2xl text-[#EDF2F4]">
            <h2 className="font-bold text-2xl">
                Current Momentum
            </h2>
            
            <div className='flex items-center space-x-2 text-4xl'>
                <h2 className='font-bold text-[#EF233C]'>
                    {getMomentumLabel(user.momentum.current)}
                </h2>
            </div>

            <p className="text-sm text-[#EDF2F4]">Increase your momentum by completing a workout!</p>

            <ProgressBar numerator={user.momentum.current} denominator={100} />
        </div>
    )
}

export default MomentumCard