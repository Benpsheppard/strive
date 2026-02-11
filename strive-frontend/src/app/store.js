import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice.js'
import workoutReducer from '../features/workouts/workoutsSlice.js'
import contestReducer from '../features/contests/contestSlice.js'
import questReducer from '../features/quests/questSlice.js'

export const store = configureStore({
    reducer: {
        auth: authReducer,
        workout: workoutReducer,
        contest: contestReducer,
        quest: questReducer,
    }
})