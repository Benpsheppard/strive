// StreakCard.jsx

const StreakCard = ({ user }) => {
    return (
        <div className="p-6 w-full sm:max-w-2xl mx-auto bg-[#8D99AE] shadow rounded-2xl text-[#EDF2F4]">
            <h2 className="text-bold text-2xl">Current Streak: {user.streak}</h2>
            {user.streakShield ? (
                <p className="text-sm text-[#EDF2F4]">Streak Shield Active</p>
            ) : (
                <p className="text-sm text-[#EDF2F4]">No Streak Shield Active</p>
            )}
        </div>
    )
}

export default StreakCard