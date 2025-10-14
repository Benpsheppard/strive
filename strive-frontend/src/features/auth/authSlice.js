// authSlice.js

// Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from './authService.js';

// Get user from localStorage
const user = JSON.parse(localStorage.getItem('user'));

// auth initial state
const initialState = {
    user: user ? user : null,
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: ''
};

// Register user
export const register = createAsyncThunk('auth/register', async (user, thunkAPI) => {
    try {
        return await authService.register(user);
    } catch (error) {
        const message = (error.response && error.response.data && error.response.data.message)
        || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
})

// Login user
export const login = createAsyncThunk('auth/login', async (user, thunkAPI) => {
    try {
        return await authService.login(user);
    } catch (error) {
        const message = (error.response && error.response.data && error.response.data.message)
        || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
})

// Logout user
export const logout = createAsyncThunk('auth/logout', async () => {
    await authService.logout();
})

// Delete user
export const deleteUser = createAsyncThunk('auth/deleteUser', async (id, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.user.token;
        return await authService.deleteUser(id, token);
    } catch (error) {
        const message = (error.response && error.response.data && error.response.data.message)
        || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
})

export const resetUser = createAsyncThunk('auth/resetUser', async (id, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.user.token;
        return await authService.resetUser(id, token);
    } catch (error) {
        const message = (error.response && error.response.data && error.response.data.message)
        || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
})

// auth slice
export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        reset: (state) => {
            state.isLoading = false,
            state.isError = false,
            state.isSuccess = false,
            state.message = ''
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(register.pending, (state) => {
                state.isLoading = true
            })
            .addCase(register.fulfilled, (state, action) => {
                state.isLoading = false,
                state.isSuccess = true,
                state.user = action.payload
            })
            .addCase(register.rejected, (state, action) => {
                state.isLoading = false,
                state.isError = true,
                state.message = action.payload,
                state.user = null
            })
            .addCase(login.pending, (state) => {
                state.isLoading = true
            })
            .addCase(login.fulfilled, (state, action) => {
                state.isLoading = false,
                state.isSuccess = true,
                state.user = action.payload
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false,
                state.isError = true,
                state.message = action.payload,
                state.user = null
            })
            .addCase(logout.fulfilled, (state) => {
                state.user = null;
            })
            .addCase(deleteUser.pending, (state) => {
                state.isLoading = true
            })
            .addCase(deleteUser.fulfilled, (state) => {
                state.isLoading = false,
                state.isSuccess = true,
                state.user = null  // Clear user data after deletion
            })
            .addCase(deleteUser.rejected, (state, action) => {
                state.isLoading = false,
                state.isError = true,
                state.message = action.payload
            })
    }
});

export const { reset } = authSlice.actions;
export default authSlice.reducer;