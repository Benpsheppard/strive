// exerciseSlice.js

// Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import exerciseService from './exerciseService'
import { getErrorMessage } from '../../utils/getErrorMessage.js'

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
        const message = getErrorMessage(error)
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