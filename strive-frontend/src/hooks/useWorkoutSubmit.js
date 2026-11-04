// useWorkoutSubmit.js

// Imports
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"

// Feature Imports
import { createWorkout, setLastWorkoutStats } from "../features/workouts/workoutsSlice"

// Util Imports
import { defaultWorkoutTitle } from "../utils/workoutTitle.js"

export const useWorkoutSubmit = ({ title, startTime, resetWorkoutState }) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    // Saves the workout. Returns true when it was saved.
    const submitWorkout = async (exercises) => {
        if (exercises.length === 0) {
            toast.error('Add at least one exercise before ending your workout.')
            return false
        }

        const durationMinutes = Math.round((Date.now() - startTime) / 60000)
        const workoutData = {
            title: title.trim() || defaultWorkoutTitle(startTime),
            exercises,
            duration: durationMinutes
        }

        try {
            const { workout, gamification } = await dispatch(createWorkout(workoutData)).unwrap()

            dispatch(setLastWorkoutStats({
                workout,
                ...gamification
            }))

            navigate('/workout-complete')
            resetWorkoutState()
            return true
        } catch (error) {
            console.error('Submit workout error: ', error)
            toast.error(typeof error === 'string' ? error : error.message || 'Failed to save workout. Your workout is still here, so try again.')
            return false
        }
    }

    return { submitWorkout }
}
