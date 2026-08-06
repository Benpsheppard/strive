// BonusCard.jsx

// Function Imports
import { getStartOfWeek, getEndOfWeek } from "../../utils/dateFormat"

// Component Imports
import ProgressBar from "./ProgressBar.jsx"

const BonusCard = ({ user, workouts }) => {
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

    const bonusHit = workoutsThisWeek > user.target

    return (
        <div className="flex flex-col items-center p-6 w-full space-y-3 bg-[#8D99AE] shadow rounded-2xl text-[#EDF2F4]">
            <h2 className="font-bold text-2xl">
                Workout Bonus
            </h2>

            {bonusHit ? (
                <p>You've hit your weekly target! Enjoy your SP Bonus!</p>
            ) : (
                <p>Hit your weekly target to earn a huge SP Bonus!</p>
            )}

            <ProgressBar numerator={workoutsThisWeek} denominator={user.target} />
        </div>
    )
}

export default BonusCard