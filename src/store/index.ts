import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import appReducer from './slices/appSlice';
import subscriptionReducer from './slices/subscriptionSlice';
import onboardingReducer from './slices/onboardingSlice';


export const store = configureStore({
  reducer: {
    user: userReducer,
    app: appReducer,
    subscription: subscriptionReducer,
    onboarding: onboardingReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable for AsyncStorage compatibility
    }),
});


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
