// useWorkoutSubmit.js

// Imports
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"

// Feature Imports
import { createWorkout, setLastWorkoutStats } from "../features/workouts/workoutsSlice"

// Util Imports
import { defaultWorkoutTitle } from "../utils/workoutTitle.js"
import { addPendingWorkout } from "../utils/pendingWorkouts.js"

export const useWorkoutSubmit = ({ title, startTime, clientId, resetWorkoutState }) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { user } = useSelector((state) => state.auth)

    // Saves the workout. Returns true when it was saved (now, or queued on the device).
    const submitWorkout = async (exercises) => {
        if (exercises.length === 0) {
            toast.error('Add at least one exercise before ending your workout.')
            return false
        }

        const durationMinutes = Math.round((Date.now() - startTime) / 60000)
        const workoutData = {
            title: title.trim() || defaultWorkoutTitle(startTime),
            exercises,
            duration: durationMinutes,
            // Lets the server recognise a repeat of this same save instead of storing it twice
            clientId
        }

        const result = await dispatch(createWorkout(workoutData))

        if (createWorkout.fulfilled.match(result)) {
            const { workout, gamification } = result.payload

            dispatch(setLastWorkoutStats({ workout, ...gamification }))

            navigate('/workout-complete')
            resetWorkoutState()
            return true
        }

        // No connection or a server problem: keep the workout on the device and upload it later
        if (result.meta?.retryable && addPendingWorkout(user._id, workoutData)) {
            toast.info("Saved on this device. It will upload automatically when you're back online.", { autoClose: 6000 })
            resetWorkoutState()
            navigate('/')
            return true
        }

        toast.error(result.payload || 'Failed to save workout. Your workout is still here, so try again.')
        return false
    }

    return { submitWorkout }
}
