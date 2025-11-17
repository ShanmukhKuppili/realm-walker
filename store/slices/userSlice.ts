/**
 * User Redux Slice - Manages user authentication and profile state
 */
import { Resources, User, UserState } from '@/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: UserState = {
  user: null,
  resources: {
    gold: 0,
    mana: 0,
    health: 100,
    maxHealth: 100,
  },
  isAuthenticated: false,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.resources = initialState.resources;
    },
    updateUserProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    updateResources: (state, action: PayloadAction<Partial<Resources>>) => {
      state.resources = { ...state.resources, ...action.payload };
    },
    addXP: (state, action: PayloadAction<number>) => {
      if (state.user) {
        state.user.xp += action.payload;
        // Simple level-up logic: every 1000 XP = 1 level
        const newLevel = Math.floor(state.user.xp / 1000) + 1;
        if (newLevel > state.user.level) {
          state.user.level = newLevel;
        }
      }
    },
    addGold: (state, action: PayloadAction<number>) => {
      state.resources.gold += action.payload;
    },
    addMana: (state, action: PayloadAction<number>) => {
      state.resources.mana += action.payload;
    },
    incrementBlocksClaimed: (state) => {
      if (state.user) {
        state.user.totalBlocksClaimed += 1;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setUser,
  clearUser,
  updateUserProfile,
  updateResources,
  addXP,
  addGold,
  addMana,
  incrementBlocksClaimed,
  setLoading,
  setError,
} = userSlice.actions;

export default userSlice.reducer;
