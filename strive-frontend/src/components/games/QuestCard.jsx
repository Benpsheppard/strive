// QuestCard.jsx

import { useSelector } from 'react-redux'
import { FaCheckCircle } from 'react-icons/fa'

import { formatWeight, formatDistance, formatSeconds, formatNumber, kgToLbs, getWeightUnit } from '../../utils/formatValues'
import Card from '../ui/Card.jsx'
import ProgressBar from './ProgressBar'
import { cx } from '../../utils/cx.js'

const PROGRESSIVE_LABELS = {
    max_weight: 'Best weight',
    max_reps: 'Best reps',
    session_volume: 'Best session volume',
    total_distance: 'Best distance',
    total_duration: 'Best duration'
}

// Format a progressive quest value according to its metric
const formatProgressiveValue = (metric, value, useImperial) => {
    switch (metric) {
        case 'max_reps':
            return `${formatNumber(value)} reps`
        case 'total_distance':
            return formatDistance(value, useImperial)
        case 'total_duration':
            return formatSeconds(value)
        default:
            return formatWeight(value, useImperial)
    }
}

const QuestCard = ({ quest }) => {
    const { user } = useSelector((state) => state.auth)
    const { completion = {} } = quest
    const done = quest.status === 'completed'
    const exerciseName = [completion.exercise, completion.selectedEquipment && `(${completion.selectedEquipment})`].filter(Boolean).join(' ')

    return (
        <Card raised as="article" className={cx('flex h-full flex-col gap-3', done && 'opacity-75')}>
            <div>
                <h3 className="flex items-center gap-2 font-display text-xl font-bold text-fg">
                    {done && <FaCheckCircle aria-label="Completed" className="text-success" />}
                    {quest.title}
                </h3>
                <p className="text-sm text-muted">{quest.description}</p>
            </div>

            <div className="mt-auto space-y-3">
                {quest.questType === 'strength' && (
                    <p className="text-sm">
                        <span className="font-semibold text-fg">{exerciseName}</span>
                        <span className="block text-muted">{formatWeight(completion.weight, user.useImperial)} × {completion.reps} reps</span>
                    </p>
                )}

                {quest.questType === 'progressive' && (
                    <p className="text-sm">
                        <span className="font-semibold text-fg">{exerciseName}</span>
                        <span className="block text-muted">
                            {PROGRESSIVE_LABELS[completion.metric] || 'Current best'} to beat: {formatProgressiveValue(completion.metric, completion.baseline, user.useImperial)}
                        </span>
                    </p>
                )}

                {quest.questType === 'consistency' && (
                    <ProgressBar numerator={completion.currentCount} denominator={completion.targetCount} label={quest.title} />
                )}

                {quest.questType === 'volume' && (
                    <ProgressBar
                        numerator={Math.round(user.useImperial ? kgToLbs(completion.currentVolume) : completion.currentVolume)}
                        denominator={Math.round(user.useImperial ? kgToLbs(completion.targetVolume) : completion.targetVolume)}
                        unit={getWeightUnit(user.useImperial)}
                        label={quest.title}
                    />
                )}

                <div className="flex items-center justify-between border-t border-line pt-3 text-sm">
                    <span className="font-semibold text-accent-fg">+{quest.reward} SP</span>
                    <span className="text-muted">
                        {done ? 'Completed' : `Expires ${new Date(quest.expiry).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`}
                    </span>
                </div>
            </div>
        </Card>
    )
}

export default QuestCard
