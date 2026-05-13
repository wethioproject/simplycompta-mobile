import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OnboardingChecklistState, ChecklistItem, ChecklistItemAPI } from '../../types/onboarding.types';
import { CHECKLIST_STATIC, DEFAULT_CHECKLIST_ITEMS } from '../../constants/onboardingChecklist';
import { fetchOnboardingChecklist } from '../../services/onboardingService';

const STORAGE_KEY = 'hasSeenOnboardingChecklist';


export const markChecklistSeen = createAsyncThunk(
  'onboarding/markChecklistSeen',
  async () => {
    await AsyncStorage.setItem(STORAGE_KEY, 'true');
    return true;
  },
);


export const fetchChecklist = createAsyncThunk(
  'onboarding/fetchChecklist',
  async (_, { dispatch }) => {
    const apiItems = await fetchOnboardingChecklist();
    const statusMap = new Map(apiItems.map(i => [i.id, i.status]));
    const items = CHECKLIST_STATIC.map(item => ({
      ...item,
      status: statusMap.get(item.id) ?? 'pending',
    }));
    if (items.every(i => i.status === 'completed')) {
      dispatch(markChecklistSeen());
    } else {
      await AsyncStorage.removeItem(STORAGE_KEY);
    }
    return items;
  },
);


const initialState: OnboardingChecklistState = {
  showChecklist: false,
  hasSeenChecklist: null,
  checklistItems: DEFAULT_CHECKLIST_ITEMS,
  dismissedInSession: false,
};

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    hideChecklist(state) {
      state.showChecklist = false;
      state.dismissedInSession = true;
    },
    hideChecklistForNavigation(state) {
      state.showChecklist = false;
    },
    resetOnboardingSession(state) {
      state.dismissedInSession = false;
      state.showChecklist = false;
      state.hasSeenChecklist = null;
      state.checklistItems = DEFAULT_CHECKLIST_ITEMS;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(markChecklistSeen.fulfilled, state => {
        state.hasSeenChecklist = true;
        state.showChecklist = false;
      })
      .addCase(fetchChecklist.fulfilled, (state, action) => {
        state.checklistItems = action.payload;
        const allDone = action.payload.every(i => i.status === 'completed');
        if (!state.dismissedInSession) {
          state.showChecklist = !allDone;
        }
      });
  },
});


export const { hideChecklist, hideChecklistForNavigation, resetOnboardingSession } =
  onboardingSlice.actions;


export default onboardingSlice.reducer;

