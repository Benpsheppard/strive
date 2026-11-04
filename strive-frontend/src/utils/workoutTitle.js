// workoutTitle.js

// "Morning Workout", "Afternoon Workout" ... based on when the workout started
export const defaultWorkoutTitle = (startTime = Date.now()) => {
    const hour = new Date(startTime).getHours()
    const part = hour < 5 ? 'Night' : hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : hour < 22 ? 'Evening' : 'Night'
    return `${part} Workout`
}
