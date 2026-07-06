import { createSlice } from '@reduxjs/toolkit';

// Retrieve stored state if it exists
const storedUser = localStorage.getItem('vks_user')
  ? JSON.parse(localStorage.getItem('vks_user'))
  : null;
const storedToken = localStorage.getItem('vks_token') || null;

const storedAdmin = localStorage.getItem('vks_admin')
  ? JSON.parse(localStorage.getItem('vks_admin'))
  : null;
const storedAdminToken = localStorage.getItem('vks_admin_token') || null;

const initialState = {
  user: storedUser,
  token: storedToken,
  admin: storedAdmin,
  adminToken: storedAdminToken,
  isAuthenticated: !!storedToken,
  isAdminAuthenticated: !!storedAdminToken,
  loading: false,
  error: null,
  otpVerificationEmail: null // Store email temporary for OTP input screen redirection
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    authSuccess: (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem('vks_user', JSON.stringify(action.payload.user));
      localStorage.setItem('vks_token', action.payload.token);
    },
    adminAuthSuccess: (state, action) => {
      state.loading = false;
      state.admin = action.payload.admin;
      state.adminToken = action.payload.token;
      state.isAdminAuthenticated = true;
      localStorage.setItem('vks_admin', JSON.stringify(action.payload.admin));
      localStorage.setItem('vks_admin_token', action.payload.token);
    },
    authFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setOtpVerificationEmail: (state, action) => {
      state.otpVerificationEmail = action.payload;
    },
    updateProfileAddresses: (state, action) => {
      if (state.user) {
        state.user.addresses = action.payload;
        localStorage.setItem('vks_user', JSON.stringify(state.user));
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('vks_user');
      localStorage.removeItem('vks_token');
    },
    logoutAdmin: (state) => {
      state.admin = null;
      state.adminToken = null;
      state.isAdminAuthenticated = false;
      localStorage.removeItem('vks_admin');
      localStorage.removeItem('vks_admin_token');
    },
    clearAuthError: (state) => {
      state.error = null;
    }
  }
});

export const {
  authStart,
  authSuccess,
  adminAuthSuccess,
  authFailure,
  setOtpVerificationEmail,
  updateProfileAddresses,
  logout,
  logoutAdmin,
  clearAuthError
} = authSlice.actions;

export default authSlice.reducer;
