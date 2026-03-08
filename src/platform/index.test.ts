import { beforeEach, describe, expect, it, vi } from 'vitest';

const createCorePlatformStub = (overrides?: {
  type?: 'web' | 'ios' | 'android' | 'pwa';
  storageGetValue?: unknown;
}) => {
  const storageState = new Map<string, unknown>();

  if (overrides && 'storageGetValue' in overrides) {
    storageState.set('seed', overrides.storageGetValue);
  }

  return {
    type: overrides?.type ?? 'ios',
    device: {
      getUUID: vi.fn(async () => 'native-uuid'),
      getInfo: vi.fn(async () => ({
        model: 'Native',
        manufacturer: 'SDKWork',
        platform: 'ios',
        platformVersion: '18',
        osVersion: '18',
        uuid: 'native-uuid',
      })),
      vibrate: vi.fn(async () => {}),
    },
    storage: {
      get: vi.fn(async (key: string) => (storageState.has(key) ? storageState.get(key) : null)),
      set: vi.fn(async (key: string, value: unknown) => {
        storageState.set(key, value);
      }),
      remove: vi.fn(async (key: string) => {
        storageState.delete(key);
      }),
      clear: vi.fn(async () => {
        storageState.clear();
      }),
    },
    clipboard: {
      read: vi.fn(async () => 'native-clipboard'),
      write: vi.fn(async () => {}),
    },
    camera: {
      takePhoto: vi.fn(async () => 'native-photo'),
      pickPhoto: vi.fn(async () => 'native-pick'),
      scanQRCode: vi.fn(async () => 'native-qr'),
    },
  };
};

describe('src/platform adapter', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it('keeps storage/clipboard/device callable before initialization', async () => {
    vi.doMock('@sdkwork/react-mobile-core/platform', () => ({
      initializePlatform: vi.fn(async () => {}),
      getPlatform: vi.fn(() => createCorePlatformStub()),
    }));

    const platformModule = await import('./index');

    await platformModule.Platform.storage.set('draft', { value: 1 });
    const loaded = await platformModule.Platform.storage.get('draft');
    await platformModule.Platform.clipboard.write('hello');
    platformModule.Platform.device.vibrate(10);

    expect(loaded).toEqual({ value: 1 });
    expect(platformModule.Platform.type).toBe(platformModule.PlatformType.WEB);
  });

  it('maps to core platform after initialize', async () => {
    const corePlatform = createCorePlatformStub({ type: 'ios' });
    const coreInitialize = vi.fn(async () => {});

    vi.doMock('@sdkwork/react-mobile-core/platform', () => ({
      initializePlatform: coreInitialize,
      getPlatform: vi.fn(() => corePlatform),
    }));

    const platformModule = await import('./index');

    await platformModule.Platform.initialize();
    await platformModule.Platform.storage.set('token', 'native-token');
    const token = await platformModule.Platform.storage.get('token');

    expect(coreInitialize).toHaveBeenCalledTimes(1);
    expect(platformModule.Platform.type).toBe(platformModule.PlatformType.IOS);
    expect(token).toBe('native-token');
    expect(corePlatform.storage.set).toHaveBeenCalledWith('token', 'native-token');
  });

  it('falls back to web-safe platform when core initialization fails', async () => {
    vi.doMock('@sdkwork/react-mobile-core/platform', () => ({
      initializePlatform: vi.fn(async () => {
        throw new Error('core platform init failed');
      }),
      getPlatform: vi.fn(() => createCorePlatformStub({ type: 'android' })),
    }));

    const platformModule = await import('./index');

    await expect(platformModule.Platform.initialize()).resolves.toBeUndefined();
    await platformModule.Platform.storage.set('resilient', true);
    const resilient = await platformModule.Platform.storage.get('resilient');

    expect(platformModule.Platform.type).toBe(platformModule.PlatformType.WEB);
    expect(resilient).toBe(true);
  });
});
