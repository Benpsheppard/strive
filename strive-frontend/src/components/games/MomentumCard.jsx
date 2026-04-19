// MomentumCard.jsx

// Component Imports
import ProgressBar from "./ProgressBar.jsx"

const MomentumCard = ({ user }) => {
    const MOMENTUM_TIERS = [
        { threshold: 20,  label: 'Warming Up',  multiplier: 1   },
        { threshold: 40,  label: 'Building',    multiplier: 1.2 },
        { threshold: 60,  label: 'Consistent',  multiplier: 1.4 },
        { threshold: 80,  label: 'Locked In',   multiplier: 1.6 },
        { threshold: 99,  label: 'Unstoppable', multiplier: 1.8 },
        { threshold: 100, label: 'Peak',        multiplier: 2   },
    ]

    const getMomentumInfo = (momentum) => {
        return MOMENTUM_TIERS.find(tier => momentum <= tier.threshold) 
            ?? MOMENTUM_TIERS.at(-1)
    }

    const { label, multiplier } = getMomentumInfo(user.momentum.current)

    return (
        <div className="flex flex-col items-center p-6 w-full space-y-3 bg-[#8D99AE] shadow rounded-2xl text-[#EDF2F4]">
            <h2 className="font-bold text-2xl">
                Current Momentum
            </h2>
            
            <div className='flex items-center space-x-2 text-4xl'>
                <h2 className='animate-pulse-label font-bold text-[#EF233C]'>
                    {label}
                </h2>
            </div>

            <p className="text-sm text-[#EDF2F4]">
                Current multiplier: {multiplier}x
            </p>

            <ProgressBar numerator={user.momentum.current} denominator={100} />
        </div>
    )
}

export default MomentumCard