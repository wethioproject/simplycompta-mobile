import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Customer } from '../../services/authService';


interface UserState {
  customer: Customer | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: any;
}


const initialState: UserState = {
  customer: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};


const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
      state.error = null;
    },

    // Login success - set user data and token
    loginSuccess: (state, action: PayloadAction<{ customer: Customer; token: string }>) => {
      state.customer = action.payload.customer;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
    },

    // Login failure
    loginFailure: (state, action: PayloadAction<string>) => {
      state.customer = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = action.payload;
    },

    // Logout - clear all user data
    logout: (state) => {
      state.customer = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
    },

    // Update customer data
    updateCustomer: (state, action: PayloadAction<Partial<Customer>>) => {
      if (state.customer) {
        state.customer = { ...state.customer, ...action.payload };
      }
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
});


export const {
  setLoading,
  loginSuccess,
  loginFailure,
  logout,
  updateCustomer,
  clearError,
} = userSlice.actions;

export default userSlice.reducer;