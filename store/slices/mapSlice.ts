/**
 * Map Redux Slice - Manages map blocks and territory state
 */
import { Block, MapState } from '@/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: MapState = {
  blocks: {},
  visibleBlocks: [],
  selectedBlock: null,
  loading: false,
  error: null,
};

const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    setBlocks: (state, action: PayloadAction<Block[]>) => {
      const blocksMap: { [key: string]: Block } = {};
      action.payload.forEach((block) => {
        blocksMap[block.id] = block;
      });
      state.blocks = { ...state.blocks, ...blocksMap };
    },
    updateBlock: (state, action: PayloadAction<Block>) => {
      state.blocks[action.payload.id] = action.payload;
    },
    claimBlock: (state, action: PayloadAction<{ blockId: string; userId: string }>) => {
      const block = state.blocks[action.payload.blockId];
      if (block) {
        block.ownerId = action.payload.userId;
        block.ownerType = 'user';
        block.claimedAt = new Date().toISOString();
        // Set expiration to 7 days from now
        block.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      }
    },
    unclaimBlock: (state, action: PayloadAction<string>) => {
      const block = state.blocks[action.payload];
      if (block) {
        block.ownerId = undefined;
        block.ownerType = 'neutral';
        block.claimedAt = undefined;
        block.expiresAt = undefined;
      }
    },
    setVisibleBlocks: (state, action: PayloadAction<string[]>) => {
      state.visibleBlocks = action.payload;
    },
    setSelectedBlock: (state, action: PayloadAction<Block | null>) => {
      state.selectedBlock = action.payload;
    },
    setMapLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setMapError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearMap: (state) => {
      state.blocks = {};
      state.visibleBlocks = [];
      state.selectedBlock = null;
    },
  },
});

export const {
  setBlocks,
  updateBlock,
  claimBlock,
  unclaimBlock,
  setVisibleBlocks,
  setSelectedBlock,
  setMapLoading,
  setMapError,
  clearMap,
} = mapSlice.actions;

export default mapSlice.reducer;
