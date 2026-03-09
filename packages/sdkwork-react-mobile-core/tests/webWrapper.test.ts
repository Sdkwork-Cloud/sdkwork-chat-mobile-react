import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type RuntimeSetupOptions = {
  hasNotification: boolean;
  hasServiceWorker: boolean;
  hasPushManager: boolean;
};

const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
const originalNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
const originalNotification = Object.getOwnPropertyDescriptor(globalThis, 'Notification');
const originalPushManager = Object.getOwnPropertyDescriptor(globalThis, 'PushManager');

function restoreGlobal(name: 'window' | 'navigator' | 'Notification' | 'PushManager', descriptor?: PropertyDescriptor) {
  if (descriptor) {
    Object.defineProperty(globalThis, name, descriptor);
    return;
  }
  Reflect.deleteProperty(globalThis as Record<string, unknown>, name);
}

function setupWebRuntime(options: RuntimeSetupOptions): void {
  const notificationCtor =
    options.hasNotification
      ? class NotificationMock {
          static permission: NotificationPermission = 'default';
          static async requestPermission(): Promise<NotificationPermission> {
            return 'granted';
          }
        }
      : undefined;

  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      matchMedia: vi.fn(() => ({ matches: false })),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      location: {
        href: 'https://openchat.example/',
        assign: vi.fn(),
      },
      Notification: notificationCtor,
    },
  });

  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: {
      userAgent: 'Mozilla/5.0',
      platform: 'Web',
      appVersion: '1.0',
      onLine: true,
      share: vi.fn(),
      clipboard: {
        readText: vi.fn(async () => ''),
        writeText: vi.fn(async () => {}),
      },
      serviceWorker: options.hasServiceWorker ? {} : undefined,
    },
  });

  if (notificationCtor) {
    Object.defineProperty(globalThis, 'Notification', {
      configurable: true,
      value: notificationCtor,
    });
  } else {
    Reflect.deleteProperty(globalThis as Record<string, unknown>, 'Notification');
  }

  if (options.hasPushManager) {
    Object.defineProperty(globalThis, 'PushManager', {
      configurable: true,
      value: function PushManagerMock() {},
    });
  } else {
    Reflect.deleteProperty(globalThis as Record<string, unknown>, 'PushManager');
  }
}

async function createWebPlatform() {
  const { WebPlatform } = await import('../src/platform/web');
  return new WebPlatform();
}

describe('web push wrapper', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    restoreGlobal('window', originalWindow);
    restoreGlobal('navigator', originalNavigator);
    restoreGlobal('Notification', originalNotification);
    restoreGlobal('PushManager', originalPushManager);
  });

  it('returns unsupported when service worker or PushManager is missing', async () => {
    setupWebRuntime({
      hasNotification: true,
      hasServiceWorker: false,
      hasPushManager: false,
    });

    const platform = await createWebPlatform();
    expect(platform.push.isSupported()).toBe(false);
  });

  it('returns supported when Notification, ServiceWorker and PushManager are available', async () => {
    setupWebRuntime({
      hasNotification: true,
      hasServiceWorker: true,
      hasPushManager: true,
    });

    const platform = await createWebPlatform();
    expect(platform.push.isSupported()).toBe(true);
  });
});
