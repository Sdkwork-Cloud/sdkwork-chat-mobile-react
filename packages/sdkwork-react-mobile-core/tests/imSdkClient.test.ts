import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const backendClient = {
    setAuthToken: vi.fn(),
    setAccessToken: vi.fn(),
    http: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      request: vi.fn(),
    },
  };

  const sessionSetAccessTokenMock = vi.fn();
  const connectRealtimeMock = vi.fn(async () => ({
    uid: 'user-1',
    token: 'rt-token',
    wsUrl: 'wss://im.example.com/ws',
  }));
  const disconnectRealtimeMock = vi.fn(async () => undefined);
  const sdkInstances: Array<Record<string, unknown>> = [];
  const adapterInstances: Array<Record<string, unknown>> = [];

  const MockOpenChatImSdk = class {
    public readonly options: Record<string, unknown>;
    public readonly session = {
      setAccessToken: sessionSetAccessTokenMock,
      connectRealtime: connectRealtimeMock,
      disconnectRealtime: disconnectRealtimeMock,
    };
    public readonly realtime = {
      onConnectionStateChange: vi.fn(() => () => undefined),
      isConnected: vi.fn(() => false),
      getSession: vi.fn(() => undefined),
    };
    public readonly messages = {};
    public readonly conversations = {};
    public readonly groups = {};
    public readonly contacts = {};
    public readonly friends = {};
    public readonly rtc = {
      records: {
        listByUser: vi.fn(),
      },
    };

    constructor(options: Record<string, unknown>) {
      this.options = options;
      sdkInstances.push(this as unknown as Record<string, unknown>);
    }
  };

  return {
    adapterInstances,
    adapterConstructorMock: class {
      constructor() {
        const instance = { kind: 'adapter' };
        adapterInstances.push(instance);
        return instance;
      }
    },
    backendClient,
    connectRealtimeMock,
    createClientMock: vi.fn(() => backendClient),
    disconnectRealtimeMock,
    MockOpenChatImSdk,
    sdkInstances,
    sessionSetAccessTokenMock,
  };
});

vi.mock('@sdkwork/app-sdk', () => ({
  createClient: mocks.createClientMock,
}));

vi.mock('@openchat/sdkwork-im-sdk', async () => {
  return {
    OpenChatImSdk: mocks.MockOpenChatImSdk,
  };
});

vi.mock('@openchat/sdkwork-im-wukongim-adapter', () => ({
  OpenChatWukongimAdapter: mocks.adapterConstructorMock,
}));

const ENV_KEYS = [
  'VITE_APP_ENV',
  'MODE',
  'NODE_ENV',
  'VITE_IM_API_BASE_URL',
  'VITE_ACCESS_TOKEN',
  'VITE_TIMEOUT',
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

describe('imSdkClient session bridge', () => {
  beforeEach(() => {
    setEnv({});
    mocks.createClientMock.mockClear();
    mocks.backendClient.setAuthToken.mockClear();
    mocks.backendClient.setAccessToken.mockClear();
    mocks.sessionSetAccessTokenMock.mockClear();
    mocks.connectRealtimeMock.mockClear();
    mocks.disconnectRealtimeMock.mockClear();
    mocks.adapterInstances.length = 0;
    mocks.sdkInstances.length = 0;
  });

  afterAll(() => {
    restoreEnv();
  });

  it('uses IM base url runtime config and bootstraps realtime when app auth session is synced', async () => {
    setEnv({
      VITE_APP_ENV: 'staging',
      VITE_IM_API_BASE_URL: 'https://im.example.com/',
      VITE_ACCESS_TOKEN: 'runtime-access-token',
      VITE_TIMEOUT: '45000',
    });

    const {
      createAppImSdkRuntimeConfig,
      getAppImSessionIdentity,
      resetAppImSdkClient,
      syncAppImSdkSession,
    } = await import('../src/sdk/imSdkClient');

    resetAppImSdkClient();

    expect(createAppImSdkRuntimeConfig()).toMatchObject({
      env: 'staging',
      baseUrl: 'https://im.example.com',
      accessToken: 'runtime-access-token',
      timeout: 45000,
    });

    await syncAppImSdkSession({
      userId: 'user-1',
      username: 'neo',
      displayName: 'Neo',
      authToken: 'Bearer auth-token',
      accessToken: 'session-access-token',
    });

    expect(mocks.createClientMock).toHaveBeenCalledWith(
      expect.objectContaining({
        baseUrl: 'https://im.example.com',
        timeout: 45000,
      }),
    );
    expect(mocks.adapterInstances).toHaveLength(1);
    expect(mocks.sessionSetAccessTokenMock).toHaveBeenCalledWith('auth-token');
    expect(mocks.backendClient.setAccessToken).toHaveBeenLastCalledWith('session-access-token');
    expect(mocks.connectRealtimeMock).toHaveBeenCalledTimes(1);
    expect(getAppImSessionIdentity()).toEqual({
      userId: 'user-1',
      username: 'neo',
      displayName: 'Neo',
      authToken: 'auth-token',
      accessToken: 'session-access-token',
    });
  });

  it('disconnects and clears stored IM bridge state', async () => {
    const {
      clearAppImSdkSession,
      getAppImSessionIdentity,
      resetAppImSdkClient,
      syncAppImSdkSession,
    } = await import('../src/sdk/imSdkClient');

    resetAppImSdkClient();
    await syncAppImSdkSession({
      userId: 'user-2',
      username: 'trinity',
      displayName: 'Trinity',
      authToken: 'auth-2',
      accessToken: 'access-2',
    });

    await clearAppImSdkSession();

    expect(mocks.disconnectRealtimeMock).toHaveBeenCalledTimes(1);
    expect(getAppImSessionIdentity()).toBeNull();
  });
});
