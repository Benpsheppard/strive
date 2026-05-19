// trainerSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import trainerService from './trainerService'

const initialState = {
    suggestions = [],
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: ''
}

// Get Suggestions
export const getSuggestions = createAsyncThunk('suggestions/getAll', async (_, thunkAPI) => {
    try {
        return await trainerService.getSuggestions()
    } catch (error) {
        const message = (error.response && error.response.data && error.response.data.message) 
		|| error.message || error.toString()
		return thunkAPI.rejectWithValue(message)
    }
})

// Trainer slice
export const trainerSlice = createSlice({
    name: 'trainer',
    initialState,
    reducers: {
        reset: () => initialState
    },
    extraReducers: (builder) => {
        builder
        // Get Suggestions
            .addCase(getSuggestions.pending, (state) => {
                state.isLoading = true
            })
            .addCase(getSuggestions.fulfilled, (state, action) => {
                state.isLoading = false
                state.isSuccess = true
                state.exercises = action.payload
            })
            .addCase(getSuggestions.rejected, (state, action) => {
                state.isLoading = false
                state.isError = true
                state.message = action.payload
            })
    }
})

export const { reset } = trainerSlice.actions
export default trainerSlice.reducer