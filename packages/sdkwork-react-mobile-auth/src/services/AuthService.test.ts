import { describe, expect, it } from 'vitest';
import type { ServiceFactoryDeps } from '@sdkwork/react-mobile-core';
import { createAuthService, createAuthServiceWithSdk } from './AuthService';
import type { AuthSdkError, IAuthSdkService } from './AuthSdkService';

interface TestRuntime {
  deps: ServiceFactoryDeps;
  runtimeStorage: Map<string, unknown>;
  advanceNow: (ms: number) => void;
}

function createTestRuntime(): TestRuntime {
  const runtimeStorage = new Map<string, unknown>();
  let sequence = 0;
  let now = 1710000000000;

  const deps: ServiceFactoryDeps = {
    storage: {
      get: <T>(key: string) => runtimeStorage.get(key) as T | null | undefined,
      set: <T>(key: string, value: T) => {
        runtimeStorage.set(key, value);
      },
      remove: (key: string) => {
        runtimeStorage.delete(key);
      },
    },
    eventBus: {
      emit: () => {
        // no-op for unit tests
      },
      on: () => () => {
        // no-op unsubscribe
      },
    },
    logger: {
      info: () => {},
      warn: () => {},
      error: () => {},
      debug: () => {},
    },
    clock: {
      now: () => now,
    },
    idGenerator: {
      next: (prefix?: string) => {
        sequence += 1;
        return `${prefix || 'id'}_${sequence}`;
      },
    },
    command: {
      execute: async () => ({ success: false, error: 'Command executor not configured' }),
    },
  };

  return {
    deps,
    runtimeStorage,
    advanceNow: (ms: number) => {
      now += ms;
    },
  };
}

function createSdkStub(overrides?: Partial<IAuthSdkService>): IAuthSdkService {
  return {
    hasSdkBaseUrl: () => false,
    getLastError: () => null,
    login: async () => null,
    register: async () => null,
    requestPasswordReset: async () => null,
    verifyPasswordResetCode: async () => null,
    resetPassword: async () => null,
    refreshToken: async () => null,
    logout: async () => {},
    ...overrides,
  };
}

describe('AuthService password reset flow', () => {
  it('completes local request-verify-reset flow and accepts new password', async () => {
    const runtime = createTestRuntime();
    const service = createAuthService(runtime.deps);

    const registerResult = await service.register({
      username: 'alice',
      password: 'OldPass123',
      confirmPassword: 'OldPass123',
    });
    expect(registerResult.success).toBe(true);

    const requestResult = await service.requestPasswordReset({
      account: 'alice',
      channel: 'SMS',
    });
    expect(requestResult.success).toBe(true);

    const challenges = runtime.runtimeStorage.get('sys_auth_password_reset_challenges_v1') as Array<{
      account: string;
      code: string;
      expireAt: number;
    }> | undefined;
    expect(Array.isArray(challenges)).toBe(true);
    expect((challenges || []).length).toBeGreaterThan(0);

    const challenge = (challenges || [])[0];
    expect(challenge.account).toBe('alice');
    expect(challenge.code).toHaveLength(6);

    const verifyResult = await service.verifyPasswordResetCode({
      account: 'alice',
      code: challenge.code,
      channel: 'SMS',
    });
    expect(verifyResult.success).toBe(true);

    const resetResult = await service.resetPassword({
      account: 'alice',
      code: challenge.code,
      newPassword: 'NewPass456',
      confirmPassword: 'NewPass456',
    });
    expect(resetResult.success).toBe(true);

    await service.logout();

    const oldPasswordLogin = await service.login({
      username: 'alice',
      password: 'OldPass123',
    });
    expect(oldPasswordLogin.success).toBe(false);

    const newPasswordLogin = await service.login({
      username: 'alice',
      password: 'NewPass456',
    });
    expect(newPasswordLogin.success).toBe(true);
  });

  it('rejects invalid verification code', async () => {
    const runtime = createTestRuntime();
    const service = createAuthService(runtime.deps);

    await service.register({
      username: 'bob',
      password: 'Pass12345',
      confirmPassword: 'Pass12345',
    });

    await service.requestPasswordReset({
      account: 'bob',
      channel: 'SMS',
    });

    const verifyResult = await service.verifyPasswordResetCode({
      account: 'bob',
      code: '000000',
      channel: 'SMS',
    });

    expect(verifyResult.success).toBe(false);
    expect(verifyResult.error).toBe('Invalid or expired verification code');
  });

  it('rejects login when account does not exist in local mode', async () => {
    const runtime = createTestRuntime();
    const service = createAuthServiceWithSdk(runtime.deps, createSdkStub());

    const loginResult = await service.login({
      username: 'missing-user',
      password: 'AnyPass123',
    });

    expect(loginResult.success).toBe(false);
    expect(loginResult.error).toContain('Account not found');
    expect(loginResult.error).toContain('VITE_API_BASE_URL');
  });

  it('throttles repeated password reset requests in local mode', async () => {
    const runtime = createTestRuntime();
    const service = createAuthServiceWithSdk(runtime.deps, createSdkStub());

    await service.register({
      username: 'throttle-user',
      password: 'Pass12345',
      confirmPassword: 'Pass12345',
    });

    const first = await service.requestPasswordReset({
      account: 'throttle-user',
      channel: 'SMS',
    });
    expect(first.success).toBe(true);

    const second = await service.requestPasswordReset({
      account: 'throttle-user',
      channel: 'SMS',
    });
    expect(second.success).toBe(false);
    expect(second.error).toContain('Please wait');

    runtime.advanceNow(60 * 1000);
    const third = await service.requestPasswordReset({
      account: 'throttle-user',
      channel: 'SMS',
    });
    expect(third.success).toBe(true);
  });

  it('returns mapped sdk login error in sdk mode', async () => {
    const runtime = createTestRuntime();
    let lastError: AuthSdkError | null = {
      code: 'AUTH_INVALID_CREDENTIALS',
      message: 'invalid username or password',
    };

    const serviceWithSdk = createAuthServiceWithSdk(
      runtime.deps,
      createSdkStub({
        hasSdkBaseUrl: () => true,
        getLastError: () => lastError,
        login: async () => null,
      }),
    );

    const result = await serviceWithSdk.login({
      username: 'sdk-user',
      password: 'BadPass123',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Username or password is incorrect');

    lastError = null;
  });
});
