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
        const token = thunkAPI.getState().auth.user?.token
        return await exerciseService.getExercises(token)
    } catch (error) {
        const message = getErrorMessage(error)
		return thunkAPI.rejectWithValue(message)
    }
})

// Create a custom exercise
export const createExercise = createAsyncThunk('exercises/create', async (exerciseData, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.user?.token
        return await exerciseService.createExercise(exerciseData, token)
    } catch (error) {
        return thunkAPI.rejectWithValue(getErrorMessage(error))
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
        // Create exercise (the form shows its own errors, so don't flip the list's error state)
            .addCase(createExercise.fulfilled, (state, action) => {
                state.exercises.push(action.payload)
            })
    }
})

export const { reset } = exerciseSlice.actions
export default exerciseSlice.reducer