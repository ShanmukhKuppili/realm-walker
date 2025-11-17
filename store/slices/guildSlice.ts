/**
 * Guild Redux Slice - Manages guild membership and guild-related state
 */
import { Guild, GuildMember, GuildState } from '@/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: GuildState = {
  currentGuild: null,
  members: [],
  guilds: [],
  loading: false,
  error: null,
};

const guildSlice = createSlice({
  name: 'guild',
  initialState,
  reducers: {
    setCurrentGuild: (state, action: PayloadAction<Guild | null>) => {
      state.currentGuild = action.payload;
      state.error = null;
    },
    setGuildMembers: (state, action: PayloadAction<GuildMember[]>) => {
      state.members = action.payload;
    },
    setGuilds: (state, action: PayloadAction<Guild[]>) => {
      state.guilds = action.payload;
    },
    addGuildMember: (state, action: PayloadAction<GuildMember>) => {
      state.members.push(action.payload);
      if (state.currentGuild) {
        state.currentGuild.memberCount += 1;
      }
    },
    removeGuildMember: (state, action: PayloadAction<string>) => {
      state.members = state.members.filter((m) => m.userId !== action.payload);
      if (state.currentGuild) {
        state.currentGuild.memberCount -= 1;
      }
    },
    leaveGuild: (state) => {
      state.currentGuild = null;
      state.members = [];
    },
    updateGuild: (state, action: PayloadAction<Partial<Guild>>) => {
      if (state.currentGuild) {
        state.currentGuild = { ...state.currentGuild, ...action.payload };
      }
    },
    setGuildLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setGuildError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setCurrentGuild,
  setGuildMembers,
  setGuilds,
  addGuildMember,
  removeGuildMember,
  leaveGuild,
  updateGuild,
  setGuildLoading,
  setGuildError,
} = guildSlice.actions;

export default guildSlice.reducer;
