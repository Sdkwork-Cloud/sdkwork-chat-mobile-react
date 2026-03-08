import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthState, SocialProvider } from '../types';
import { appAuthService } from '../services/appAuthService';

export interface AuthStore extends AuthState {
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
    (set) => ({
      // Initial state
      isAuthenticated: false,
      isLoading: false,
      user: null,
      token: null,
      error: null,

      // Login action
      login: async (username: string, password: string, remember = false) => {
        set({ isLoading: true, error: null });
        try {
          const session = await appAuthService.login({ username, password, remember });
          const user = {
            id: session.userId,
            username: session.username,
            name: session.displayName,
            avatar: '',
          };
          set({
            isAuthenticated: true,
            user,
            token: session.authToken,
            isLoading: false,
            error: null,
          });
          return true;
        } catch (error) {
          set({
            isAuthenticated: false,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Login failed',
          });
          return false;
        }
      },

      // Register action
      register: async (username: string, password: string, confirmPassword: string) => {
        set({ isLoading: true, error: null });
        try {
          const session = await appAuthService.register({
            username,
            password,
            confirmPassword,
          });
          const user = {
            id: session.userId,
            username: session.username,
            name: session.displayName,
            avatar: '',
          };
          set({
            isAuthenticated: true,
            user,
            token: session.authToken,
            isLoading: false,
            error: null,
          });
          return true;
        } catch (error) {
          set({
            isAuthenticated: false,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Registration failed',
          });
          return false;
        }
      },

      // Request password reset
      requestPasswordReset: async (account: string, channel?: 'EMAIL' | 'SMS') => {
        set({ isLoading: true, error: null });
        try {
          await appAuthService.requestPasswordReset({ account, channel });
          set({ isLoading: false, error: null });
          return true;
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to request password reset',
          });
          return false;
        }
      },

      // Verify password reset code
      verifyPasswordResetCode: async (account: string, code: string, channel?: 'EMAIL' | 'SMS') => {
        set({ isLoading: true, error: null });
        try {
          const verified = await appAuthService.verifyCode({
            target: account,
            code,
            scene: 'RESET_PASSWORD',
            verifyType: channel === 'EMAIL' ? 'EMAIL' : 'PHONE',
          });
          if (!verified) {
            set({ isLoading: false, error: 'Invalid or expired verification code' });
            return false;
          }
          set({ isLoading: false, error: null });
          return true;
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to verify reset code',
          });
          return false;
        }
      },

      // Reset password
      resetPassword: async (account: string, code: string, newPassword: string, confirmPassword: string) => {
        set({ isLoading: true, error: null });
        try {
          await appAuthService.resetPassword({
            account,
            code,
            newPassword,
            confirmPassword,
          });
          set({ isLoading: false, error: null });
          return true;
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to reset password',
          });
          return false;
        }
      },

      // Social login action
      loginWithSocial: async (provider: SocialProvider) => {
        set({ isLoading: true, error: null });
        try {
          const session = await appAuthService.loginWithSocial({ provider });
          const user = {
            id: session.userId,
            username: session.username,
            name: session.displayName,
            avatar: '',
          };
          set({
            isAuthenticated: true,
            user,
            token: session.authToken,
            isLoading: false,
            error: null,
          });
          return true;
        } catch (error) {
          set({
            isAuthenticated: false,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Social login failed',
          });
          return false;
        }
      },

      // Logout action
      logout: async () => {
        set({ isLoading: true });
        await appAuthService.logout();
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
        const session = await appAuthService.getCurrentSession();
        if (session) {
          const user = {
            id: session.userId,
            username: session.username,
            name: session.displayName,
            avatar: '',
          };
          set({
            isAuthenticated: true,
            user,
            token: session.authToken,
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
        try {
          const session = await appAuthService.refreshToken();
          set({ token: session.authToken });
          return true;
        } catch {
          return false;
        }
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

export const selectUser = (state: AuthStore) => state.user;
export const selectIsAuthenticated = (state: AuthStore) => state.isAuthenticated;
export const selectIsLoading = (state: AuthStore) => state.isLoading;
export const selectAuthError = (state: AuthStore) => state.error;
