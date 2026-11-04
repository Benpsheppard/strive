// questSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import questService from './questService'
import { getErrorMessage } from '../../utils/getErrorMessage.js'

const initialState = {
    quests: { daily: [], weekly: [], monthly: [] },
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: '',
}

export const getQuests = createAsyncThunk('quests/getAll', async (_, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.user.token
        return await questService.getQuests(token)
    } catch (error) {
        const message = getErrorMessage(error)
        return thunkAPI.rejectWithValue(message)
    }
})

export const generateQuests = createAsyncThunk('quests/generate', async (duration, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.user.token
        return await questService.generateQuests(duration, token)
    } catch (error) {
        const message = getErrorMessage(error)
        return thunkAPI.rejectWithValue(message)
    }
})

export const questSlice = createSlice({
    name: 'quest',
    initialState,
    reducers: {
        reset: () => initialState,
        resetFlags: (state) => {
            state.isError = false
            state.isSuccess = false
            state.isLoading = false
            state.message = ''
        }
    },
    extraReducers: (builder) => {
        builder
        // Get Quests
            .addCase(getQuests.pending, (state) => {
                state.isLoading = true
            })
            .addCase(getQuests.fulfilled, (state, action) => {
                state.isLoading = false
                state.isSuccess = true
                state.quests = action.payload.quests
            })
            .addCase(getQuests.rejected, (state, action) => {
                state.isLoading = false
                state.isError = true
                state.message = action.payload
            })
        
        // Generate Quests
            .addCase(generateQuests.pending, (state) => {
                state.isLoading = true
            }) 
            .addCase(generateQuests.fulfilled, (state, action) => {
                state.isLoading = false
                state.isSuccess = true
                // The API returns the newly generated quests; the duration is the thunk argument
                state.quests[action.meta.arg] = action.payload.quests
            })
            .addCase(generateQuests.rejected, (state, action) => {
                state.isLoading = false
                state.isError = true
                state.message = action.payload
            })              
    }
})

export const { reset, resetFlags } = questSlice.actions
export default questSlice.reducer