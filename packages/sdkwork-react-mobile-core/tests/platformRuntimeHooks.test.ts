import { describe, expect, it, vi } from 'vitest';
import {
  createDefaultPlatformRuntimeHooks,
  PLATFORM_RUNTIME_HOOK_EVENTS,
} from '../src/platform/runtimeHooks';
import type { PaymentCallbackPayload, PushTokenUpdatedPayload } from '../src/platform/runtime';
import type { IPlatform } from '../src/platform/types';

function createRuntimeHookPlatform(authToken: string = 'auth-token') {
  const storageMap = new Map<string, unknown>();
  storageMap.set('sdkwork_token', authToken);

  const platform = {
    type: 'ios',
    device: {
      getInfo: async () => ({
        model: 'iPhone',
        manufacturer: 'Apple',
        platform: 'ios',
        platformVersion: '18',
        osVersion: '18.2',
        uuid: 'device-1',
      }),
      getUUID: async () => 'device-1',
      vibrate: async () => {},
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
  } as Pick<IPlatform, 'type' | 'device' | 'storage'>;

  return {
    platform,
    storageMap,
  };
}

describe('platform runtime hooks', () => {
  it('registers push token as notification device and emits synced event', async () => {
    const { platform } = createRuntimeHookPlatform('auth-token');
    const emitted: Array<{ event: string; payload: unknown }> = [];
    const registerDevice = vi.fn().mockResolvedValue({ data: { id: 'device-record-1' } });
    const getOrderStatus = vi.fn();
    const clientResolver = vi.fn().mockResolvedValue({
      notification: { registerDevice },
      orders: { getOrderStatus },
    });

    const hooks = createDefaultPlatformRuntimeHooks({
      platform,
      clientResolver,
      emit: (event, payload) => emitted.push({ event, payload }),
    });

    const payload: PushTokenUpdatedPayload = {
      token: 'push-token-1',
      previousToken: null,
      source: 'registration',
    };
    await hooks.syncPushToken?.(payload);

    expect(clientResolver).toHaveBeenCalledTimes(1);
    expect(registerDevice).toHaveBeenCalledTimes(1);
    expect(registerDevice).toHaveBeenCalledWith(
      expect.objectContaining({
        deviceType: 'ios',
        deviceId: 'device-1',
        pushToken: 'push-token-1',
        osVersion: '18.2',
      }),
    );
    expect(
      emitted.some((item) => item.event === PLATFORM_RUNTIME_HOOK_EVENTS.PUSH_DEVICE_REGISTERED),
    ).toBe(true);
  });

  it('skips push token sync when auth token is missing', async () => {
    const { platform } = createRuntimeHookPlatform('');
    const emitted: Array<{ event: string; payload: unknown }> = [];
    const registerDevice = vi.fn();
    const clientResolver = vi.fn().mockResolvedValue({
      notification: { registerDevice },
      orders: { getOrderStatus: vi.fn() },
    });

    const hooks = createDefaultPlatformRuntimeHooks({
      platform,
      clientResolver,
      emit: (event, payload) => emitted.push({ event, payload }),
    });

    const payload: PushTokenUpdatedPayload = {
      token: 'push-token-2',
      previousToken: null,
      source: 'listener',
    };
    await hooks.syncPushToken?.(payload);

    expect(clientResolver).not.toHaveBeenCalled();
    expect(registerDevice).not.toHaveBeenCalled();
    expect(
      emitted.some((item) => item.event === PLATFORM_RUNTIME_HOOK_EVENTS.PUSH_DEVICE_REGISTER_SKIPPED),
    ).toBe(true);
  });

  it('syncs order status for payment callback and emits synced event', async () => {
    const { platform } = createRuntimeHookPlatform('auth-token');
    const emitted: Array<{ event: string; payload: unknown }> = [];
    const registerDevice = vi.fn();
    const getOrderStatus = vi.fn().mockResolvedValue({
      data: {
        orderId: 'SO-1001',
        status: 'paid',
        statusName: 'Paid',
      },
    });
    const clientResolver = vi.fn().mockResolvedValue({
      notification: { registerDevice },
      orders: { getOrderStatus },
    });

    const hooks = createDefaultPlatformRuntimeHooks({
      platform,
      clientResolver,
      emit: (event, payload) => emitted.push({ event, payload }),
    });

    const callbackPayload: PaymentCallbackPayload = {
      rawUrl: 'openchat://payment/callback?orderId=SO-1001&status=success',
      orderId: 'SO-1001',
      success: true,
      status: 'success',
    };
    await hooks.handlePaymentCallback?.(callbackPayload);

    expect(getOrderStatus).toHaveBeenCalledTimes(1);
    expect(getOrderStatus).toHaveBeenCalledWith('SO-1001');
    expect(
      emitted.some((item) => item.event === PLATFORM_RUNTIME_HOOK_EVENTS.PAYMENT_ORDER_STATUS_SYNCED),
    ).toBe(true);
  });
});

