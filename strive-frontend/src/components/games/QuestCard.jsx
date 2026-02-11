// QuestCard.jsx

const QuestCard = ({ quest }) => {
    return (
        <div key={quest._id} className={`flex flex-col justify-between p-5 rounded-2xl shadow-xl bg-[#2B2D42] text-[#EDF2F4] transform transition-transform duration-300 hover:scale-105 ${quest.status === 'completed' ? 'opacity-50 cursor-not-allowed' : ''}`}>
            {/* Header */}
            <div>
                <h3 className='text-lg text-[#EF233C] font-bold'>{quest.title}</h3>
                <p className='text-sm mb-2'>{quest.description}</p>
            </div>
            
            {/* Footer */}
            <div className='flex justify-between items-center mt-4 pt-3 border-t border-[#EDF2F4]/20 text-sm'>
                <span className='font-semibold'>Reward: {quest.reward} SP</span>

                {quest.status === 'active' ? (
                    <span className='text-sm text-[#EDF2F4]/20'>Expires: {new Date(quest.expiry).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short'
                    })}</span>
                ) : (
                    <span className='text-sm text-[#EDF2F4]/20'>Completed</span>
                )}
                
            </div>
            
        </div>
    )
}

export default QuestCard