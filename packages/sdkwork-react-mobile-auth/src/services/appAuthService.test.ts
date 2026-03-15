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
    clearAppSdkSessionTokens: vi.fn(),
    getAppSdkClientWithSession: vi.fn(() => client),
    persistAppSdkSessionTokens: vi.fn(),
    readAppSdkSessionTokens: vi.fn(),
    resolveAppSdkAccessToken: vi.fn(() => 'runtime-access-token'),
  };
});

vi.mock('./useAppSdkClient', () => ({
  applyAppSdkSessionTokens: mocks.applyAppSdkSessionTokens,
  clearAppSdkSessionTokens: mocks.clearAppSdkSessionTokens,
  getAppSdkClientWithSession: mocks.getAppSdkClientWithSession,
  persistAppSdkSessionTokens: mocks.persistAppSdkSessionTokens,
  readAppSdkSessionTokens: mocks.readAppSdkSessionTokens,
  resolveAppSdkAccessToken: mocks.resolveAppSdkAccessToken,
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

    const { appAuthService } = await import('./appAuthService');

    await expect(appAuthService.restoreSession()).resolves.toEqual({
      userId: '42',
      username: 'system',
      displayName: 'System User',
      authToken: 'persisted-auth-token',
      accessToken: 'runtime-access-token',
      refreshToken: 'persisted-refresh-token',
    });

    expect(mocks.clearAppSdkSessionTokens).not.toHaveBeenCalled();
  });

  it('clears session when restore fails with invalid auth semantics', async () => {
    mocks.client.user.getUserProfile.mockRejectedValue(
      Object.assign(new Error('Unauthorized'), { status: 401, code: 'UNAUTHORIZED' }),
    );

    const { appAuthService } = await import('./appAuthService');

    await expect(appAuthService.restoreSession()).resolves.toBeNull();
    expect(mocks.clearAppSdkSessionTokens).toHaveBeenCalledTimes(1);
  });

  it('always clears persisted tokens during logout even when remote logout fails', async () => {
    mocks.client.auth.logout.mockRejectedValue(new Error('network down'));

    const { appAuthService } = await import('./appAuthService');

    await expect(appAuthService.logout()).resolves.toBeUndefined();
    expect(mocks.clearAppSdkSessionTokens).toHaveBeenCalledTimes(1);
  });
});
