// StrivePointsEarned.jsx

// Imports
import { FaStar } from 'react-icons/fa'

const StrivePointsEarned = ({ workout }) => {
    const getRating = (score) => {
        if (score <= 0.9) return {label: "BUILDING", colour: "#B8C4D6"}
        if (score <= 1.0) return {label: "SOLID", colour: "#22C55E"}
        if (score <= 1.05) return {label: "GREAT", colour: "#0077B6"}
        if (score <= 1.1) return {label: "EXCELLENT", colour: "#6A4C93"}
        if (score <= 1.25) return {label: "ELITE", colour: "#FFD700"}
        return {label: "LEGENDARY", colour: "#A7D8DE"}
    }

    const categories = [
        {
            title: "Volume",
            data: workout.summary.totalStrivePoints.volume,
        },
        {
            title: "Strength",
            data: workout.summary.totalStrivePoints.strength,
        },
        {
            title: "Progression",
            data: workout.summary.totalStrivePoints.progression,
        },
    ]      

    return (
        <div className="fade-in-card bg-[#8D99AE] rounded-2xl px-6 py-5" style={{ animationDelay: '0.4s' }}>
            <h2 className="text-[#EDF2F4] font-semibold text-lg mb-4 flex items-center gap-2">
                <FaStar className="text-[#EF233C]" /> Strive Points Earned
            </h2>

            <div className="text-center mb-5">
                <p className="text-[#EF233C] text-7xl font-bold">+{workout.summary.totalStrivePoints.total} SP</p>
            </div>

            <div className="flex flex-col items-center space-y-1 mb-3 p-2 border-t border-[#EDF2F4]/20">
                <h2 className="text-[#EDF2F4] font-semibold text-xl flex items-center gap-2">
                    Base Points
                </h2>
                
                <div className="grid grid-cols-3 gap-3">
                    {categories.map(category => {
                        const rating = getRating(category.data.score)

                        return (
                            <div
                                key={category.title}
                                className="flex flex-col items-center text-sm text-[#EDF2F4] bg-[#8D99AE] shadow-xl rounded-xl p-4 border-2"
                                style={{ borderColor: rating.colour }}
                            >
                                <p className="font-bold">{category.title}</p>

                                <p>+{category.data.reward} SP</p>

                                <p
                                    className="font-bold tracking-widest text-xs mt-1"
                                    style={{ color: rating.colour }}
                                >
                                    {rating.label}
                                </p>
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className="flex flex-col items-center space-y-1 mb-3 p-2 border-t border-[#EDF2F4]/20">
                <h2 className="text-[#EDF2F4] font-semibold text-xl flex items-center gap-2">
                    Multipliers
                </h2>

                <div className="grid grid-cols-2 gap-3 items-center text-center">
                    <div className="flex flex-col items-center text-sm text-[#EDF2F4] bg-[#8D99AE] shadow-xl rounded-xl p-4 border-2 border-[#EF27A6]">
                        <p className="font-bold">Consistency</p>
                        <p>x{workout.summary.totalStrivePoints.consistencyMultiplier}</p>
                    </div>

                    <div className="flex flex-col items-center text-sm text-[#EDF2F4] bg-[#8D99AE] shadow-xl rounded-xl p-4 border-2 border-[#6A4C93]">
                        <p className="font-bold">Momentum</p>
                        <p>x{workout.summary.totalStrivePoints.momentumMultiplier}</p>
                    </div>
                </div>
            </div>
            
            {workout.summary.totalStrivePoints.bonus != 0 &&
                <div className="flex flex-col items-center space-y-1 mb-3 p-2 border-t border-[#EDF2F4]/20">
                    <h2 className="text-[#EDF2F4] font-semibold text-xl flex items-center gap-2">
                        Weekly Target Hit!
                    </h2>
                    <p className="text-sm text-[#EDF2F4]">+{workout.summary.totalStrivePoints.bonus}SP</p>
                </div>
            }
        </div>
    )
}

export default StrivePointsEarned