// contestSlice.js

// Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import contestService from './contestService';

// Initial State
const initialState = {
  contest: null,
  leaderboard: { topFive: [], user: null},
  isLoading: false,
  isLeaderboardLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
};

// Get current contest
export const getContest = createAsyncThunk('contests/getCurrent', async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token; // get token from Redux state
      return await contestService.getContest(token);
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
});

// Get current contest's leaderboard
export const getLeaderboard = createAsyncThunk('contest/getLeaderboard', async (_, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token; // get token from Redux state
    return await contestService.getLeaderboard(token);
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
      })
      .addCase(getLeaderboard.pending, (state) => {
        state.isLeaderboardLoading = true;
      })
      .addCase(getLeaderboard.fulfilled, (state, action) => {
        state.isLeaderboardLoading = false;
        state.leaderboard = action.payload;
      })
      .addCase(getLeaderboard.rejected, (state, action) => {
        state.isLeaderboardLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = contestSlice.actions;
export default contestSlice.reducer;