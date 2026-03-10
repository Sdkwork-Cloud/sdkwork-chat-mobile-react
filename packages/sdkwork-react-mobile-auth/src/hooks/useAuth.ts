import { useCallback, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import type { SocialLoginRequest, SocialProvider } from '../types';

export function useAuth() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const error = useAuthStore((state) => state.error);

  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const requestPasswordReset = useAuthStore((state) => state.requestPasswordReset);
  const verifyPasswordResetCode = useAuthStore((state) => state.verifyPasswordResetCode);
  const resetPassword = useAuthStore((state) => state.resetPassword);
  const loginWithSocial = useAuthStore((state) => state.loginWithSocial);
  const logout = useAuthStore((state) => state.logout);
  const checkSession = useAuthStore((state) => state.checkSession);
  const clearError = useAuthStore((state) => state.clearError);

  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  const handleLogin = useCallback(
    async (username: string, password: string, remember?: boolean) => {
      return login(username, password, remember);
    },
    [login]
  );

  const handleRegister = useCallback(
    async (username: string, password: string, confirmPassword: string) => {
      return register(username, password, confirmPassword);
    },
    [register]
  );

  const handleSocialLogin = useCallback(
    async (input: SocialLoginRequest | SocialProvider) => {
      return loginWithSocial(input);
    },
    [loginWithSocial]
  );

  const handleRequestPasswordReset = useCallback(
    async (account: string, channel?: 'EMAIL' | 'SMS') => {
      return requestPasswordReset(account, channel);
    },
    [requestPasswordReset]
  );

  const handleResetPassword = useCallback(
    async (account: string, code: string, newPassword: string, confirmPassword: string) => {
      return resetPassword(account, code, newPassword, confirmPassword);
    },
    [resetPassword]
  );

  const handleVerifyPasswordResetCode = useCallback(
    async (account: string, code: string, channel?: 'EMAIL' | 'SMS') => {
      return verifyPasswordResetCode(account, code, channel);
    },
    [verifyPasswordResetCode]
  );

  const handleLogout = useCallback(async () => {
    await logout();
  }, [logout]);

  return {
    isAuthenticated,
    isLoading,
    user,
    token,
    error,
    login: handleLogin,
    register: handleRegister,
    requestPasswordReset: handleRequestPasswordReset,
    verifyPasswordResetCode: handleVerifyPasswordResetCode,
    resetPassword: handleResetPassword,
    loginWithSocial: handleSocialLogin,
    logout: handleLogout,
    clearError,
  };
}

export function useCurrentUser() {
  return useAuthStore((state) => state.user);
}

export function useIsAuthenticated() {
  return useAuthStore((state) => state.isAuthenticated);
}

export function useAuthToken() {
  return useAuthStore((state) => state.token);
}
