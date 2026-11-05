// routineSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import routineService, { readRoutineCache, saveRoutineCache } from './routineService.js'
import { getErrorMessage, isRetryableError } from '../../utils/getErrorMessage.js'

const initialState = {
    routines: [],
    isLoading: false,
    isLoaded: false,
    isOffline: false
}

const session = (thunkAPI) => thunkAPI.getState().auth.user

// Loads the user's routines. With no connection (or a server problem) the list from the last
// successful load is used instead, so a routine can still be started in the gym.
export const getRoutines = createAsyncThunk('routines/getAll', async (_, thunkAPI) => {
    const user = session(thunkAPI)

    try {
        const routines = await routineService.getRoutines(user.token, user._id)
        return { routines, fromCache: false }
    } catch (error) {
        const cached = isRetryableError(error) ? readRoutineCache(user._id) : null
        if (cached) return { routines: cached, fromCache: true }
        return thunkAPI.rejectWithValue(getErrorMessage(error))
    }
})

// The create/update/delete thunks report their errors to the dialog or page that called them.
// After each success the on-device copy is updated too, so it matches what the user sees.
const currentList = (thunkAPI) => thunkAPI.getState().routine.routines

export const createRoutine = createAsyncThunk('routines/create', async (data, thunkAPI) => {
    try {
        const user = session(thunkAPI)
        const created = await routineService.createRoutine(data, user.token)
        saveRoutineCache(user._id, [created, ...currentList(thunkAPI)])
        return created
    } catch (error) {
        return thunkAPI.rejectWithValue(getErrorMessage(error))
    }
})

export const updateRoutine = createAsyncThunk('routines/update', async ({ id, ...data }, thunkAPI) => {
    try {
        const user = session(thunkAPI)
        const updated = await routineService.updateRoutine(id, data, user.token)
        saveRoutineCache(user._id, [updated, ...currentList(thunkAPI).filter(r => r._id !== id)])
        return updated
    } catch (error) {
        return thunkAPI.rejectWithValue(getErrorMessage(error))
    }
})

export const deleteRoutine = createAsyncThunk('routines/delete', async (id, thunkAPI) => {
    try {
        const user = session(thunkAPI)
        await routineService.deleteRoutine(id, user.token)
        saveRoutineCache(user._id, currentList(thunkAPI).filter(r => r._id !== id))
        return id
    } catch (error) {
        return thunkAPI.rejectWithValue(getErrorMessage(error))
    }
})

export const routineSlice = createSlice({
    name: 'routine',
    initialState,
    reducers: {
        reset: () => initialState
    },
    extraReducers: (builder) => {
        builder
            .addCase(getRoutines.pending, (state) => {
                state.isLoading = true
            })
            .addCase(getRoutines.fulfilled, (state, action) => {
                state.isLoading = false
                state.isLoaded = true
                state.isOffline = action.payload.fromCache
                state.routines = action.payload.routines
            })
            .addCase(getRoutines.rejected, (state) => {
                state.isLoading = false
                state.isLoaded = true
            })
            .addCase(createRoutine.fulfilled, (state, action) => {
                state.routines = [action.payload, ...state.routines]
            })
            .addCase(updateRoutine.fulfilled, (state, action) => {
                state.routines = [action.payload, ...state.routines.filter(r => r._id !== action.payload._id)]
            })
            .addCase(deleteRoutine.fulfilled, (state, action) => {
                state.routines = state.routines.filter(r => r._id !== action.payload)
            })
    }
})

export const { reset } = routineSlice.actions
export default routineSlice.reducer
