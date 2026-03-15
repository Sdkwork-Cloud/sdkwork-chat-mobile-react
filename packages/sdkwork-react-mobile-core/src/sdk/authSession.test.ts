import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ServiceStorageAdapter } from '../types';
import {
  APP_SDK_AUTH_TOKEN_STORAGE_KEY,
  applyStoredAppSdkSessionTokens,
  clearStoredAppSdkSessionTokens,
  persistAppSdkSessionTokens,
  readStoredAppSdkSessionTokens,
} from './authSession';

const ACCESS_TOKEN_STORAGE_KEY = 'sdkwork_access_token';
const REFRESH_TOKEN_STORAGE_KEY = 'sdkwork_refresh_token';
type MockAppSdkModule = typeof import('@sdkwork/app-sdk') & {
  __mockClient: {
    setAuthToken: ReturnType<typeof vi.fn>;
    setAccessToken: ReturnType<typeof vi.fn>;
  };
};

vi.mock('@sdkwork/app-sdk', () => {
  const client = {
    setAuthToken: vi.fn(),
    setAccessToken: vi.fn(),
  };

  return {
    createClient: vi.fn(() => client),
    __mockClient: client,
  };
});

function createMemoryStorage(
  initial: Record<string, string | undefined> = {},
): ServiceStorageAdapter & { snapshot: () => Record<string, string | undefined> } {
  const state = new Map<string, string>();

  Object.entries(initial).forEach(([key, value]) => {
    if (value !== undefined) {
      state.set(key, value);
    }
  });

  return {
    get<T>(key: string): T | undefined {
      return state.get(key) as T | undefined;
    },
    set<T>(key: string, value: T) {
      if (value === undefined || value === null) {
        state.delete(key);
        return;
      }
      state.set(key, String(value));
    },
    remove(key) {
      state.delete(key);
    },
    snapshot() {
      return Object.fromEntries(state.entries());
    },
  };
}

describe('authSession', () => {
  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('reads persisted tokens from storage and normalizes bearer auth token', async () => {
    const storage = createMemoryStorage({
      [APP_SDK_AUTH_TOKEN_STORAGE_KEY]: ' Bearer token-123 ',
      [ACCESS_TOKEN_STORAGE_KEY]: ' access-456 ',
      [REFRESH_TOKEN_STORAGE_KEY]: ' refresh-789 ',
    });

    await expect(
      readStoredAppSdkSessionTokens({
        storage,
        accessTokenStorageKey: ACCESS_TOKEN_STORAGE_KEY,
        refreshTokenStorageKey: REFRESH_TOKEN_STORAGE_KEY,
      }),
    ).resolves.toEqual({
      authToken: 'token-123',
      accessToken: 'access-456',
      refreshToken: 'refresh-789',
    });
  });

  it('applies normalized session tokens to the sdk client', async () => {
    const { __mockClient } = (await import('@sdkwork/app-sdk')) as unknown as MockAppSdkModule;
    const { initAppSdkCoreClient } = await import('./appSdkClient');
    initAppSdkCoreClient();

    applyStoredAppSdkSessionTokens({
      authToken: ' Bearer token-abc ',
      accessToken: ' access-def ',
    });

    expect(__mockClient.setAuthToken).toHaveBeenCalledWith('token-abc');
    expect(__mockClient.setAccessToken).toHaveBeenCalledWith('access-def');
  });

  it('returns empty normalized values for missing tokens and clears storage keys', async () => {
    const storage = createMemoryStorage({
      [APP_SDK_AUTH_TOKEN_STORAGE_KEY]: ' ',
      [ACCESS_TOKEN_STORAGE_KEY]: '',
      [REFRESH_TOKEN_STORAGE_KEY]: 'keep-me',
    });

    await persistAppSdkSessionTokens(
      {
        authToken: ' ',
        accessToken: undefined,
        refreshToken: '  ',
      },
      {
        storage,
        accessTokenStorageKey: ACCESS_TOKEN_STORAGE_KEY,
        refreshTokenStorageKey: REFRESH_TOKEN_STORAGE_KEY,
      },
    );

    await expect(
      readStoredAppSdkSessionTokens({
        storage,
        accessTokenStorageKey: ACCESS_TOKEN_STORAGE_KEY,
        refreshTokenStorageKey: REFRESH_TOKEN_STORAGE_KEY,
      }),
    ).resolves.toEqual({
      authToken: '',
      accessToken: '',
      refreshToken: '',
    });

    await clearStoredAppSdkSessionTokens({
      storage,
      accessTokenStorageKey: ACCESS_TOKEN_STORAGE_KEY,
      refreshTokenStorageKey: REFRESH_TOKEN_STORAGE_KEY,
    });

    expect(storage.snapshot()).toEqual({});
  });
});
