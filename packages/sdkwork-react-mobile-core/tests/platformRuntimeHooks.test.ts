import { describe, expect, it, vi } from 'vitest';
import {
  createDefaultPlatformRuntimeHooks,
  flushDefaultPlatformRuntimeHookQueue,
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

  it('queues failed push sync and flushes retry queue successfully', async () => {
    const { platform } = createRuntimeHookPlatform('auth-token');
    const emitted: Array<{ event: string; payload: unknown }> = [];
    const registerDevice = vi
      .fn()
      .mockRejectedValueOnce(new Error('network timeout'))
      .mockResolvedValueOnce({ data: { id: 'device-record-2' } });
    const clientResolver = vi.fn().mockResolvedValue({
      notification: { registerDevice },
      orders: { getOrderStatus: vi.fn() },
    });

    const hooks = createDefaultPlatformRuntimeHooks({
      platform,
      clientResolver,
      emit: (event, payload) => emitted.push({ event, payload }),
    });

    await expect(
      hooks.syncPushToken?.({
        token: 'push-token-retry',
        previousToken: null,
        source: 'registration',
      }),
    ).rejects.toThrow('network timeout');

    const flushResult = await flushDefaultPlatformRuntimeHookQueue({
      platform,
      clientResolver,
      emit: (event, payload) => emitted.push({ event, payload }),
    });

    expect(registerDevice).toHaveBeenCalledTimes(2);
    expect(flushResult.push).toBe(1);
    expect(flushResult.payment).toBe(0);
    expect(
      emitted.some((item) => item.event === PLATFORM_RUNTIME_HOOK_EVENTS.PUSH_RETRY_ENQUEUED),
    ).toBe(true);
    expect(
      emitted.some((item) => item.event === PLATFORM_RUNTIME_HOOK_EVENTS.RETRY_QUEUE_FLUSHED),
    ).toBe(true);
  });

  it('queues failed payment status sync and flushes retry queue successfully', async () => {
    const { platform } = createRuntimeHookPlatform('auth-token');
    const emitted: Array<{ event: string; payload: unknown }> = [];
    const getOrderStatus = vi
      .fn()
      .mockRejectedValueOnce(new Error('gateway unavailable'))
      .mockResolvedValueOnce({
        data: {
          orderId: 'SO-2002',
          status: 'paid',
          statusName: 'Paid',
        },
      });
    const clientResolver = vi.fn().mockResolvedValue({
      notification: { registerDevice: vi.fn() },
      orders: { getOrderStatus },
    });

    const hooks = createDefaultPlatformRuntimeHooks({
      platform,
      clientResolver,
      emit: (event, payload) => emitted.push({ event, payload }),
    });

    await expect(
      hooks.handlePaymentCallback?.({
        rawUrl: 'openchat://payment/callback?orderId=SO-2002&status=paid',
        orderId: 'SO-2002',
        success: true,
        status: 'paid',
      }),
    ).rejects.toThrow('gateway unavailable');

    const flushResult = await flushDefaultPlatformRuntimeHookQueue({
      platform,
      clientResolver,
      emit: (event, payload) => emitted.push({ event, payload }),
    });

    expect(getOrderStatus).toHaveBeenCalledTimes(2);
    expect(flushResult.push).toBe(0);
    expect(flushResult.payment).toBe(1);
    expect(
      emitted.some((item) => item.event === PLATFORM_RUNTIME_HOOK_EVENTS.PAYMENT_RETRY_ENQUEUED),
    ).toBe(true);
    expect(
      emitted.some((item) => item.event === PLATFORM_RUNTIME_HOOK_EVENTS.RETRY_QUEUE_FLUSHED),
    ).toBe(true);
  });

  it('drops stale push retry items and emits dropped event', async () => {
    const { platform, storageMap } = createRuntimeHookPlatform('auth-token');
    const emitted: Array<{ event: string; payload: unknown }> = [];
    const registerDevice = vi.fn();
    const clientResolver = vi.fn().mockResolvedValue({
      notification: { registerDevice },
      orders: { getOrderStatus: vi.fn() },
    });

    storageMap.set('sys_platform_push_retry_queue_v1', [
      {
        payload: {
          token: 'push-token-stale',
          previousToken: null,
          source: 'registration',
        },
        queuedAt: 0,
        attempts: 2,
        error: 'network timeout',
      },
    ]);

    const flushResult = await flushDefaultPlatformRuntimeHookQueue({
      platform,
      clientResolver,
      emit: (event, payload) => emitted.push({ event, payload }),
    });

    expect(flushResult.push).toBe(0);
    expect(flushResult.payment).toBe(0);
    expect(registerDevice).not.toHaveBeenCalled();
    expect(storageMap.has('sys_platform_push_retry_queue_v1')).toBe(false);
    expect(
      emitted.some((item) => item.event === PLATFORM_RUNTIME_HOOK_EVENTS.PUSH_RETRY_DROPPED),
    ).toBe(true);
  });

  it('drops payment retry items when max attempts reached', async () => {
    const { platform, storageMap } = createRuntimeHookPlatform('auth-token');
    const emitted: Array<{ event: string; payload: unknown }> = [];
    const getOrderStatus = vi.fn();
    const clientResolver = vi.fn().mockResolvedValue({
      notification: { registerDevice: vi.fn() },
      orders: { getOrderStatus },
    });

    storageMap.set('sys_platform_payment_retry_queue_v1', [
      {
        payload: {
          rawUrl: 'openchat://payment/callback?orderId=SO-3003&status=paid',
          orderId: 'SO-3003',
          success: true,
          status: 'paid',
        },
        queuedAt: Date.now(),
        attempts: 5,
        error: 'gateway unavailable',
      },
    ]);

    const flushResult = await flushDefaultPlatformRuntimeHookQueue({
      platform,
      clientResolver,
      emit: (event, payload) => emitted.push({ event, payload }),
    });

    expect(flushResult.push).toBe(0);
    expect(flushResult.payment).toBe(0);
    expect(getOrderStatus).not.toHaveBeenCalled();
    expect(storageMap.has('sys_platform_payment_retry_queue_v1')).toBe(false);
    expect(
      emitted.some((item) => item.event === PLATFORM_RUNTIME_HOOK_EVENTS.PAYMENT_RETRY_DROPPED),
    ).toBe(true);
  });

  it('defers push retry during backoff window after flush failure', async () => {
    vi.useFakeTimers();
    try {
      const now = new Date('2026-03-09T00:00:00.000Z');
      vi.setSystemTime(now);

      const { platform, storageMap } = createRuntimeHookPlatform('auth-token');
      const emitted: Array<{ event: string; payload: unknown }> = [];
      const registerDevice = vi
        .fn()
        .mockRejectedValueOnce(new Error('network timeout'))
        .mockRejectedValueOnce(new Error('gateway timeout'))
        .mockResolvedValueOnce({ data: { id: 'device-record-3' } });
      const clientResolver = vi.fn().mockResolvedValue({
        notification: { registerDevice },
        orders: { getOrderStatus: vi.fn() },
      });

      const options = {
        platform,
        clientResolver,
        retryBackoffBaseMs: 60_000,
        retryBackoffMaxMs: 60_000,
        emit: (event: string, payload: unknown) => emitted.push({ event, payload }),
      };
      const hooks = createDefaultPlatformRuntimeHooks(options);

      await expect(
        hooks.syncPushToken?.({
          token: 'push-token-backoff',
          previousToken: null,
          source: 'registration',
        }),
      ).rejects.toThrow('network timeout');

      await flushDefaultPlatformRuntimeHookQueue(options);
      const queuedAfterFailedFlush = storageMap.get('sys_platform_push_retry_queue_v1') as
        | Array<{ nextRetryAt?: number }>
        | undefined;
      expect(queuedAfterFailedFlush?.[0]?.nextRetryAt).toBe(now.getTime() + 60_000);

      const skippedFlushResult = await flushDefaultPlatformRuntimeHookQueue(options);
      expect(skippedFlushResult.push).toBe(0);
      expect(registerDevice).toHaveBeenCalledTimes(2);

      vi.setSystemTime(new Date(now.getTime() + 60_000));
      const resumedFlushResult = await flushDefaultPlatformRuntimeHookQueue(options);
      expect(resumedFlushResult.push).toBe(1);
      expect(registerDevice).toHaveBeenCalledTimes(3);
    } finally {
      vi.useRealTimers();
    }
  });

  it('applies independent retry policies for push and payment queues', async () => {
    const { platform, storageMap } = createRuntimeHookPlatform('auth-token');
    const emitted: Array<{ event: string; payload: unknown }> = [];
    const registerDevice = vi
      .fn()
      .mockRejectedValueOnce(new Error('network timeout'))
      .mockRejectedValueOnce(new Error('network timeout again'));
    const getOrderStatus = vi.fn().mockRejectedValue(new Error('gateway unavailable'));
    const clientResolver = vi.fn().mockResolvedValue({
      notification: { registerDevice },
      orders: { getOrderStatus },
    });

    const options = {
      platform,
      clientResolver,
      pushRetryPolicy: {
        maxAttempts: 4,
        backoffBaseMs: 0,
        backoffMaxMs: 0,
      },
      paymentRetryPolicy: {
        maxAttempts: 1,
        backoffBaseMs: 0,
        backoffMaxMs: 0,
      },
      emit: (event: string, payload: unknown) => emitted.push({ event, payload }),
    };
    const hooks = createDefaultPlatformRuntimeHooks(options);

    await expect(
      hooks.syncPushToken?.({
        token: 'push-token-policy',
        previousToken: null,
        source: 'registration',
      }),
    ).rejects.toThrow('network timeout');
    await expect(
      hooks.handlePaymentCallback?.({
        rawUrl: 'openchat://payment/callback?orderId=SO-4004&status=paid',
        orderId: 'SO-4004',
        success: true,
        status: 'paid',
      }),
    ).rejects.toThrow('gateway unavailable');

    const paymentCallsBeforeFlush = getOrderStatus.mock.calls.length;
    const flushResult = await flushDefaultPlatformRuntimeHookQueue(options);

    expect(flushResult.push).toBe(0);
    expect(flushResult.payment).toBe(0);
    expect(registerDevice).toHaveBeenCalledTimes(2);
    expect(getOrderStatus).toHaveBeenCalledTimes(paymentCallsBeforeFlush);
    expect(storageMap.has('sys_platform_push_retry_queue_v1')).toBe(true);
    expect(storageMap.has('sys_platform_payment_retry_queue_v1')).toBe(false);
    expect(
      emitted.some((item) => item.event === PLATFORM_RUNTIME_HOOK_EVENTS.PAYMENT_RETRY_DROPPED),
    ).toBe(true);
  });
});
