// contestSlice.js

// Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import contestService from './contestService';

// Initial State
const initialState = {
  contest: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
};

// Get current contest
export const getContest = createAsyncThunk('contests/getCurrent', async (_, thunkAPI) => {
    try {
      return await contestService.getContest();
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
});

export const contestSlice = createSlice({
  name: 'contest',
  initialState,
  reducers: {
    resetContest: (state) => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getContest.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getContest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.contest = action.payload;
      })
      .addCase(getContest.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.contest = null;
      });
  },
});

export const { reset } = contestSlice.actions;
export default contestSlice.reducer;