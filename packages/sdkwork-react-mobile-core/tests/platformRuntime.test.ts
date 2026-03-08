import { describe, expect, it, vi } from 'vitest';
import { attachPlatformRuntime, parsePaymentCallbackUrl, PLATFORM_RUNTIME_EVENTS } from '../src/platform/runtime';
import { AppEvents } from '../src/events';
import type {
  AppListenerEvent,
  AppListenerPayloadMap,
  IPlatform,
  PushListenerEvent,
  PushRegistrationResult,
} from '../src/platform/types';

function createPlatformForRuntime(options?: {
  native?: boolean;
  pushSupported?: boolean;
  registerResult?: PushRegistrationResult;
  launchUrl?: string | null;
}) {
  const storageMap = new Map<string, unknown>();
  const appListeners: Partial<Record<AppListenerEvent, (payload: unknown) => void>> = {};
  let networkListener: ((status: { connected: boolean; connectionType: string }) => void) | null = null;
  const pushListeners: Partial<Record<PushListenerEvent, (payload: unknown) => void>> = {};

  const registerResult = options?.registerResult ?? {
    success: true,
    token: 'token-initial',
  };

  const platform: IPlatform = {
    type: options?.native === false ? 'web' : 'ios',
    isNative: options?.native !== false,
    isWeb: options?.native === false,
    isIOS: options?.native !== false,
    isAndroid: false,
    isPWA: false,
    initialize: async () => {},
    device: {
      getInfo: async () => ({
        model: 'test-device',
        manufacturer: 'sdkwork',
        platform: 'ios',
        platformVersion: '18',
        osVersion: '18',
        uuid: 'uuid',
      }),
      vibrate: async () => {},
      getUUID: async () => 'uuid',
    },
    storage: {
      get: async <T>(key: string) => (storageMap.has(key) ? (storageMap.get(key) as T) : null),
      set: async (key: string, value: unknown) => {
        storageMap.set(key, value);
      },
      remove: async (key: string) => {
        storageMap.delete(key);
      },
      clear: async () => {
        storageMap.clear();
      },
      keys: async () => Array.from(storageMap.keys()),
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
      schedule: async () => 'notification-id',
      cancel: async () => {},
    },
    push: {
      isSupported: () => options?.pushSupported !== false,
      requestPermission: async () => 'granted',
      register: async () => registerResult,
      unregister: async () => {},
      addListener: async (event, callback) => {
        pushListeners[event] = callback;
        return () => {
          delete pushListeners[event];
        };
      },
    },
    payment: {
      isSupported: () => true,
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
      addListener: async (callback) => {
        networkListener = callback;
        return () => {
          networkListener = null;
        };
      },
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
      getLaunchUrl: async () => ({ url: options?.launchUrl ?? null }),
      addListener: async <E extends AppListenerEvent>(
        event: E,
        callback: (payload: AppListenerPayloadMap[E]) => void,
      ) => {
        appListeners[event] = callback as (payload: unknown) => void;
        return () => {
          delete appListeners[event];
        };
      },
    },
  };

  return {
    platform,
    storageMap,
    appListeners,
    getNetworkListener: () => networkListener,
    pushListeners,
  };
}

describe('platform runtime', () => {
  it('parses payment callback URL', () => {
    const payload = parsePaymentCallbackUrl(
      'openchat://payment/callback?orderId=SO-1001&status=success&channel=wechat_pay&message=ok',
    );

    expect(payload).toEqual({
      rawUrl: 'openchat://payment/callback?orderId=SO-1001&status=success&channel=wechat_pay&message=ok',
      orderId: 'SO-1001',
      success: true,
      status: 'success',
      channel: 'wechat_pay',
      code: undefined,
      message: 'ok',
    });
  });

  it('attaches runtime listeners and emits push/network/payment events', async () => {
    const context = createPlatformForRuntime();
    const emitted: Array<{ event: string; payload: unknown }> = [];
    const cleanup = await attachPlatformRuntime(context.platform, {
      pushTokenStorageKey: 'push-token',
      emit: (event, payload) => emitted.push({ event, payload }),
    });

    expect(context.storageMap.get('push-token')).toBe('token-initial');
    expect(
      emitted.some((item) => item.event === PLATFORM_RUNTIME_EVENTS.PUSH_TOKEN_UPDATED),
    ).toBe(true);

    const appUrlListener = context.appListeners.appUrlOpen;
    expect(appUrlListener).toBeDefined();
    appUrlListener?.({ url: 'openchat://payment/callback?orderId=SO-2&status=paid&channel=alipay' });
    expect(
      emitted.some((item) => item.event === PLATFORM_RUNTIME_EVENTS.PAYMENT_CALLBACK),
    ).toBe(true);

    const appStateListener = context.appListeners.appStateChange;
    appStateListener?.({ isActive: false });
    expect(emitted.some((item) => item.event === AppEvents.APP_BACKGROUND)).toBe(true);

    const networkListener = context.getNetworkListener();
    expect(networkListener).toBeTruthy();
    networkListener?.({ connected: false, connectionType: 'none' });
    expect(emitted.some((item) => item.event === AppEvents.NETWORK_OFFLINE)).toBe(true);

    const registrationListener = context.pushListeners.registration;
    registrationListener?.({ value: 'token-refreshed' });
    await Promise.resolve();
    expect(context.storageMap.get('push-token')).toBe('token-refreshed');

    cleanup();
  });

  it('emits payment callback from launch URL on cold start when supported', async () => {
    const context = createPlatformForRuntime({
      launchUrl: 'openchat://payment/callback?orderId=SO-3&status=success&channel=alipay',
    });
    const emitted: Array<{ event: string; payload: unknown }> = [];

    const cleanup = await attachPlatformRuntime(context.platform, {
      emit: (event, payload) => emitted.push({ event, payload }),
    });

    const paymentCallback = emitted.find((item) => item.event === PLATFORM_RUNTIME_EVENTS.PAYMENT_CALLBACK);
    expect(paymentCallback).toBeTruthy();
    expect(paymentCallback?.payload).toMatchObject({
      orderId: 'SO-3',
      success: true,
      channel: 'alipay',
      status: 'success',
    });

    cleanup();
  });

  it('runs payment callback handler and emits handled/failed events', async () => {
    const context = createPlatformForRuntime({
      launchUrl: 'openchat://payment/callback?orderId=SO-4&status=success&channel=wechat_pay',
    });
    const emitted: Array<{ event: string; payload: unknown }> = [];
    const handlePaymentCallback = vi
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('apply payment state failed'));

    const cleanup = await attachPlatformRuntime(context.platform, {
      emit: (event, payload) => emitted.push({ event, payload }),
      handlePaymentCallback,
    });

    expect(handlePaymentCallback).toHaveBeenCalledTimes(1);
    expect(
      emitted.some((item) => item.event === PLATFORM_RUNTIME_EVENTS.PAYMENT_CALLBACK_HANDLED),
    ).toBe(true);

    context.appListeners.appUrlOpen?.({
      url: 'openchat://payment/callback?orderId=SO-5&status=paid&channel=alipay',
    });
    await Promise.resolve();
    await Promise.resolve();

    expect(handlePaymentCallback).toHaveBeenCalledTimes(2);
    const failedEvent = emitted.find((item) => item.event === PLATFORM_RUNTIME_EVENTS.PAYMENT_CALLBACK_HANDLE_FAILED);
    expect(failedEvent).toBeTruthy();
    expect(failedEvent?.payload).toMatchObject({
      error: 'apply payment state failed',
    });

    cleanup();
  });

  it('runs push token sync hook and emits sync failure event', async () => {
    const context = createPlatformForRuntime();
    const emitted: Array<{ event: string; payload: unknown }> = [];
    const syncPushToken = vi
      .fn()
      .mockRejectedValueOnce(new Error('sync push token failed'))
      .mockResolvedValueOnce(undefined);

    const cleanup = await attachPlatformRuntime(context.platform, {
      emit: (event, payload) => emitted.push({ event, payload }),
      syncPushToken,
      pushTokenStorageKey: 'push-token',
    });

    expect(syncPushToken).toHaveBeenCalledTimes(1);
    expect(
      emitted.some((item) => item.event === PLATFORM_RUNTIME_EVENTS.PUSH_TOKEN_SYNC_FAILED),
    ).toBe(true);

    context.pushListeners.registration?.({ value: 'token-refreshed' });
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(syncPushToken).toHaveBeenCalledTimes(2);
    expect(
      emitted.some((item) => item.event === PLATFORM_RUNTIME_EVENTS.PUSH_TOKEN_SYNCED),
    ).toBe(true);

    cleanup();
  });

  it('skips push registration workflow when push is unsupported', async () => {
    const context = createPlatformForRuntime({ native: false, pushSupported: false });
    const emitted: Array<{ event: string; payload: unknown }> = [];

    await attachPlatformRuntime(context.platform, {
      emit: (event, payload) => emitted.push({ event, payload }),
    });

    expect(emitted.some((item) => item.event === PLATFORM_RUNTIME_EVENTS.PUSH_TOKEN_UPDATED)).toBe(false);
  });
});
