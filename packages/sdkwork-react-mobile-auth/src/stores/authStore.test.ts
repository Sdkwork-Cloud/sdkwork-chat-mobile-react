import { beforeEach, describe, expect, it, vi } from 'vitest';

const serviceMocks = vi.hoisted(() => ({
  login: vi.fn(),
  register: vi.fn(),
  restoreSession: vi.fn(),
  logout: vi.fn(),
  refreshToken: vi.fn(),
  requestPasswordReset: vi.fn(),
  verifyCode: vi.fn(),
  resetPassword: vi.fn(),
  loginWithSocial: vi.fn(),
  getCurrentSession: vi.fn(),
}));

vi.mock('zustand/middleware', async () => {
  const actual = await vi.importActual<typeof import('zustand/middleware')>('zustand/middleware');
  return {
    ...actual,
    persist: ((initializer: unknown) => initializer) as typeof actual.persist,
  };
});

vi.mock('../services/appAuthService', () => ({
  appAuthService: serviceMocks,
}));

describe('authStore', () => {
  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('starts in idle state', async () => {
    const { useAuthStore } = await import('./authStore');

    expect(useAuthStore.getState().authStatus).toBe('idle');
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('moves to authenticated state after initializeAuth restores a session', async () => {
    serviceMocks.restoreSession.mockResolvedValue({
      userId: 'u_1',
      username: 'system',
      displayName: 'System User',
      authToken: 'auth-token',
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });

    const { useAuthStore } = await import('./authStore');

    const promise = useAuthStore.getState().initializeAuth();
    expect(useAuthStore.getState().authStatus).toBe('restoring');

    await promise;

    expect(useAuthStore.getState()).toMatchObject({
      authStatus: 'authenticated',
      isAuthenticated: true,
      token: 'auth-token',
      user: {
        id: 'u_1',
        username: 'system',
        name: 'System User',
        avatar: '',
      },
    });
  });

  it('moves to logged_out state after logout', async () => {
    serviceMocks.logout.mockResolvedValue(undefined);

    const { useAuthStore } = await import('./authStore');
    useAuthStore.setState({
      ...useAuthStore.getState(),
      authStatus: 'authenticated',
      isAuthenticated: true,
      token: 'auth-token',
      user: {
        id: 'u_2',
        username: 'demo',
        name: 'Demo User',
        avatar: '',
      },
    });

    await useAuthStore.getState().logout();

    expect(useAuthStore.getState()).toMatchObject({
      authStatus: 'logged_out',
      isAuthenticated: false,
      token: null,
      user: null,
      error: null,
    });
  });

  it('moves to error state after initializeAuth restore failure', async () => {
    serviceMocks.restoreSession.mockRejectedValue(new Error('restore failed'));

    const { useAuthStore } = await import('./authStore');

    await expect(useAuthStore.getState().initializeAuth()).resolves.toBe(false);

    expect(useAuthStore.getState()).toMatchObject({
      authStatus: 'error',
      isAuthenticated: false,
      token: null,
      user: null,
      error: 'restore failed',
    });
  });
});
