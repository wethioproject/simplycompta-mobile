import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SubscriptionData } from '../../types/subscription.types';
import subscriptionService from '../../services/subscriptionService';
import type { AppDispatch } from '../index';


interface SubscriptionState {
  data: SubscriptionData | null;
  loading: boolean;
  error: string | null;
}

const initialState: SubscriptionState = {
  data: null,
  loading: false,
  error: null,
};

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    setSubscriptionLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
      if (action.payload) state.error = null;
    },
    setSubscriptionSuccess: (state, action: PayloadAction<SubscriptionData>) => {
      state.data = action.payload;
      state.loading = false;
      state.error = null;
    },
    setSubscriptionError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearSubscription: (state) => {
      state.data = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  setSubscriptionLoading,
  setSubscriptionSuccess,
  setSubscriptionError,
  clearSubscription,
} = subscriptionSlice.actions;


export const loadSubscription = () => async (dispatch: AppDispatch) => {
  dispatch(setSubscriptionLoading(true));
  try {
    const data = await subscriptionService.getSubscriptionStatus();
    dispatch(setSubscriptionSuccess(data));
  } catch (err: any) {
    dispatch(setSubscriptionError(err?.response?.data?.message ?? 'Failed to load subscription'));
  }
};

export default subscriptionSlice.reducer;

