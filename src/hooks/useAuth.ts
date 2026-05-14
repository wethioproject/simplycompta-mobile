import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import authService, { LoginCredentials, RegisterPayload } from '../services/authService';
import { loginSuccess, loginFailure, logout as logoutAction, setLoading } from '../store/slices/userSlice';
import { resetOnboardingSession } from '../store/slices/onboardingSlice';
import { RootState } from '../store';


export const useAuth = () => {
  const dispatch = useDispatch();
  const { customer, token, isAuthenticated, isLoading, error } = useSelector(
    (state: RootState) => state.user
  );

  /**
   * Login function
   */
  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      dispatch(setLoading(true));

      const response = await authService.login(credentials);

      dispatch(loginSuccess({
        customer: response.customer,
        token: response.token,
      }));

      return { success: true };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      dispatch(loginFailure(errorMessage));
      return { success: false, error: errorMessage };
    }
  }, [dispatch]);

  const resetPassword = useCallback(async (current_password: string, new_password: string, new_password_confirmation: string) => {
    try {
      await authService.resetPassword(current_password, new_password, new_password_confirmation);
      return { success: true }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'password reset failed. please try again.'
      return { success: false, error: errorMessage }
    }
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    try {
      const res = await authService.forgotPassword(email);
      return { success: true, message: res.message }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Forgot password request failed. Please try again.';
      return { success: false, error: errorMessage };
    }
  }, [])

  const forgotPasswordOtp = useCallback(async (email: string, otp: string, password: string, password_confirmation: string) => {
    try {
      await authService.forgotPasswordOtp(email, otp, password, password_confirmation);
      return { success: true }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Forgot password OTP verification failed. Please try again.';
      return { success: false, error: errorMessage };
    }
  }, [])

  const checkEmail = useCallback(async (email: string) => {
    try {
      const res = await authService.checkEmail(email);
      return { success: true, exists: res.exists };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Email check failed. Please try again.';
      return { success: false, exists: false, error: errorMessage };
    }
  }, []);

  const verifyOtp = useCallback(async (email: string, otp: string) => {
    try {
      dispatch(setLoading(true));
      const res = await authService.verifyOtp(email, otp);
      return { success: true, message: res.message };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'OTP verification failed. Please try again.';
      return { success: false, error: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  /**
   * Register a new customer
   */
  const signup = useCallback(async (payload: RegisterPayload) => {
    try {
      dispatch(setLoading(true));
      const response = await authService.register(payload);
      dispatch(resetOnboardingSession());
      dispatch(loginSuccess({
        customer: response.customer,
        token: response.token,
      }));
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      dispatch(loginFailure(errorMessage));
      return { success: false, error: errorMessage };
    }
  }, [dispatch]);

  /**
   * Logout function
   */
  const logout = useCallback(async () => {
    try {
      await authService.logout();
      dispatch(resetOnboardingSession());
      dispatch(logoutAction());
    } catch (error) {
      console.error('Logout error:', error);
      // Still logout locally even if API fails
      dispatch(resetOnboardingSession());
      dispatch(logoutAction());
    }
  }, [dispatch]);

  /**
   * Check and restore authentication state on app start
   */
  const checkAuth = useCallback(async () => {
    try {
      const token = await authService.getToken();
      const customer = await authService.getCustomer();

      if (token && customer) {
        dispatch(loginSuccess({ customer, token }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Check auth error:', error);
      return false;
    }
  }, [dispatch]);

  return {
    // State
    customer,
    token,
    isAuthenticated,
    isLoading,
    error,
    // Actions
    login,
    signup,
    checkEmail,
    verifyOtp,
    resetPassword,
    logout,
    forgotPassword,
    forgotPasswordOtp,
    checkAuth,
  };
};