import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import appReducer from './slices/appSlice';


export const store = configureStore({
  reducer: {
    user: userReducer,
    app: appReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable for AsyncStorage compatibility
    }),
});


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
