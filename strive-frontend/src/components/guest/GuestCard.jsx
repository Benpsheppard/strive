// GuestCard.jsx

// Imports
import { useNavigate } from 'react-router-dom'

const GuestCard = ({ workouts, isMigrate }) => {
    const navigate = useNavigate()

    const onMigrateAccount = () => {
        navigate('/migrate')
    }

    return (
        <div className="max-w-2xl w-full bg-[#EF233C] text-[#EDF2F4] text-sm text-center rounded-2xl p-2">
            <p>Guest Account. You have completed {workouts.length}/5 workouts.</p>
            <p>Migrate to a Strive account for unlimited workout tracking.</p>
            {isMigrate && (
                <button onClick={onMigrateAccount} className="w-full bg-[#2B2D42] text-[#EF233C] border-2 border-[#D90429] py-2 rounded mt-2 transition hover:bg-[#D90429] hover:text-[#EDF2F4]">
                    Migrate Account
                </button>
            )}
        </div>
    )
}

export default GuestCard