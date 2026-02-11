// questSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import questService from './questService'

const initialState = {
    quests: [],
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
        const message = (error.response && error.response.data && error.response.data.message) 
        || error.message || error.toString()
        return thunkAPI.rejectWithValue(message)
    }
})

export const generateQuests = createAsyncThunk('quests/generate', async (duration, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.user.token
        return await questService.generateQuests(duration, token)
    } catch (error) {
        const message = (error.response && error.response.data && error.response.data.message) 
        || error.message || error.toString()
        return thunkAPI.rejectWithValue(message)
    }
})

export const checkQuestCompletion = createAsyncThunk('quests/checkCompletion', async (workoutData, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.user.token
        return await questService.checkQuestCompletion(workoutData, token)
    } catch (error) {
        const message = (error.response && error.response.data && error.response.data.message) 
        || error.message || error.toString()
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
                state.quests.push(action.payload)
            })
            .addCase(generateQuests.rejected, (state, action) => {
                state.isLoading = false
                state.isError = true
                state.message = action.payload
            })

        // Check Quest Completion
            .addCase(checkQuestCompletion.pending, (state) => {
                state.isLoading = true
            })
            .addCase(checkQuestCompletion.fulfilled, (state, action) => {
                state.isLoading = false
                state.isSuccess = true
                // Update quests with completion status
            })
            .addCase(checkQuestCompletion.rejected, (state, action) => {
                state.isLoading = false
                state.isError = true
                state.message = action.payload
            })                
    }
})

export const { reset, resetFlags } = questSlice.actions
export default questSlice.reducer