import { configureStore, combineReducers } from '@reduxjs/toolkit'
import authReducer, { logout } from '../features/auth/authSlice.js'
import workoutReducer from '../features/workouts/workoutsSlice.js'
import questReducer from '../features/quests/questSlice.js'
import exerciseReducer from '../features/exercises/exerciseSlice.js'
import leaderboardReducer from '../features/leaderboard/leaderboardSlice.js'

const appReducer = combineReducers({
    auth: authReducer,
    workout: workoutReducer,
    quest: questReducer,
    exercise: exerciseReducer,
    leaderboard: leaderboardReducer
})

// On logout, drop the previous user's workouts, quests and leaderboard so the next
// person to log in never sees them. Auth handles its own logout.
const rootReducer = (state, action) => {
    if (action.type === logout.fulfilled.type && state) {
        return appReducer({ auth: state.auth }, action)
    }
    return appReducer(state, action)
}

export const store = configureStore({
    reducer: rootReducer
})
