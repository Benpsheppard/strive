// QuestsCompleted.jsx

// Imports
import { FaMedal } from 'react-icons/fa'

const QuestsCompleted = ({ workout }) => {
    return (
        <div className="fade-in-card bg-[#8D99AE] rounded-2xl px-6 py-5" style={{ animationDelay: '0.8s' }}>
            <h2 className="text-[#EDF2F4] font-semibold text-lg mb-4 flex items-center gap-2">
                <FaMedal className="text-[#EF233C]" /> Quests Completed
            </h2>
            {workout.summary.questsCompleted.length > 0 ? (
                <div className="space-y-3">
                    {workout.summary.questsCompleted.map((quest, index) => (
                        <div key={index} className="bg-[#2B2D42] rounded-xl px-4 py-3 flex justify-between items-center">
                            <p className="text-[#EDF2F4] font-semibold">{quest.title}</p>
                            <p className="text-[#EF233C] font-bold">+{quest.reward} SP</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-[#EDF2F4]/40 text-center">
                    No Quests completed this session
                </p>
            )}
        </div>
    )
}

export default QuestsCompleted