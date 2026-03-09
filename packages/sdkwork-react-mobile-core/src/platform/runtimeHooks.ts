import { eventBus } from '../events';
import {
  APP_SDK_AUTH_TOKEN_STORAGE_KEY,
  getAppSdkCoreClientWithSession,
  type AppSdkCoreSessionOptions,
} from '../sdk/appSdkClient';
import type { ServiceStorageAdapter } from '../types';
import type { PaymentCallbackPayload, PlatformRuntimeOptions, PushTokenUpdatedPayload } from './runtime';
import type { DeviceInfo, IPlatform } from './types';

export const PLATFORM_RUNTIME_HOOK_EVENTS = {
  PUSH_DEVICE_REGISTERED: 'platform:push:device_registered',
  PUSH_DEVICE_REGISTER_SKIPPED: 'platform:push:device_register_skipped',
  PUSH_RETRY_ENQUEUED: 'platform:push:retry_enqueued',
  PUSH_RETRY_DROPPED: 'platform:push:retry_dropped',
  PAYMENT_ORDER_STATUS_SYNCED: 'platform:payment:order_status_synced',
  PAYMENT_ORDER_STATUS_SYNC_SKIPPED: 'platform:payment:order_status_sync_skipped',
  PAYMENT_RETRY_ENQUEUED: 'platform:payment:retry_enqueued',
  PAYMENT_RETRY_DROPPED: 'platform:payment:retry_dropped',
  RETRY_QUEUE_FLUSHED: 'platform:runtime:retry_queue_flushed',
} as const;

const PUSH_RETRY_QUEUE_KEY = 'sys_platform_push_retry_queue_v1';
const PAYMENT_RETRY_QUEUE_KEY = 'sys_platform_payment_retry_queue_v1';
const DEFAULT_RETRY_MAX_ATTEMPTS = 5;
const DEFAULT_RETRY_TTL_MS = 3 * 24 * 60 * 60 * 1000;

type RuntimeHookPlatform = Pick<IPlatform, 'type' | 'device' | 'storage'>;
type RuntimeEmitter = (event: string, payload?: unknown) => void;
type RuntimeClientResolver = (options?: AppSdkCoreSessionOptions) => ReturnType<typeof getAppSdkCoreClientWithSession>;

interface NotificationApiLike {
  registerDevice: (body: {
    deviceType: string;
    deviceId: string;
    pushToken: string;
    osVersion?: string;
    appVersion?: string;
  }) => Promise<unknown>;
}

interface OrdersApiLike {
  getOrderStatus: (orderId: string | number) => Promise<{
    data?: {
      orderId?: string;
      status?: string;
      statusName?: string;
      expireTime?: number;
    };
  }>;
}

interface RuntimeClientLike {
  notification?: Partial<NotificationApiLike>;
  orders?: Partial<OrdersApiLike>;
}

export interface DefaultPlatformRuntimeHooksOptions {
  platform: RuntimeHookPlatform;
  emit?: RuntimeEmitter;
  clientResolver?: RuntimeClientResolver;
  appVersion?: string;
  retryMaxAttempts?: number;
  retryTtlMs?: number;
}

interface PushRetryItem {
  payload: PushTokenUpdatedPayload;
  queuedAt: number;
  attempts?: number;
  error?: string;
}

interface PaymentRetryItem {
  payload: PaymentCallbackPayload;
  queuedAt: number;
  attempts?: number;
  error?: string;
}

interface RuntimeHookContext {
  platform: RuntimeHookPlatform;
  storage: ServiceStorageAdapter;
  emit: RuntimeEmitter;
  resolveClient: RuntimeClientResolver;
  appVersion?: string;
  retryMaxAttempts: number;
  retryTtlMs: number;
}

export interface RuntimeRetryFlushResult {
  push: number;
  payment: number;
}

function readRuntimeEnv(name: string): string | undefined {
  const importMetaEnv = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
  if (importMetaEnv && name in importMetaEnv) {
    return importMetaEnv[name];
  }
  const processEnv = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;
  return processEnv?.[name];
}

function resolveAppVersion(override?: string): string | undefined {
  const candidates = [
    override,
    readRuntimeEnv('VITE_APP_VERSION'),
    readRuntimeEnv('APP_VERSION'),
    readRuntimeEnv('SDKWORK_APP_VERSION'),
  ];
  for (const value of candidates) {
    const normalized = (value || '').trim();
    if (normalized) {
      return normalized;
    }
  }
  return undefined;
}

function resolveDeviceType(platformType: RuntimeHookPlatform['type']): string {
  return (platformType || 'mobile').toLowerCase();
}

function resolveRetryMaxAttempts(value?: number): number {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 1) {
    return Math.floor(value);
  }
  return DEFAULT_RETRY_MAX_ATTEMPTS;
}

function resolveRetryTtlMs(value?: number): number {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 60_000) {
    return Math.floor(value);
  }
  return DEFAULT_RETRY_TTL_MS;
}

function resolveRetryAttempts(value?: number): number {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 1) {
    return Math.floor(value);
  }
  return 1;
}

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'unknown error';
}

async function readAuthToken(storage: ServiceStorageAdapter): Promise<string> {
  try {
    const token = await Promise.resolve(storage.get<string>(APP_SDK_AUTH_TOKEN_STORAGE_KEY));
    return (token || '').trim();
  } catch {
    return '';
  }
}

async function readDeviceInfo(platform: RuntimeHookPlatform): Promise<DeviceInfo | null> {
  try {
    return await platform.device.getInfo();
  } catch {
    return null;
  }
}

async function readDeviceUUID(platform: RuntimeHookPlatform, fallback: string): Promise<string> {
  try {
    const uuid = (await platform.device.getUUID()).trim();
    return uuid || fallback;
  } catch {
    return fallback;
  }
}

function resolveNotificationApi(client: RuntimeClientLike): NotificationApiLike {
  const api = client.notification;
  if (!api || typeof api.registerDevice !== 'function') {
    throw new Error('notification.registerDevice is unavailable on SDK client');
  }
  return api as NotificationApiLike;
}

function resolveOrdersApi(client: RuntimeClientLike): OrdersApiLike {
  const api = client.orders;
  if (!api || typeof api.getOrderStatus !== 'function') {
    throw new Error('orders.getOrderStatus is unavailable on SDK client');
  }
  return api as OrdersApiLike;
}

async function readQueue<T>(storage: ServiceStorageAdapter, key: string): Promise<T[]> {
  try {
    const queue = await Promise.resolve(storage.get<T[]>(key));
    return Array.isArray(queue) ? queue : [];
  } catch {
    return [];
  }
}

async function writeQueue<T>(storage: ServiceStorageAdapter, key: string, queue: T[]): Promise<void> {
  if (!queue.length) {
    await Promise.resolve(storage.remove(key));
    return;
  }
  await Promise.resolve(storage.set(key, queue));
}

function createRuntimeHookContext(options: DefaultPlatformRuntimeHooksOptions): RuntimeHookContext {
  return {
    platform: options.platform,
    storage: options.platform.storage as ServiceStorageAdapter,
    emit: options.emit || ((event, payload) => eventBus.emit(event, payload)),
    resolveClient: options.clientResolver || getAppSdkCoreClientWithSession,
    appVersion: resolveAppVersion(options.appVersion),
    retryMaxAttempts: resolveRetryMaxAttempts(options.retryMaxAttempts),
    retryTtlMs: resolveRetryTtlMs(options.retryTtlMs),
  };
}

async function syncPushTokenNow(
  context: RuntimeHookContext,
  payload: PushTokenUpdatedPayload,
): Promise<{ deviceId: string }> {
  const authToken = await readAuthToken(context.storage);
  if (!authToken) {
    throw new Error('auth token missing');
  }

  const client = (await context.resolveClient({
    storage: context.storage,
    authStorageKey: APP_SDK_AUTH_TOKEN_STORAGE_KEY,
  })) as RuntimeClientLike;
  const notificationApi = resolveNotificationApi(client);
  const deviceInfo = await readDeviceInfo(context.platform);
  const deviceId = await readDeviceUUID(context.platform, payload.token);

  await notificationApi.registerDevice({
    deviceType: resolveDeviceType(context.platform.type),
    deviceId,
    pushToken: payload.token,
    osVersion: deviceInfo?.osVersion || deviceInfo?.platformVersion || undefined,
    appVersion: context.appVersion,
  });

  return { deviceId };
}

async function syncPaymentStatusNow(
  context: RuntimeHookContext,
  payload: PaymentCallbackPayload,
): Promise<{ status?: string; statusName?: string; expireTime?: number }> {
  const authToken = await readAuthToken(context.storage);
  if (!authToken) {
    throw new Error('auth token missing');
  }

  const client = (await context.resolveClient({
    storage: context.storage,
    authStorageKey: APP_SDK_AUTH_TOKEN_STORAGE_KEY,
  })) as RuntimeClientLike;
  const ordersApi = resolveOrdersApi(client);
  const statusResult = await ordersApi.getOrderStatus(payload.orderId);
  return {
    status: statusResult.data?.status,
    statusName: statusResult.data?.statusName,
    expireTime: statusResult.data?.expireTime,
  };
}

async function enqueuePushRetry(
  context: RuntimeHookContext,
  payload: PushTokenUpdatedPayload,
  error: unknown,
): Promise<void> {
  const queue = await readQueue<PushRetryItem>(context.storage, PUSH_RETRY_QUEUE_KEY);
  const existing = queue.find((item) => item.payload.token === payload.token);
  const deduped = queue.filter((item) => item.payload.token !== payload.token);
  deduped.push({
    payload,
    queuedAt: existing?.queuedAt ?? Date.now(),
    attempts: existing ? resolveRetryAttempts(existing.attempts) + 1 : 1,
    error: toErrorMessage(error),
  });
  await writeQueue(context.storage, PUSH_RETRY_QUEUE_KEY, deduped);
  context.emit(PLATFORM_RUNTIME_HOOK_EVENTS.PUSH_RETRY_ENQUEUED, {
    token: payload.token,
    reason: toErrorMessage(error),
    queueSize: deduped.length,
  });
}

async function enqueuePaymentRetry(
  context: RuntimeHookContext,
  payload: PaymentCallbackPayload,
  error: unknown,
): Promise<void> {
  const queue = await readQueue<PaymentRetryItem>(context.storage, PAYMENT_RETRY_QUEUE_KEY);
  const existing = queue.find((item) => item.payload.orderId === payload.orderId);
  const deduped = queue.filter((item) => item.payload.orderId !== payload.orderId);
  deduped.push({
    payload,
    queuedAt: existing?.queuedAt ?? Date.now(),
    attempts: existing ? resolveRetryAttempts(existing.attempts) + 1 : 1,
    error: toErrorMessage(error),
  });
  await writeQueue(context.storage, PAYMENT_RETRY_QUEUE_KEY, deduped);
  context.emit(PLATFORM_RUNTIME_HOOK_EVENTS.PAYMENT_RETRY_ENQUEUED, {
    orderId: payload.orderId,
    reason: toErrorMessage(error),
    queueSize: deduped.length,
  });
}

function isAuthTokenMissing(error: unknown): boolean {
  const message = toErrorMessage(error).toLowerCase();
  return message.includes('auth token missing');
}

export async function flushDefaultPlatformRuntimeHookQueue(
  options: DefaultPlatformRuntimeHooksOptions,
): Promise<RuntimeRetryFlushResult> {
  const context = createRuntimeHookContext(options);
  const now = Date.now();
  let pushSuccess = 0;
  let paymentSuccess = 0;
  let pushDropped = 0;
  let paymentDropped = 0;

  const pushQueue = await readQueue<PushRetryItem>(context.storage, PUSH_RETRY_QUEUE_KEY);
  const pushRemaining: PushRetryItem[] = [];
  for (const item of pushQueue) {
    const attempts = resolveRetryAttempts(item.attempts);
    const queuedAt = item.queuedAt ?? now;
    const isExpired = now - queuedAt > context.retryTtlMs;
    const reachedMaxAttempts = attempts >= context.retryMaxAttempts;
    if (isExpired || reachedMaxAttempts) {
      pushDropped += 1;
      context.emit(PLATFORM_RUNTIME_HOOK_EVENTS.PUSH_RETRY_DROPPED, {
        token: item.payload.token,
        reason: isExpired ? 'retry_ttl_expired' : 'retry_max_attempts_reached',
        attempts,
      });
      continue;
    }

    try {
      const { deviceId } = await syncPushTokenNow(context, item.payload);
      context.emit(PLATFORM_RUNTIME_HOOK_EVENTS.PUSH_DEVICE_REGISTERED, {
        ...item.payload,
        deviceId,
        flushed: true,
      });
      pushSuccess += 1;
    } catch (error) {
      pushRemaining.push({
        ...item,
        queuedAt,
        attempts: attempts + 1,
        error: toErrorMessage(error),
      });
    }
  }
  await writeQueue(context.storage, PUSH_RETRY_QUEUE_KEY, pushRemaining);

  const paymentQueue = await readQueue<PaymentRetryItem>(context.storage, PAYMENT_RETRY_QUEUE_KEY);
  const paymentRemaining: PaymentRetryItem[] = [];
  for (const item of paymentQueue) {
    const attempts = resolveRetryAttempts(item.attempts);
    const queuedAt = item.queuedAt ?? now;
    const isExpired = now - queuedAt > context.retryTtlMs;
    const reachedMaxAttempts = attempts >= context.retryMaxAttempts;
    if (isExpired || reachedMaxAttempts) {
      paymentDropped += 1;
      context.emit(PLATFORM_RUNTIME_HOOK_EVENTS.PAYMENT_RETRY_DROPPED, {
        orderId: item.payload.orderId,
        reason: isExpired ? 'retry_ttl_expired' : 'retry_max_attempts_reached',
        attempts,
      });
      continue;
    }

    try {
      const status = await syncPaymentStatusNow(context, item.payload);
      context.emit(PLATFORM_RUNTIME_HOOK_EVENTS.PAYMENT_ORDER_STATUS_SYNCED, {
        orderId: item.payload.orderId,
        callbackStatus: item.payload.status,
        callbackSuccess: item.payload.success,
        channel: item.payload.channel,
        orderStatus: status.status || item.payload.status,
        orderStatusName: status.statusName,
        orderExpireTime: status.expireTime,
        flushed: true,
      });
      paymentSuccess += 1;
    } catch (error) {
      paymentRemaining.push({
        ...item,
        queuedAt,
        attempts: attempts + 1,
        error: toErrorMessage(error),
      });
    }
  }
  await writeQueue(context.storage, PAYMENT_RETRY_QUEUE_KEY, paymentRemaining);

  context.emit(PLATFORM_RUNTIME_HOOK_EVENTS.RETRY_QUEUE_FLUSHED, {
    push: pushSuccess,
    payment: paymentSuccess,
    pushDropped,
    paymentDropped,
    pushRemaining: pushRemaining.length,
    paymentRemaining: paymentRemaining.length,
  });

  return {
    push: pushSuccess,
    payment: paymentSuccess,
  };
}

export function createDefaultPlatformRuntimeHooks(
  options: DefaultPlatformRuntimeHooksOptions,
): Pick<PlatformRuntimeOptions, 'syncPushToken' | 'handlePaymentCallback'> {
  const context = createRuntimeHookContext(options);

  return {
    syncPushToken: async (payload: PushTokenUpdatedPayload) => {
      try {
        const { deviceId } = await syncPushTokenNow(context, payload);
        context.emit(PLATFORM_RUNTIME_HOOK_EVENTS.PUSH_DEVICE_REGISTERED, {
          ...payload,
          deviceId,
        });
      } catch (error) {
        await enqueuePushRetry(context, payload, error);
        if (isAuthTokenMissing(error)) {
          context.emit(PLATFORM_RUNTIME_HOOK_EVENTS.PUSH_DEVICE_REGISTER_SKIPPED, {
            reason: 'auth_token_missing',
            token: payload.token,
            queued: true,
          });
          return;
        }
        throw error;
      }
    },
    handlePaymentCallback: async (payload: PaymentCallbackPayload) => {
      try {
        const status = await syncPaymentStatusNow(context, payload);
        context.emit(PLATFORM_RUNTIME_HOOK_EVENTS.PAYMENT_ORDER_STATUS_SYNCED, {
          orderId: payload.orderId,
          callbackStatus: payload.status,
          callbackSuccess: payload.success,
          channel: payload.channel,
          orderStatus: status.status || payload.status,
          orderStatusName: status.statusName,
          orderExpireTime: status.expireTime,
        });
      } catch (error) {
        await enqueuePaymentRetry(context, payload, error);
        if (isAuthTokenMissing(error)) {
          context.emit(PLATFORM_RUNTIME_HOOK_EVENTS.PAYMENT_ORDER_STATUS_SYNC_SKIPPED, {
            reason: 'auth_token_missing',
            orderId: payload.orderId,
            queued: true,
          });
          return;
        }
        throw error;
      }
    },
  };
}
