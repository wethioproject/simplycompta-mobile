import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AppState {
  isEnableLogin: 0 | 1;
}

const initialState: AppState = {
  isEnableLogin: 1,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setIsEnableLogin: (state, action: PayloadAction<0 | 1>) => {
      state.isEnableLogin = action.payload;
    },
  },
});

export const { setIsEnableLogin } = appSlice.actions;
export default appSlice.reducer;
