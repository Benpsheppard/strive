// useWorkoutSubmit.js

// Imports
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"

// Feature Imports
import { createWorkout, setLastWorkoutStats } from "../features/workouts/workoutsSlice"
import { addPoints, updateStreak, updateMomentum } from "../features/auth/authSlice"

export const useWorkoutSubmit = ({ title, exercises, startTime, resetWorkoutState }) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { user } = useSelector((state) => state.auth)

    const submitWorkout = async () => {
        if (!title.trim()) { 
            toast.error('Please enter a workout title.')
            return 
        }
        if (exercises.length === 0) {
            toast.error('Please add at least one exercise.')
            return 
        }

        const endTime = Date.now()
        const durationMinutes = Math.round((endTime - startTime) / 60000)
        const workoutData = { title, exercises, duration: durationMinutes }

        try {
            const savedWorkout = await dispatch(createWorkout(workoutData)).unwrap()
            const { summary } = savedWorkout

            const momentumData = {
                workoutCompleted: true,
                personalBests: summary.personalBests.length || 0,
                quests: summary.questsCompleted
            }

            // Streak info
            const oldStreak = user.streak.current
            const oldShield = user.streak.shield
            const oldMomentum = user.momentum.current

            const [pointsResult, updatedUserAfterStreak, updatedUserAfterMomentum] = await Promise.all([
                summary.totalStrivePoints.total > 0
                    ? dispatch(addPoints({ userId: user._id, amount: summary.totalStrivePoints.total })).unwrap()
                    : Promise.resolve(null),
                dispatch(updateStreak(user._id)).unwrap(),
                dispatch(updateMomentum(momentumData)).unwrap()
            ])

            const levelUp = pointsResult?.level > user.level ? pointsResult.level : null
            const streakIncreased = updatedUserAfterStreak.streak.current > oldStreak
            const shieldEarned = !oldShield && updatedUserAfterStreak.streak.shield
            const shieldUsed = oldShield && !updatedUserAfterStreak.streak.shield && updatedUserAfterStreak.streak.current === oldStreak
            const streakBroken = updatedUserAfterStreak.streak.current === 0 && oldStreak > 0
            const momentumGained = updatedUserAfterMomentum.momentum.current - oldMomentum

            dispatch(setLastWorkoutStats({
                workout: savedWorkout,
                levelUp,
                streakIncreased,
                momentumGained,
                shieldEarned,
                shieldUsed,
                streakBroken
            }))

            navigate('/workout-complete')
            resetWorkoutState()
        } catch (error) {
            console.error('Submit workout error: ', error)
            toast.error(error.message || 'Failed to save workout')
        }
    }

    return { submitWorkout }
}