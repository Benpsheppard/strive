// QuestCard.jsx

const QuestCard = ({ quest, onClick }) => {
    const { title, description, difficulty, reward, expiry, duration, status } = quest;

    const isExpired = new Date(expiry) < new Date();

    // Determine card colour
    const cardColour =
        status === 'completed' ? 'bg-green-500' :
        status === 'expired' ? 'bg-[#EF233C]' :
        'bg-[#8D99AE]';

    return (
        <div
            onClick={onClick} className={`rounded-lg p-4 text-[#EDF2F4] shadow-md font-semibold cursor-pointer hover:shadow-xl transition-shadow duration-300 ${cardColour}`}
        >
            <h3 className="text-lg font-bold mb-2">{title}</h3>
            <p className="mb-2">{description}</p>

            <div className="flex justify-between text-sm text-gray-200">
                <span>Difficulty: {difficulty}</span>
                <span>Reward: {reward} SP</span>
            </div>

            <div className="flex justify-between text-sm text-gray-300 mt-1">
                <span>Duration: {duration}</span>
                <span>Expires: {new Date(expiry).toLocaleDateString()}</span>
            </div>

            {status === 'completed' && (
                <p className="text-sm text-green-200 mt-2">✅ Completed : Click to receive your reward!</p>
            )}
            {isExpired && (
                <p className="text-sm text-red-200 mt-2">⏰ Expired : Click to generate a new quest!</p>
            )}
        </div>
    );
};

export default QuestCard;
