// StreakCard.jsx

// Function Imports
import { getStartOfWeek, getEndOfWeek } from "../../utils/dateFormat"

// Component Imports
import ProgressBar from "./ProgressBar.jsx"
import { FaFire } from "react-icons/fa"

const StreakCard = ({ user, workouts }) => {
    // Calculate number of workouts this week
    const now = new Date()
    const startOfWeek = getStartOfWeek(now)
    const endOfWeek = getEndOfWeek(now)

    const workoutsThisWeek = workouts.filter((workout) => {
        const workoutDate = new Date(workout.createdAt)

        return (
            workoutDate >= startOfWeek &&
            workoutDate <= endOfWeek
        )
    }).length

    return (
        <div className="flex flex-col items-center p-6 w-full space-y-3 bg-[#8D99AE] shadow rounded-2xl text-[#EDF2F4]">
            <h2 className="font-bold text-2xl">
                Current Streak
            </h2>
            
            <div className='flex items-center space-x-2 text-4xl'>
                <h2 className='fomt-bold'>{user.streak.current}</h2>
                <span className="text-[#EF233C]"><FaFire /></span>
            </div>

            {user.streak.shield ? (
                <p className="text-sm text-[#EDF2F4]">Streak Shield Active</p>
            ) : (
                <p className="text-sm text-[#EDF2F4]">No Streak Shield Active</p>
            )}

            <ProgressBar numerator={workoutsThisWeek} denominator={user.target} />
        </div>
    )
}

export default StreakCard