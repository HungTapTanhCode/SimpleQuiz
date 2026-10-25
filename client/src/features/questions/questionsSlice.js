import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { request } from '../../services/api';

export const fetchQuestions = createAsyncThunk('questions/fetchAll', () => request('/api/questions'));
export const createQuestion = createAsyncThunk('questions/create', payload => request('/api/questions', { method: 'POST', body: JSON.stringify(payload) }));
export const updateQuestion = createAsyncThunk('questions/update', ({ id, payload }) => request(`/api/questions/${id}`, { method: 'PUT', body: JSON.stringify(payload) }));
export const deleteQuestion = createAsyncThunk('questions/delete', async id => { await request(`/api/questions/${id}`, { method: 'DELETE' }); return id; });

const slice = createSlice({
  name: 'questions',
  initialState: { items: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: builder => {
    for (const thunk of [fetchQuestions, createQuestion, updateQuestion, deleteQuestion]) {
      builder.addCase(thunk.pending, state => { state.status = 'loading'; state.error = null; });
      builder.addCase(thunk.rejected, (state, action) => { state.status = 'failed'; state.error = action.error.message; });
    }
    builder
      .addCase(fetchQuestions.fulfilled, (state, action) => { state.status = 'succeeded'; state.items = action.payload; })
      .addCase(createQuestion.fulfilled, (state, action) => { state.status = 'succeeded'; state.items.push(action.payload); })
      .addCase(updateQuestion.fulfilled, (state, action) => { state.status = 'succeeded'; state.items = state.items.map(item => item._id === action.payload._id ? action.payload : item); })
      .addCase(deleteQuestion.fulfilled, (state, action) => { state.status = 'succeeded'; state.items = state.items.filter(item => item._id !== action.payload); });
  }
});

export default slice.reducer;
