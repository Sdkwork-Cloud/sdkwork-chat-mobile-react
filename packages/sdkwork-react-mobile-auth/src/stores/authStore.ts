import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthState, SocialLoginRequest, SocialProvider } from '../types';
import { appAuthService } from '../services/AppAuthService';

export type AuthStatus = 'idle' | 'restoring' | 'authenticated' | 'logged_out' | 'error';

export interface AuthStore extends AuthState {
  authStatus: AuthStatus;
  // Actions
  initializeAuth: () => Promise<boolean>;
  login: (username: string, password: string, remember?: boolean) => Promise<boolean>;
  register: (username: string, password: string, confirmPassword: string) => Promise<boolean>;
  requestPasswordReset: (account: string, channel?: 'EMAIL' | 'SMS') => Promise<boolean>;
  verifyPasswordResetCode: (account: string, code: string, channel?: 'EMAIL' | 'SMS') => Promise<boolean>;
  resetPassword: (account: string, code: string, newPassword: string, confirmPassword: string) => Promise<boolean>;
  loginWithSocial: (input: SocialLoginRequest | SocialProvider) => Promise<boolean>;
  logout: () => Promise<void>;
  checkSession: () => Promise<boolean>;
  refreshSession: () => Promise<boolean>;
  refreshToken: () => Promise<boolean>;
  clearError: () => void;
}

function mapSessionToAuthUser(session: {
  userId: string;
  username: string;
  displayName: string;
}) {
  return {
    id: session.userId,
    username: session.username,
    name: session.displayName,
    avatar: '',
  };
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      authStatus: 'idle',
      isAuthenticated: false,
      isLoading: false,
      user: null,
      token: null,
      error: null,

      initializeAuth: async () => {
        set({
          authStatus: 'restoring',
          isLoading: true,
          error: null,
        });

        try {
          const session = await appAuthService.restoreSession();
          if (!session) {
            set({
              authStatus: 'logged_out',
              isAuthenticated: false,
              isLoading: false,
              user: null,
              token: null,
              error: null,
            });
            return false;
          }

          set({
            authStatus: 'authenticated',
            isAuthenticated: true,
            isLoading: false,
            user: mapSessionToAuthUser(session),
            token: session.authToken,
            error: null,
          });
          return true;
        } catch (error) {
          set({
            authStatus: 'error',
            isAuthenticated: false,
            isLoading: false,
            user: null,
            token: null,
            error: error instanceof Error ? error.message : 'Failed to restore session',
          });
          return false;
        }
      },

      // Login action
      login: async (username: string, password: string, remember = false) => {
        set({ isLoading: true, error: null });
        try {
          const session = await appAuthService.login({ username, password, remember });
          set({
            authStatus: 'authenticated',
            isAuthenticated: true,
            user: mapSessionToAuthUser(session),
            token: session.authToken,
            isLoading: false,
            error: null,
          });
          return true;
        } catch (error) {
          set({
            authStatus: 'error',
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
          set({
            authStatus: 'authenticated',
            isAuthenticated: true,
            user: mapSessionToAuthUser(session),
            token: session.authToken,
            isLoading: false,
            error: null,
          });
          return true;
        } catch (error) {
          set({
            authStatus: 'error',
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
      loginWithSocial: async (input: SocialLoginRequest | SocialProvider) => {
        set({ isLoading: true, error: null });
        try {
          const request = typeof input === 'string' ? { provider: input } : input;
          const session = await appAuthService.loginWithSocial(request);
          set({
            authStatus: 'authenticated',
            isAuthenticated: true,
            user: mapSessionToAuthUser(session),
            token: session.authToken,
            isLoading: false,
            error: null,
          });
          return true;
        } catch (error) {
          set({
            authStatus: 'error',
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
          authStatus: 'logged_out',
          isAuthenticated: false,
          user: null,
          token: null,
          isLoading: false,
          error: null,
        });
      },

      // Check session action
      checkSession: async () => {
        return get().initializeAuth();
      },

      refreshSession: async () => {
        try {
          const session = await appAuthService.refreshToken();
          set({
            authStatus: 'authenticated',
            isAuthenticated: true,
            user: mapSessionToAuthUser(session),
            token: session.authToken,
            error: null,
          });
          return true;
        } catch (error) {
          set({
            authStatus: 'error',
            isAuthenticated: false,
            token: null,
            error: error instanceof Error ? error.message : 'Failed to refresh session',
          });
          return false;
        }
      },

      // Refresh token action
      refreshToken: async () => {
        return get().refreshSession();
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
export const selectAuthStatus = (state: AuthStore) => state.authStatus;
export const selectSessionIdentity = (state: AuthStore) =>
  state.user
    ? {
        userId: state.user.id,
        username: state.user.username,
        displayName: state.user.name,
      }
    : null;
