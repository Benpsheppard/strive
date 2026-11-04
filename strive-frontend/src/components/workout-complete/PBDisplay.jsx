// PBDisplay.jsx
// Personal bests set in this workout, plus first-time exercises

import { FaTrophy } from 'react-icons/fa'
import Card, { CardTitle } from '../ui/Card.jsx'
import { formatNumber } from '../../utils/formatValues'
import { formatPBValue } from '../../utils/trackingModes.js'

const PB_REWARD_PER_PB = 500
const FIRST_LIFT_REWARD = 50

const PBDisplay = ({ workout, user }) => {
    const personalBests = workout.summary?.personalBests || []
    const firstLifts = workout.summary?.firstLifts || []
    const reward = workout.summary?.totalStrivePoints?.personalBestsReward
    const rewardPerPB = reward && personalBests.length > 0 ? reward / personalBests.length : PB_REWARD_PER_PB

    return (
        <Card as="section" aria-labelledby="pb-title" className="space-y-3">
            <CardTitle id="pb-title" className="flex items-center gap-2">
                <FaTrophy aria-hidden="true" className="text-accent-fg" /> Personal bests
            </CardTitle>

            {personalBests.length > 0 ? (
                <ul className="space-y-2">
                    {personalBests.map((pb, index) => (
                        <li key={index} className="flex items-center justify-between gap-3 rounded-xl bg-bg/60 px-4 py-3">
                            <div>
                                <p className="font-semibold text-fg">{pb.exercise} ({pb.equipment})</p>
                                <p className="text-sm text-muted">
                                    {formatPBValue(pb.metric, pb.previousValue, user.useImperial)} → <span className="font-bold text-accent-fg">{formatPBValue(pb.metric, pb.newValue, user.useImperial)}</span>
                                </p>
                            </div>
                            <p className="shrink-0 font-bold text-accent-fg">+{formatNumber(rewardPerPB)} SP</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-muted">No personal bests this time. Beat a previous best by at least 1% to set one.</p>
            )}

            {firstLifts.length > 0 && (
                <div className="space-y-2 pt-2">
                    <h3 className="text-sm font-semibold text-fg">First time logged</h3>
                    <ul className="space-y-2">
                        {firstLifts.map((lift, index) => (
                            <li key={index} className="flex items-center justify-between rounded-xl bg-bg/60 px-4 py-3">
                                <span className="font-semibold text-fg">{lift.exercise} ({lift.equipment})</span>
                                <span className="font-bold text-accent-fg">+{FIRST_LIFT_REWARD} SP</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </Card>
    )
}

export default PBDisplay
