import { describe, expect, it } from 'vitest';
import { inspectPlatformCapabilities } from '../src/platform/capabilities';
import type { IPlatform } from '../src/platform/types';

function createPlatformMock(overrides?: Partial<IPlatform>): IPlatform {
  const platform: IPlatform = {
    type: 'ios',
    isNative: true,
    isWeb: false,
    isIOS: true,
    isAndroid: false,
    isPWA: false,
    initialize: async () => {},
    device: {
      getInfo: async () => ({
        model: 'iPhone',
        manufacturer: 'Apple',
        platform: 'ios',
        platformVersion: '18',
        osVersion: '18',
        uuid: 'device-id',
      }),
      vibrate: async () => {},
      getUUID: async () => 'device-id',
    },
    storage: {
      get: async () => null,
      set: async () => {},
      remove: async () => {},
      clear: async () => {},
      keys: async () => [],
    },
    clipboard: {
      read: async () => '',
      write: async () => {},
    },
    camera: {
      takePhoto: async () => '',
      pickPhoto: async () => '',
      scanQRCode: async () => '',
    },
    fileSystem: {
      readFile: async () => '',
      writeFile: async () => {},
      deleteFile: async () => {},
      fileExists: async () => false,
      getDocumentsDir: async () => '',
      showOpenDialog: async () => null,
      showSaveDialog: async () => null,
    },
    notifications: {
      requestPermission: async () => true,
      show: async () => {},
      schedule: async () => '1',
      cancel: async () => {},
    },
    push: {
      isSupported: () => true,
      requestPermission: async () => 'granted',
      register: async () => ({ success: true, token: 'push-token' }),
      unregister: async () => {},
      addListener: async () => () => {},
    },
    payment: {
      isSupported: (channel) => channel !== 'google_pay',
      launch: async (request) => ({
        success: true,
        status: 'launched',
        channel: request.channel,
        orderId: request.orderId,
      }),
    },
    share: {
      share: async () => {},
    },
    network: {
      getStatus: async () => ({ connected: true, connectionType: 'wifi' }),
      addListener: async () => () => {},
    },
    keyboard: {
      show: async () => {},
      hide: async () => {},
      addListener: async () => () => {},
    },
    statusBar: {
      setStyle: async () => {},
      setBackgroundColor: async () => {},
      hide: async () => {},
      show: async () => {},
    },
    splashScreen: {
      show: async () => {},
      hide: async () => {},
    },
    app: {
      exit: async () => {},
      minimize: async () => {},
      addListener: async () => () => {},
    },
  };

  return {
    ...platform,
    ...overrides,
  };
}

describe('inspectPlatformCapabilities', () => {
  it('reports push/payment/local notification integration when implemented', () => {
    const report = inspectPlatformCapabilities(createPlatformMock());

    expect(report.wrappersSummary.total).toBe(14);
    expect(report.wrappersSummary.ready).toBe(14);
    expect(report.wrappers.device.integrated).toBe(true);
    expect(report.wrappers.storage.integrated).toBe(true);
    expect(report.wrappers.clipboard.integrated).toBe(true);
    expect(report.wrappers.camera.integrated).toBe(true);
    expect(report.wrappers.fileSystem.integrated).toBe(true);
    expect(report.wrappers.notifications.integrated).toBe(true);
    expect(report.wrappers.push.integrated).toBe(true);
    expect(report.wrappers.payment.integrated).toBe(true);
    expect(report.wrappers.share.integrated).toBe(true);
    expect(report.wrappers.network.integrated).toBe(true);
    expect(report.wrappers.keyboard.integrated).toBe(true);
    expect(report.wrappers.statusBar.integrated).toBe(true);
    expect(report.wrappers.splashScreen.integrated).toBe(true);
    expect(report.wrappers.app.integrated).toBe(true);
    expect(report.pushNotifications.integrated).toBe(true);
    expect(report.localNotifications.integrated).toBe(true);
    expect(report.payments.integrated).toBe(true);
    expect(report.payments.supportedChannels).toContain('wechat_pay');
    expect(report.payments.supportedChannels).not.toContain('google_pay');
  });

  it('reports missing push and payment bridges', () => {
    const report = inspectPlatformCapabilities(
      createPlatformMock({
        push: undefined,
        payment: undefined,
      }),
    );

    expect(report.wrappersSummary.ready).toBe(12);
    expect(report.wrappers.push.integrated).toBe(false);
    expect(report.wrappers.payment.integrated).toBe(false);
    expect(report.pushNotifications.integrated).toBe(false);
    expect(report.payments.integrated).toBe(false);
    expect(report.payments.supportedChannels).toEqual([]);
  });

  it('reports wrapper-level missing methods for each encapsulation', () => {
    const report = inspectPlatformCapabilities(
      createPlatformMock({
        clipboard: {
          read: async () => '',
        } as any,
        app: {
          exit: async () => {},
          minimize: async () => {},
        } as any,
      }),
    );

    expect(report.wrappers.clipboard.integrated).toBe(false);
    expect(report.wrappers.clipboard.detail).toContain('missing methods');
    expect(report.wrappers.app.integrated).toBe(false);
    expect(report.wrappers.app.detail).toContain('missing methods');
    expect(report.wrappersSummary.ready).toBe(12);
  });
});
