/**
 * Resource Slice
 * Manages passive resource generation and collection
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ResourceState {
  lastCollectionTime: string | null; // ISO timestamp
  pendingGold: number;
  isCollecting: boolean;
  collectionError: string | null;
  // Hourly generation rate (calculated from owned blocks)
  goldPerHour: number;
}

const initialState: ResourceState = {
  lastCollectionTime: null,
  pendingGold: 0,
  isCollecting: false,
  collectionError: null,
  goldPerHour: 0,
};

const resourceSlice = createSlice({
  name: 'resource',
  initialState,
  reducers: {
    // Initialize resource tracking (called on app start or login)
    initializeResources: (state, action: PayloadAction<{ lastCollectionTime?: string }>) => {
      const now = new Date().toISOString();
      state.lastCollectionTime = action.payload.lastCollectionTime || now;
      state.pendingGold = 0;
      state.isCollecting = false;
      state.collectionError = null;
      state.goldPerHour = 0;
    },

    // Update gold per hour rate (called when blocks change)
    updateGoldPerHour: (state, action: PayloadAction<number>) => {
      state.goldPerHour = action.payload;
    },

    // Update pending resources (calculated from time elapsed)
    updatePendingResources: (state, action: PayloadAction<number>) => {
      state.pendingGold = action.payload;
    },

    // Start collection process
    startCollecting: (state) => {
      state.isCollecting = true;
      state.collectionError = null;
    },

    // Collection successful
    collectResourcesSuccess: (
      state,
      action: PayloadAction<{
        collected: number;
        newCollectionTime: string;
      }>
    ) => {
      state.isCollecting = false;
      state.pendingGold = 0;
      state.lastCollectionTime = action.payload.newCollectionTime;
      state.collectionError = null;
    },

    // Collection failed
    collectResourcesFailure: (state, action: PayloadAction<string>) => {
      state.isCollecting = false;
      state.collectionError = action.payload;
    },

    // Reset resource state (on logout)
    resetResources: (state) => {
      state.lastCollectionTime = null;
      state.pendingGold = 0;
      state.isCollecting = false;
      state.collectionError = null;
      state.goldPerHour = 0;
    },

    // Mock hourly update (for testing without backend)
    simulateHourlyUpdate: (state) => {
      if (state.lastCollectionTime && state.goldPerHour > 0) {
        const lastCollection = new Date(state.lastCollectionTime);
        const now = new Date();
        const hoursElapsed = (now.getTime() - lastCollection.getTime()) / (1000 * 60 * 60);
        
        state.pendingGold = Math.floor(state.goldPerHour * hoursElapsed);
      }
    },
  },
});

export const {
  initializeResources,
  updateGoldPerHour,
  updatePendingResources,
  startCollecting,
  collectResourcesSuccess,
  collectResourcesFailure,
  resetResources,
  simulateHourlyUpdate,
} = resourceSlice.actions;

export default resourceSlice.reducer;
