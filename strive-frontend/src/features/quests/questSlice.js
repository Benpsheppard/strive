// Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import questService from './questService';

// Initial state
const initialState = {
  quests: [],
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

// Async thunks

// Get all quests for user
export const getQuests = createAsyncThunk('quests/getAll', async (_, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    return await questService.getQuests(token);
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// Generate quest
export const generateQuest = createAsyncThunk('quests/createOne', async (_, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    return await questService.generateQuest(token);
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// Complete quest
export const completeQuest = createAsyncThunk('quests/completeQuest', async (questId, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    return await questService.completeQuest(questId, token);
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// Delete quest
export const deleteQuest = createAsyncThunk('quests/deleteQuest', async (questId, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    return await questService.deleteQuest(questId, token);
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// Check quests after new workout
export const checkQuestCompletion = createAsyncThunk('quests/checkCompletion', async (newWorkout, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await questService.checkQuestCompletion(newWorkout, token);
    } catch (error) {
      const message = 
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Slice
export const questSlice = createSlice({
  name: 'quests',
  initialState,
  reducers: {
    resetQuests: (state) => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Get all quests
      .addCase(getQuests.pending, (state) => { state.isLoading = true })
      .addCase(getQuests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.quests = action.payload;
      })
      .addCase(getQuests.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // Generate 1 quest
      .addCase(generateQuest.pending, (state) => { 
        state.isLoading = true 
      })
      .addCase(generateQuest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.quests.push(action.payload);
      })
      .addCase(generateQuest.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // Complete quest
      .addCase(completeQuest.pending, (state) => { state.isLoading = true })
      .addCase(completeQuest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.quests = state.quests.filter(q => q._id !== action.meta.arg);
      })
      .addCase(completeQuest.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // Delete quest
      .addCase(deleteQuest.pending, (state) => { state.isLoading = true })
      .addCase(deleteQuest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.quests = state.quests.filter(q => q._id !== action.payload);
      })
      .addCase(deleteQuest.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // Check quest completion
      .addCase(checkQuestCompletion.pending, (state) => { state.isLoading = true })
      .addCase(checkQuestCompletion.fulfilled, (state, action) => {
          state.isLoading = false;
          state.isSuccess = true;

          action.payload.forEach(({ questId, completed }) => {
              if (completed) {
                  const quest = state.quests.find(q => q._id === questId);
                  if (quest) quest.status = 'completed';
              }
          });
      })
      .addCase(checkQuestCompletion.rejected, (state, action) => {
          state.isLoading = false;
          state.isError = true;
          state.message = action.payload;
      })

  },
});

export const { resetQuests } = questSlice.actions;
export default questSlice.reducer;
