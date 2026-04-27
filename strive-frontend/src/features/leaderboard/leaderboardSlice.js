// leaderboardSlice.js

// Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import leaderboardService from './leaderboardService'

// Initial state
const initialState = {
    leaderboard: [],
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: ''
}

// Get exercises
export const getLeaderboard = createAsyncThunk('leaderboard/get', async (metric, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.user.token
        return await leaderboardService.getLeaderboard(metric, token)
    } catch (error) {
        const message = (error.response && error.response.data && error.response.data.message) 
		|| error.message || error.toString()
		return thunkAPI.rejectWithValue(message)
    }
})

// Leaderboard slice
export const leaderboardSlice = createSlice({
    name: 'leaderboard',
    initialState,
    reducers: {
        reset: () => initialState
    },
    extraReducers: (builder) => {
        builder
        // Get leaderboard
            .addCase(getLeaderboard.pending, (state) => {
                state.isLoading = true
            })
            .addCase(getLeaderboard.fulfilled, (state, action) => {
                state.isLoading = false
                state.isSuccess = true
                state.leaderboard = action.payload
            })
            .addCase(getLeaderboard.rejected, (state, action) => {
                state.isLoading = false
                state.isError = true
                state.message = action.payload
            })
    }
})

export const { reset } = leaderboardSlice.actions
export default leaderboardSlice.reducer