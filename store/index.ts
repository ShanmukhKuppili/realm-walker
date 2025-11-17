/**
 * Redux Store Configuration
 * Combines all slices and configures middleware
 */
import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authReducer from './slices/authSlice';
import guildReducer from './slices/guildSlice';
import locationReducer from './slices/locationSlice';
import mapReducer from './slices/mapSlice';
import playerReducer from './slices/playerSlice';
import resourceReducer from './slices/resourceSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    player: playerReducer,
    location: locationReducer,
    map: mapReducer,
    guild: guildReducer,
    resource: resourceReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serialization checks
        ignoredActions: ['location/setCurrentLocation'],
      },
    }),
});

// Infer types from store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks for use throughout the app
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
