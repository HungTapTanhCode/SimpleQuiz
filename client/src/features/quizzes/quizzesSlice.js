import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { request } from '../../services/api';

export const fetchQuizzes = createAsyncThunk('quizzes/fetchAll', () => request('/api/quizzes'));
export const fetchQuiz = createAsyncThunk('quizzes/fetchOne', id => request(`/api/quizzes/${id}`));
export const createQuiz = createAsyncThunk('quizzes/create', payload => request('/api/quizzes', { method: 'POST', body: JSON.stringify(payload) }));
export const updateQuiz = createAsyncThunk('quizzes/update', ({ id, payload }) => request(`/api/quizzes/${id}`, { method: 'PUT', body: JSON.stringify(payload) }));
export const deleteQuiz = createAsyncThunk('quizzes/delete', async id => { await request(`/api/quizzes/${id}`, { method: 'DELETE' }); return id; });

const slice = createSlice({
  name: 'quizzes',
  initialState: { items: [], current: null, status: 'idle', error: null },
  reducers: { clearCurrentQuiz(state) { state.current = null; } },
  extraReducers: builder => {
    for (const thunk of [fetchQuizzes, fetchQuiz, createQuiz, updateQuiz, deleteQuiz]) {
      builder.addCase(thunk.pending, state => { state.status = 'loading'; state.error = null; });
      builder.addCase(thunk.rejected, (state, action) => { state.status = 'failed'; state.error = action.error.message; });
    }
    builder
      .addCase(fetchQuizzes.fulfilled, (state, action) => { state.status = 'succeeded'; state.items = action.payload; })
      .addCase(fetchQuiz.fulfilled, (state, action) => { state.status = 'succeeded'; state.current = action.payload; })
      .addCase(createQuiz.fulfilled, (state, action) => { state.status = 'succeeded'; state.items.push(action.payload); })
      .addCase(updateQuiz.fulfilled, (state, action) => { state.status = 'succeeded'; state.items = state.items.map(item => item._id === action.payload._id ? action.payload : item); state.current = action.payload; })
      .addCase(deleteQuiz.fulfilled, (state, action) => { state.status = 'succeeded'; state.items = state.items.filter(item => item._id !== action.payload); });
  }
});

export const { clearCurrentQuiz } = slice.actions;
export default slice.reducer;
