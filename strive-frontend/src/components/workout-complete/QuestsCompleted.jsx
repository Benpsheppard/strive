// QuestsCompleted.jsx

import { FaMedal } from 'react-icons/fa'
import Card, { CardTitle } from '../ui/Card.jsx'

const QuestsCompleted = ({ workout }) => {
    const quests = workout.summary?.questsCompleted || []

    return (
        <Card as="section" aria-labelledby="quests-title" className="space-y-3">
            <CardTitle id="quests-title" className="flex items-center gap-2">
                <FaMedal aria-hidden="true" className="text-accent-fg" /> Quests completed
            </CardTitle>

            {quests.length > 0 ? (
                <ul className="space-y-2">
                    {quests.map((quest, index) => (
                        <li key={index} className="flex items-center justify-between rounded-xl bg-bg/60 px-4 py-3">
                            <span className="font-semibold text-fg">{quest.title}</span>
                            <span className="font-bold text-accent-fg">+{quest.reward} SP</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-muted">No quests completed this time.</p>
            )}
        </Card>
    )
}

export default QuestsCompleted
