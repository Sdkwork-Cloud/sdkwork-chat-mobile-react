import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const client = {
    auth: {
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshToken: vi.fn(),
      sendSmsCode: vi.fn(),
      verifySmsCode: vi.fn(),
      requestPasswordResetChallenge: vi.fn(),
      resetPassword: vi.fn(),
      getOauthUrl: vi.fn(),
      oauthLogin: vi.fn(),
    },
    user: {
      getUserProfile: vi.fn(),
    },
  };

  return {
    client,
    applyAppSdkSessionTokens: vi.fn(),
    clearAppImSdkSession: vi.fn(),
    clearAppSdkSessionTokens: vi.fn(),
    getAppSdkClientWithSession: vi.fn(() => client),
    persistAppSdkSessionTokens: vi.fn(),
    readAppSdkSessionTokens: vi.fn(),
    resolveAppSdkAccessToken: vi.fn(() => 'runtime-access-token'),
    syncAppImSdkSession: vi.fn(),
  };
});

vi.mock('../sdk/useAppSdkClient', () => ({
  applyAppSdkSessionTokens: mocks.applyAppSdkSessionTokens,
  clearAppSdkSessionTokens: mocks.clearAppSdkSessionTokens,
  getAppSdkClientWithSession: mocks.getAppSdkClientWithSession,
  persistAppSdkSessionTokens: mocks.persistAppSdkSessionTokens,
  readAppSdkSessionTokens: mocks.readAppSdkSessionTokens,
  resolveAppSdkAccessToken: mocks.resolveAppSdkAccessToken,
}));

vi.mock('@sdkwork/react-mobile-core/im', () => ({
  clearAppImSdkSession: mocks.clearAppImSdkSession,
  syncAppImSdkSession: mocks.syncAppImSdkSession,
}));

describe('appAuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.readAppSdkSessionTokens.mockReturnValue({
      authToken: 'persisted-auth-token',
      accessToken: 'persisted-access-token',
      refreshToken: 'persisted-refresh-token',
    });
  });

  it('restores session when persisted tokens are valid and profile fetch succeeds', async () => {
    mocks.client.user.getUserProfile.mockResolvedValue({
      data: {
        id: 42,
        username: 'system',
        nickname: 'System User',
      },
    });

    const { appAuthService } = await import('./AppAuthService');

    await expect(appAuthService.restoreSession()).resolves.toEqual({
      userId: '42',
      username: 'system',
      displayName: 'System User',
      authToken: 'persisted-auth-token',
      accessToken: 'runtime-access-token',
      refreshToken: 'persisted-refresh-token',
    });

    expect(mocks.clearAppSdkSessionTokens).not.toHaveBeenCalled();
    expect(mocks.syncAppImSdkSession).toHaveBeenCalledWith({
      userId: '42',
      username: 'system',
      displayName: 'System User',
      authToken: 'persisted-auth-token',
      accessToken: 'runtime-access-token',
      refreshToken: 'persisted-refresh-token',
    });
  });

  it('clears session when restore fails with invalid auth semantics', async () => {
    mocks.client.user.getUserProfile.mockRejectedValue(
      Object.assign(new Error('Unauthorized'), { status: 401, code: 'UNAUTHORIZED' }),
    );

    const { appAuthService } = await import('./AppAuthService');

    await expect(appAuthService.restoreSession()).resolves.toBeNull();
    expect(mocks.clearAppSdkSessionTokens).toHaveBeenCalledTimes(1);
    expect(mocks.clearAppImSdkSession).toHaveBeenCalledTimes(1);
  });

  it('always clears persisted tokens during logout even when remote logout fails', async () => {
    mocks.client.auth.logout.mockRejectedValue(new Error('network down'));

    const { appAuthService } = await import('./AppAuthService');

    await expect(appAuthService.logout()).resolves.toBeUndefined();
    expect(mocks.clearAppSdkSessionTokens).toHaveBeenCalledTimes(1);
    expect(mocks.clearAppImSdkSession).toHaveBeenCalledTimes(1);
  });

  it('syncs IM bridge after credential login succeeds', async () => {
    mocks.client.auth.login.mockResolvedValue({
      data: {
        authToken: 'fresh-auth-token',
        refreshToken: 'fresh-refresh-token',
        userInfo: {
          id: 7,
          username: 'neo',
          nickname: 'The One',
        },
      },
    });

    const { appAuthService } = await import('./AppAuthService');

    await expect(
      appAuthService.login({
        username: 'neo',
        password: 'matrix',
      }),
    ).resolves.toEqual({
      userId: '7',
      username: 'neo',
      displayName: 'The One',
      authToken: 'fresh-auth-token',
      accessToken: 'runtime-access-token',
      refreshToken: 'fresh-refresh-token',
    });

    expect(mocks.syncAppImSdkSession).toHaveBeenCalledWith({
      userId: '7',
      username: 'neo',
      displayName: 'The One',
      authToken: 'fresh-auth-token',
      accessToken: 'runtime-access-token',
      refreshToken: 'fresh-refresh-token',
    });
  });
});
