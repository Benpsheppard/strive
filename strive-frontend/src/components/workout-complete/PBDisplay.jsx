// PBDisplay.jsx

// Imports
import { FaTrophy } from 'react-icons/fa'
import { formatWeight } from '../../utils/formatValues'

const PBDisplay = ({ workout, user }) => {
    return (
        <div className="fade-in-card bg-[#8D99AE] rounded-2xl px-6 py-5" style={{ animationDelay: '0.6s' }}>
            <h2 className="text-[#EDF2F4] font-semibold text-lg mb-4 flex items-center gap-2">
                <FaTrophy className="text-[#EF233C]" /> Personal Bests
            </h2>
            {workout.summary.personalBests.length > 0 ? (
                <div className="space-y-3">
                    {workout.summary.personalBests.map((pb, index) => (
                        <div key={index} className="bg-[#2B2D42] rounded-xl px-4 py-3 flex justify-between items-center">
                            <div>
                                <p className="text-[#EDF2F4] font-semibold">{pb.exercise} ({pb.equipment})</p>
                                <p className="text-[#EDF2F4]/40 text-sm">
                                    {formatWeight(pb.previousValue, user.useImperial)} → <span className="text-[#EF233C] font-bold">{formatWeight(pb.newValue, user.useImperial)}</span>
                                </p>
                            </div>
                            <p className="text-[#EF233C] font-bold">+500 SP</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-[#EDF2F4]/40 text-center">
                    No Personal Bests hit this session
                </p>
            )}
        </div>
    )
}

export default PBDisplay