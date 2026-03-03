import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthState, AuthResponse, SocialProvider } from '../types';
import { authService } from '../services/AuthService';

interface AuthStore extends AuthState {
  // Actions
  login: (username: string, password: string, remember?: boolean) => Promise<boolean>;
  register: (username: string, password: string, confirmPassword: string) => Promise<boolean>;
  requestPasswordReset: (account: string, channel?: 'EMAIL' | 'SMS') => Promise<boolean>;
  verifyPasswordResetCode: (account: string, code: string, channel?: 'EMAIL' | 'SMS') => Promise<boolean>;
  resetPassword: (account: string, code: string, newPassword: string, confirmPassword: string) => Promise<boolean>;
  loginWithSocial: (provider: SocialProvider) => Promise<boolean>;
  logout: () => Promise<void>;
  checkSession: () => Promise<boolean>;
  refreshToken: () => Promise<boolean>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      isAuthenticated: false,
      isLoading: false,
      user: null,
      token: null,
      error: null,

      // Login action
      login: async (username: string, password: string, remember = false) => {
        set({ isLoading: true, error: null });
        
        const result = await authService.login({ username, password, remember });
        
        if (result.success && result.data) {
          set({
            isAuthenticated: true,
            user: result.data.user,
            token: result.data.token,
            isLoading: false,
            error: null,
          });
          return true;
        } else {
          set({
            isAuthenticated: false,
            isLoading: false,
            error: result.error || 'Login failed',
          });
          return false;
        }
      },

      // Register action
      register: async (username: string, password: string, confirmPassword: string) => {
        set({ isLoading: true, error: null });
        
        const result = await authService.register({
          username,
          password,
          confirmPassword,
        });
        
        if (result.success && result.data) {
          set({
            isAuthenticated: true,
            user: result.data.user,
            token: result.data.token,
            isLoading: false,
            error: null,
          });
          return true;
        } else {
          set({
            isAuthenticated: false,
            isLoading: false,
            error: result.error || 'Registration failed',
          });
          return false;
        }
      },

      // Request password reset
      requestPasswordReset: async (account: string, channel?: 'EMAIL' | 'SMS') => {
        set({ isLoading: true, error: null });

        const result = await authService.requestPasswordReset({ account, channel });
        if (result.success) {
          set({ isLoading: false, error: null });
          return true;
        }

        set({
          isLoading: false,
          error: result.error || 'Failed to request password reset',
        });
        return false;
      },

      // Verify password reset code
      verifyPasswordResetCode: async (account: string, code: string, channel?: 'EMAIL' | 'SMS') => {
        set({ isLoading: true, error: null });

        const result = await authService.verifyPasswordResetCode({ account, code, channel });
        if (result.success) {
          set({ isLoading: false, error: null });
          return true;
        }

        set({
          isLoading: false,
          error: result.error || 'Failed to verify reset code',
        });
        return false;
      },

      // Reset password
      resetPassword: async (account: string, code: string, newPassword: string, confirmPassword: string) => {
        set({ isLoading: true, error: null });

        const result = await authService.resetPassword({
          account,
          code,
          newPassword,
          confirmPassword,
        });
        if (result.success) {
          set({ isLoading: false, error: null });
          return true;
        }

        set({
          isLoading: false,
          error: result.error || 'Failed to reset password',
        });
        return false;
      },

      // Social login action
      loginWithSocial: async (provider: SocialProvider) => {
        set({ isLoading: true, error: null });
        
        const result = await authService.loginWithSocial(provider);
        
        if (result.success && result.data) {
          set({
            isAuthenticated: true,
            user: result.data.user,
            token: result.data.token,
            isLoading: false,
            error: null,
          });
          return true;
        } else {
          set({
            isAuthenticated: false,
            isLoading: false,
            error: result.error || 'Social login failed',
          });
          return false;
        }
      },

      // Logout action
      logout: async () => {
        set({ isLoading: true });
        await authService.logout();
        set({
          isAuthenticated: false,
          user: null,
          token: null,
          isLoading: false,
          error: null,
        });
      },

      // Check session action
      checkSession: async () => {
        const result = await authService.checkSession();
        
        if (result.success && result.data) {
          set({
            isAuthenticated: true,
            user: result.data.user,
            token: result.data.token,
            error: null,
          });
          return true;
        } else {
          set({
            isAuthenticated: false,
            user: null,
            token: null,
          });
          return false;
        }
      },

      // Refresh token action
      refreshToken: async () => {
        const result = await authService.refreshToken();
        
        if (result.success && result.data) {
          set({ token: result.data });
          return true;
        }
        return false;
      },

      // Clear error
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token,
      }),
    }
  )
);
