// PBDisplay.jsx

// Imports
import { FaTrophy } from 'react-icons/fa'
import { formatWeight, formatDistance, formatSeconds, formatNumber } from '../../utils/formatValues'

const PB_REWARD_PER_PB = 500
const FIRST_LIFT_REWARD = 50

// Format a PB value according to the metric it was measured in
const formatPBValue = (metric, value, useImperial) => {
    switch (metric) {
        case 'max_reps':
            return `${formatNumber(value)} reps`
        case 'best_duration':
            return formatSeconds(value)
        case 'total_distance':
            return formatDistance(value, useImperial)
        case 'max_weight':
        default:
            return formatWeight(value, useImperial)
    }
}

const PBDisplay = ({ workout, user }) => {
    const personalBests = workout.summary?.personalBests || []
    const firstLifts = workout.summary?.firstLifts || []
    const reward = workout.summary?.totalStrivePoints?.personalBestsReward
    const rewardPerPB = reward && personalBests.length > 0 ? reward / personalBests.length : PB_REWARD_PER_PB

    return (
        <div className="fade-in-card bg-[#8D99AE] rounded-2xl px-6 py-5" style={{ animationDelay: '0.6s' }}>
            <h2 className="text-[#EDF2F4] font-semibold text-lg mb-4 flex items-center gap-2">
                <FaTrophy className="text-[#EF233C]" /> Personal Bests
            </h2>
            {personalBests.length > 0 ? (
                <div className="space-y-3">
                    {personalBests.map((pb, index) => (
                        <div key={index} className="bg-[#EDF2F4]/30 rounded-xl px-4 py-3 flex justify-between items-center">
                            <div>
                                <p className="text-[#EDF2F4] font-semibold">{pb.exercise} ({pb.equipment})</p>
                                <p className="text-[#EDF2F4]/40 text-sm">
                                    {formatPBValue(pb.metric, pb.previousValue, user.useImperial)} → <span className="text-[#EF233C] font-bold">{formatPBValue(pb.metric, pb.newValue, user.useImperial)}</span>
                                </p>
                            </div>
                            <p className="text-[#EF233C] font-bold">+{formatNumber(rewardPerPB)} SP</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-[#EDF2F4]/40 text-center">
                    No Personal Bests hit this session
                </p>
            )}

            {firstLifts.length > 0 && (
                <div className="space-y-3 mt-4">
                    <h3 className="text-[#EDF2F4] font-semibold text-sm">First time logged</h3>
                    {firstLifts.map((lift, index) => (
                        <div key={index} className="bg-[#EDF2F4]/30 rounded-xl px-4 py-3 flex justify-between items-center">
                            <p className="text-[#EDF2F4] font-semibold">{lift.exercise} ({lift.equipment})</p>
                            <p className="text-[#EF233C] font-bold">+{FIRST_LIFT_REWARD} SP</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default PBDisplay
