// achievementsSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import achievementsService from './achievementsService'
import { getErrorMessage } from '../../utils/getErrorMessage.js'

const initialState = {
    achievements: [],
    unlocked: 0,
    total: 0,
    secrets: { unlocked: 0, total: null },
    isError: false,
    isLoading: false,
    message: '',
}

export const getAchievements = createAsyncThunk('achievements/getAll', async (_, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.user.token
        return await achievementsService.getAchievements(token)
    } catch (error) {
        return thunkAPI.rejectWithValue(getErrorMessage(error))
    }
})

export const reportAchievementEvent = createAsyncThunk('achievements/event', async (event, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.user.token
        return await achievementsService.reportEvent(event, token)
    } catch (error) {
        return thunkAPI.rejectWithValue(getErrorMessage(error))
    }
})

export const achievementsSlice = createSlice({
    name: 'achievements',
    initialState,
    reducers: {
        reset: () => initialState
    },
    extraReducers: (builder) => {
        builder
            .addCase(getAchievements.pending, (state) => {
                state.isLoading = true
                state.isError = false
            })
            .addCase(getAchievements.fulfilled, (state, action) => {
                state.isLoading = false
                state.achievements = action.payload.achievements
                state.unlocked = action.payload.unlocked
                state.total = action.payload.total
                state.secrets = action.payload.secrets || initialState.secrets
            })
            .addCase(getAchievements.rejected, (state, action) => {
                state.isLoading = false
                state.isError = true
                state.message = action.payload
            })
    }
})

export const { reset } = achievementsSlice.actions
export default achievementsSlice.reducer
