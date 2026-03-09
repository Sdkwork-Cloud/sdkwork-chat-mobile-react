import { beforeEach, describe, expect, it, vi } from 'vitest';

const pushListeners = new Map<string, (payload: unknown) => void>();

const minimizeAppMock = vi.fn(async () => {});
const appMock: {
  exitApp: () => Promise<void>;
  getLaunchUrl: () => Promise<{ url: string | null }>;
  addListener: (event: string, callback: (payload: unknown) => void) => Promise<{ remove: () => void }>;
  minimizeApp?: () => Promise<void>;
} = {
  exitApp: vi.fn(async () => {}),
  getLaunchUrl: vi.fn(async () => ({ url: null })),
  addListener: vi.fn(async (_event: string, _callback: (payload: unknown) => void) => ({
    remove: () => {},
  })),
  minimizeApp: minimizeAppMock,
};

const pushNotificationsMock = {
  checkPermissions: vi.fn(async () => ({ receive: 'granted' })),
  requestPermissions: vi.fn(async () => ({ receive: 'granted' })),
  addListener: vi.fn(async (event: string, callback: (payload: unknown) => void) => {
    pushListeners.set(event, callback);
    return {
      remove: () => {
        pushListeners.delete(event);
      },
    };
  }),
  register: vi.fn(async () => {
    pushListeners.get('registration')?.({ value: 'push-token-123' });
  }),
  removeAllListeners: vi.fn(async () => {}),
};

vi.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: () => true,
    getPlatform: () => 'android',
  },
}));

vi.mock('@capacitor/app', () => ({
  App: appMock,
}));

vi.mock('@capacitor/app-launcher', () => ({
  AppLauncher: {
    openUrl: vi.fn(async () => ({ completed: true })),
  },
}));

vi.mock('@capacitor/browser', () => ({
  Browser: {
    open: vi.fn(async () => {}),
  },
}));

vi.mock('@capacitor/device', () => ({
  Device: {
    getInfo: vi.fn(async () => ({
      model: 'android',
      manufacturer: 'sdkwork',
      platform: 'android',
      osVersion: '15',
    })),
    getId: vi.fn(async () => ({ identifier: 'device-id' })),
  },
}));

vi.mock('@capacitor/haptics', () => ({
  Haptics: {
    impact: vi.fn(async () => {}),
  },
  ImpactStyle: {
    Light: 'LIGHT',
  },
}));

vi.mock('@capacitor/clipboard', () => ({
  Clipboard: {
    read: vi.fn(async () => ({ value: '' })),
    write: vi.fn(async () => {}),
  },
}));

vi.mock('@capacitor/camera', () => ({
  Camera: {
    getPhoto: vi.fn(async () => ({ webPath: 'file://photo.jpg' })),
    requestPermissions: vi.fn(async () => ({ camera: 'granted' })),
  },
  CameraResultType: {
    Uri: 'uri',
  },
  CameraSource: {
    Camera: 'camera',
    Photos: 'photos',
  },
}));

vi.mock('@capacitor-mlkit/barcode-scanning', () => ({
  BarcodeFormat: {
    QrCode: 'QR_CODE',
  },
  BarcodeScanner: {
    isSupported: vi.fn(async () => ({ supported: true })),
    checkPermissions: vi.fn(async () => ({ camera: 'granted' })),
    requestPermissions: vi.fn(async () => ({ camera: 'granted' })),
    scan: vi.fn(async () => ({
      barcodes: [{ rawValue: 'qr-value' }],
    })),
  },
}));

vi.mock('@aparajita/capacitor-secure-storage', () => ({
  SecureStorage: {
    getItem: vi.fn(async () => null),
    setItem: vi.fn(async () => {}),
    removeItem: vi.fn(async () => {}),
    clear: vi.fn(async () => {}),
    keys: vi.fn(async () => []),
  },
}));

vi.mock('@aparajita/capacitor-biometric-auth', () => ({
  BiometricAuth: {
    checkBiometry: vi.fn(async () => ({ isAvailable: true })),
    authenticate: vi.fn(async () => {}),
  },
}));

vi.mock('@capawesome/capacitor-app-update', () => ({
  AppUpdate: {
    getAppUpdateInfo: vi.fn(async () => ({ updateAvailability: 0 })),
  },
  AppUpdateAvailability: {
    UPDATE_AVAILABLE: 2,
  },
}));

vi.mock('@capacitor/filesystem', () => ({
  Filesystem: {
    readFile: vi.fn(async () => ({ data: '' })),
    writeFile: vi.fn(async () => {}),
    deleteFile: vi.fn(async () => {}),
    stat: vi.fn(async () => ({})),
  },
  Directory: {
    Documents: 'DOCUMENTS',
  },
  Encoding: {
    UTF8: 'utf8',
  },
}));

vi.mock('@capacitor/share', () => ({
  Share: {
    share: vi.fn(async () => {}),
  },
}));

vi.mock('@capacitor/network', () => ({
  Network: {
    getStatus: vi.fn(async () => ({ connected: true, connectionType: 'wifi' })),
    addListener: vi.fn(async () => ({ remove: () => {} })),
  },
}));

vi.mock('@capacitor/keyboard', () => ({
  Keyboard: {
    hide: vi.fn(async () => {}),
    addListener: vi.fn(async () => ({ remove: () => {} })),
  },
}));

vi.mock('@capacitor/status-bar', () => ({
  StatusBar: {
    setStyle: vi.fn(async () => {}),
    setBackgroundColor: vi.fn(async () => {}),
    hide: vi.fn(async () => {}),
    show: vi.fn(async () => {}),
  },
  Style: {
    Dark: 'dark',
    Light: 'light',
  },
}));

vi.mock('@capacitor/splash-screen', () => ({
  SplashScreen: {
    show: vi.fn(async () => {}),
    hide: vi.fn(async () => {}),
  },
}));

vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: vi.fn(async () => ({ value: null })),
    set: vi.fn(async () => {}),
    remove: vi.fn(async () => {}),
    clear: vi.fn(async () => {}),
    keys: vi.fn(async () => ({ keys: [] })),
  },
}));

vi.mock('@capacitor/local-notifications', () => ({
  LocalNotifications: {
    requestPermissions: vi.fn(async () => ({ display: 'granted' })),
    schedule: vi.fn(async () => {}),
    cancel: vi.fn(async () => {}),
  },
}));

vi.mock('@capacitor/push-notifications', () => ({
  PushNotifications: pushNotificationsMock,
}));

async function createPlatform() {
  const { CapacitorPlatform } = await import('../src/platform/capacitor');
  return new CapacitorPlatform();
}

describe('capacitor wrapper contracts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    pushListeners.clear();
    appMock.minimizeApp = minimizeAppMock;
    pushNotificationsMock.checkPermissions.mockResolvedValue({ receive: 'granted' });
    pushNotificationsMock.requestPermissions.mockResolvedValue({ receive: 'granted' });
    pushNotificationsMock.register.mockImplementation(async () => {
      pushListeners.get('registration')?.({ value: 'push-token-123' });
    });
  });

  it('uses App.minimizeApp for app minimize instead of exiting the app', async () => {
    const platform = await createPlatform();

    await platform.app.minimize();

    expect(minimizeAppMock).toHaveBeenCalledTimes(1);
    expect(appMock.exitApp).not.toHaveBeenCalled();
  });

  it('does not call exitApp when minimize API is unavailable', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    delete appMock.minimizeApp;

    try {
      const platform = await createPlatform();
      await platform.app.minimize();

      expect(appMock.exitApp).not.toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalledWith(
        '[Platform] App minimize is not supported by current runtime',
      );
    } finally {
      appMock.minimizeApp = minimizeAppMock;
      warnSpy.mockRestore();
    }
  });

  it('registers push without relying on window timer globals', async () => {
    const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
    const windowDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'window');
    Object.defineProperty(globalThis, 'window', {
      value: undefined,
      configurable: true,
      writable: true,
    });

    try {
      const platform = await createPlatform();
      const result = await platform.push.register();

      expect(result).toEqual({
        success: true,
        token: 'push-token-123',
      });
      expect(setTimeoutSpy).toHaveBeenCalledTimes(1);
      expect(clearTimeoutSpy).toHaveBeenCalledTimes(1);
    } finally {
      setTimeoutSpy.mockRestore();
      clearTimeoutSpy.mockRestore();
      if (windowDescriptor) {
        Object.defineProperty(globalThis, 'window', windowDescriptor);
      } else {
        Reflect.deleteProperty(globalThis as Record<string, unknown>, 'window');
      }
    }
  });
});
