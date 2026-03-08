import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ServiceStorageAdapter } from '../src/types';
import {
  APP_SDK_AUTH_TOKEN_STORAGE_KEY,
  createAppSdkCoreConfig,
  createAppSdkCoreRuntimeConfig,
  getAppSdkCoreClientWithSession,
  resetAppSdkCoreClient,
} from '../src/sdk/appSdkClient';

const { createClientMock, mockClient } = vi.hoisted(() => {
  const client = {
    setAuthToken: vi.fn(),
    setAccessToken: vi.fn(),
  };
  return {
    mockClient: client,
    createClientMock: vi.fn(() => client),
  };
});

vi.mock('@sdkwork/app-sdk', () => ({
  createClient: createClientMock,
}));

function createStorage(values: Record<string, string | undefined>): ServiceStorageAdapter {
  return {
    get<T>(key: string): T | undefined {
      return values[key] as T | undefined;
    },
    set(): void {
      // no-op for tests
    },
    remove(): void {
      // no-op for tests
    },
  };
}

const ENV_KEYS = [
  'VITE_APP_ENV',
  'MODE',
  'NODE_ENV',
  'VITE_API_BASE_URL',
  'VITE_APP_API_BASE_URL',
  'SDKWORK_API_BASE_URL',
  'VITE_APP_BASE_URL',
  'VITE_IM_API_BASE_URL',
  'VITE_APP_IM_API_BASE_URL',
  'SDKWORK_IM_API_BASE_URL',
  'VITE_ACCESS_TOKEN',
  'SDKWORK_ACCESS_TOKEN',
  'VITE_TIMEOUT',
  'SDKWORK_TIMEOUT',
] as const;

const ORIGINAL_ENV_VALUES = Object.fromEntries(
  ENV_KEYS.map((key) => [key, process.env[key]]),
) as Record<(typeof ENV_KEYS)[number], string | undefined>;

function setEnv(values: Partial<Record<(typeof ENV_KEYS)[number], string | undefined>>): void {
  for (const key of ENV_KEYS) {
    const value = values[key];
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
}

function restoreEnv(): void {
  for (const key of ENV_KEYS) {
    const value = ORIGINAL_ENV_VALUES[key];
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
}

describe('appSdkClient token restore', () => {
  beforeEach(() => {
    resetAppSdkCoreClient();
    createClientMock.mockClear();
    mockClient.setAuthToken.mockClear();
    mockClient.setAccessToken.mockClear();
    setEnv({});
  });

  it('uses sdkwork_token as default auth storage key', () => {
    expect(APP_SDK_AUTH_TOKEN_STORAGE_KEY).toBe('sdkwork_token');
  });

  it('uses sdkwork_token when both primary and legacy keys exist', async () => {
    const storage = createStorage({
      sdkwork_token: 'primary-auth-token',
      sys_auth_token: 'legacy-auth-token',
    });

    await getAppSdkCoreClientWithSession({ storage });

    expect(mockClient.setAuthToken).toHaveBeenCalledWith('primary-auth-token');
  });

  it('does not fall back to legacy auth key when sdkwork_token is empty', async () => {
    const storage = createStorage({
      sdkwork_token: '',
      sys_auth_token: 'legacy-auth-token',
    });

    await getAppSdkCoreClientWithSession({
      storage,
      authStorageKey: APP_SDK_AUTH_TOKEN_STORAGE_KEY,
    });

    expect(mockClient.setAuthToken).toHaveBeenCalledWith('');
  });
});

describe('appSdkClient runtime env config', () => {
  beforeEach(() => {
    resetAppSdkCoreClient();
    setEnv({});
  });

  afterAll(() => {
    restoreEnv();
  });

  it('loads api/im/access token from VITE env variables', () => {
    setEnv({
      VITE_APP_ENV: 'staging',
      VITE_API_BASE_URL: 'https://api.example.com/',
      VITE_IM_API_BASE_URL: 'https://im.example.com/',
      VITE_ACCESS_TOKEN: 'test-access-token',
      VITE_TIMEOUT: '40000',
    });

    const runtimeConfig = createAppSdkCoreRuntimeConfig();
    expect(runtimeConfig.env).toBe('staging');
    expect(runtimeConfig.apiBaseUrl).toBe('https://api.example.com');
    expect(runtimeConfig.imBaseUrl).toBe('https://im.example.com');
    expect(runtimeConfig.accessToken).toBe('test-access-token');
    expect(runtimeConfig.timeout).toBe(40000);

    const sdkConfig = createAppSdkCoreConfig();
    expect(sdkConfig.baseUrl).toBe('https://api.example.com');
    expect(sdkConfig.accessToken).toBe('test-access-token');
    expect(sdkConfig.timeout).toBe(40000);
  });

  it('falls back to api base url when IM base url is not configured', () => {
    setEnv({
      VITE_APP_ENV: 'production',
      VITE_API_BASE_URL: 'https://api.prod.example.com',
    });

    const runtimeConfig = createAppSdkCoreRuntimeConfig();
    expect(runtimeConfig.env).toBe('production');
    expect(runtimeConfig.apiBaseUrl).toBe('https://api.prod.example.com');
    expect(runtimeConfig.imBaseUrl).toBe('https://api.prod.example.com');
  });
});
