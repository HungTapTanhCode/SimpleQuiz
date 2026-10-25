import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { request } from '../../services/api';

const savedUser = JSON.parse(localStorage.getItem('simplequiz_user') || 'null');

export const login = createAsyncThunk('auth/login', async credentials => {
  const data = await request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) });
  localStorage.setItem('simplequiz_token', data.token);
  localStorage.setItem('simplequiz_user', JSON.stringify(data.user));
  return data;
});

export const signup = createAsyncThunk('auth/signup', async payload =>
  request('/auth/register', { method: 'POST', body: JSON.stringify(payload) })
);

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: savedUser, token: localStorage.getItem('simplequiz_token'), status: 'idle', error: null },
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.error = null;
      localStorage.removeItem('simplequiz_token');
      localStorage.removeItem('simplequiz_user');
    },
    clearAuthError(state) { state.error = null; }
  },
  extraReducers: builder => builder
    .addCase(login.pending, state => { state.status = 'loading'; state.error = null; })
    .addCase(login.fulfilled, (state, action) => { state.status = 'succeeded'; state.user = action.payload.user; state.token = action.payload.token; })
    .addCase(login.rejected, (state, action) => { state.status = 'failed'; state.error = action.error.message; })
    .addCase(signup.pending, state => { state.status = 'loading'; state.error = null; })
    .addCase(signup.fulfilled, state => { state.status = 'succeeded'; })
    .addCase(signup.rejected, (state, action) => { state.status = 'failed'; state.error = action.error.message; })
});

export const { clearAuthError, logout } = authSlice.actions;
export default authSlice.reducer;
