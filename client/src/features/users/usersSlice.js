import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { request } from '../../services/api';

export const fetchUsers = createAsyncThunk('users/fetchAll', () => request('/users'));

const slice = createSlice({
  name: 'users',
  initialState: { items: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: builder => builder
    .addCase(fetchUsers.pending, state => { state.status = 'loading'; state.error = null; })
    .addCase(fetchUsers.fulfilled, (state, action) => { state.status = 'succeeded'; state.items = action.payload; })
    .addCase(fetchUsers.rejected, (state, action) => { state.status = 'failed'; state.error = action.error.message; })
});

export default slice.reducer;
