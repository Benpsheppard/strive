// useWorkoutSubmit.js

// Imports
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"

// Feature Imports
import { createWorkout, setLastWorkoutStats } from "../features/workouts/workoutsSlice"

export const useWorkoutSubmit = ({ title, exercises, startTime, resetWorkoutState }) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()

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
            const { workout, user, gamification } = await dispatch(createWorkout(workoutData)).unwrap()
            
            console.log(JSON.stringify(workout))
            console.log(JSON.stringify(gamification))

            dispatch(setLastWorkoutStats({
                workout,
                ...gamification
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