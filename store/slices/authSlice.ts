/**
 * Auth Redux Slice
 * Manages authentication state with async thunks for sign up, sign in, sign out
 */
import * as authService from '@/services/authService';
import { User } from '@/types';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

// Auth state interface
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitializing: true,
  error: null,
  successMessage: null,
};

// Async thunks

/**
 * Initialize auth state (check if user is already logged in)
 */
export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { rejectWithValue }) => {
    try {
      const { user } = await authService.restoreAuthState();
      return user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to initialize auth');
    }
  }
);

/**
 * Sign up new user
 */
export const signUpUser = createAsyncThunk(
  'auth/signUp',
  async (
    { email, password, displayName }: { email: string; password: string; displayName: string },
    { rejectWithValue }
  ) => {
    try {
      const { user } = await authService.signUp(email, password, displayName);
      return user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Sign up failed');
    }
  }
);

/**
 * Sign in existing user
 */
export const signInUser = createAsyncThunk(
  'auth/signIn',
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const { user } = await authService.signIn(email, password);
      return user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Sign in failed');
    }
  }
);

/**
 * Sign out current user
 */
export const signOutUser = createAsyncThunk(
  'auth/signOut',
  async (_, { rejectWithValue }) => {
    try {
      await authService.signOut();
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Sign out failed');
    }
  }
);

/**
 * Reset password
 */
export const resetUserPassword = createAsyncThunk(
  'auth/resetPassword',
  async (email: string, { rejectWithValue }) => {
    try {
      await authService.resetPassword(email);
      return 'Password reset email sent successfully';
    } catch (error: any) {
      return rejectWithValue(error.message || 'Password reset failed');
    }
  }
);

/**
 * Refresh user profile
 */
export const refreshUserProfile = createAsyncThunk(
  'auth/refreshProfile',
  async (userId: string, { rejectWithValue }) => {
    try {
      const user = await authService.getUserProfile(userId);
      if (!user) {
        throw new Error('User profile not found');
      }
      return user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to refresh profile');
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Clear error message
    clearAuthError: (state) => {
      state.error = null;
    },
    // Clear success message
    clearAuthSuccess: (state) => {
      state.successMessage = null;
    },
    // Set user (for manual updates)
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    // Clear user
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
    // Update user profile (partial update)
    updateUserProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    // Initialize auth
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.isInitializing = true;
        state.error = null;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isInitializing = false;
        if (action.payload) {
          state.user = action.payload;
          state.isAuthenticated = true;
        }
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.isInitializing = false;
        state.error = action.payload as string;
      });

    // Sign up
    builder
      .addCase(signUpUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(signUpUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.successMessage = 'Account created successfully!';
      })
      .addCase(signUpUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Sign in
    builder
      .addCase(signInUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(signInUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.successMessage = 'Welcome back!';
      })
      .addCase(signInUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Sign out
    builder
      .addCase(signOutUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signOutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.successMessage = 'Signed out successfully';
      })
      .addCase(signOutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Reset password
    builder
      .addCase(resetUserPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(resetUserPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = action.payload;
      })
      .addCase(resetUserPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Refresh profile
    builder
      .addCase(refreshUserProfile.pending, (state) => {
        state.error = null;
      })
      .addCase(refreshUserProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(refreshUserProfile.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const {
  clearAuthError,
  clearAuthSuccess,
  setUser,
  clearUser,
  updateUserProfile,
} = authSlice.actions;

export default authSlice.reducer;
