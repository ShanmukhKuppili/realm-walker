/**
 * Location Redux Slice - Manages GPS tracking and current location state
 */
import { Block, Coordinates, LocationState } from '@/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: LocationState = {
  currentLocation: null,
  currentBlock: null,
  isTracking: false,
  permission: 'undetermined',
  error: null,
  latitude: null,
  longitude: null,
  accuracy: null,
  timestamp: null,
};

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setCurrentLocation: (state, action: PayloadAction<Coordinates>) => {
      state.currentLocation = action.payload;
      state.error = null;
    },
    updateLocation: (
      state,
      action: PayloadAction<{
        latitude: number;
        longitude: number;
        accuracy: number | null;
        timestamp: number;
      }>
    ) => {
      state.latitude = action.payload.latitude;
      state.longitude = action.payload.longitude;
      state.accuracy = action.payload.accuracy;
      state.timestamp = action.payload.timestamp;
      state.currentLocation = {
        latitude: action.payload.latitude,
        longitude: action.payload.longitude,
      };
      state.error = null;
    },
    setCurrentBlock: (state, action: PayloadAction<Block | null>) => {
      state.currentBlock = action.payload;
    },
    setTracking: (state, action: PayloadAction<boolean>) => {
      state.isTracking = action.payload;
    },
    setPermission: (
      state,
      action: PayloadAction<'granted' | 'denied' | 'undetermined'>
    ) => {
      state.permission = action.payload;
    },
    setLocationError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearLocation: (state) => {
      state.currentLocation = null;
      state.currentBlock = null;
      state.isTracking = false;
      state.latitude = null;
      state.longitude = null;
      state.accuracy = null;
      state.timestamp = null;
    },
  },
});

export const {
  setCurrentLocation,
  updateLocation,
  setCurrentBlock,
  setTracking,
  setPermission,
  setLocationError,
  clearLocation,
} = locationSlice.actions;

export default locationSlice.reducer;
