// exerciseSlice.js

// Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import exerciseService from './exerciseService'

// Initial state
const initialState = {
    exercises: [],
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: ''
}

// Get exercises
export const getExercises = createAsyncThunk('exercises/getAll', async (_, thunkAPI) => {
    try {
        return await exerciseService.getExercises()
    } catch (error) {
        const message = (error.response && error.response.data && error.response.data.message) 
		|| error.message || error.toString()
		return thunkAPI.rejectWithValue(message)
    }
})

// Exercise slice
export const exerciseSlice = createSlice({
    name: 'exercise',
    initialState,
    reducers: {
        reset: () => initialState
    },
    extraReducers: (builder) => {
        builder
        // Get exercises
            .addCase(getExercises.pending, (state) => {
                state.isLoading = true
            })
            .addCase(getExercises.fulfilled, (state, action) => {
                state.isLoading = false
                state.isSuccess = true
                state.exercises = action.payload
            })
            .addCase(getExercises.rejected, (state, action) => {
                state.isLoading = false
                state.isError = true
                state.message = action.payload
            })
    }
})

export const { reset } = exerciseSlice.actions
export default exerciseSlice.reducer