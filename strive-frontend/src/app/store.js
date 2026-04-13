import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice.js'
import workoutReducer from '../features/workouts/workoutsSlice.js'
import questReducer from '../features/quests/questSlice.js'
import exerciseReducer from '../features/exercises/exerciseSlice.js'

export const store = configureStore({
    reducer: {
        auth: authReducer,
        workout: workoutReducer,
        quest: questReducer,
        exercise: exerciseReducer
    }
})