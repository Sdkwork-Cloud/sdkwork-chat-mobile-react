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
  PAYMENT_ORDER_STATUS_SYNCED: 'platform:payment:order_status_synced',
  PAYMENT_ORDER_STATUS_SYNC_SKIPPED: 'platform:payment:order_status_sync_skipped',
} as const;

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

export function createDefaultPlatformRuntimeHooks(
  options: DefaultPlatformRuntimeHooksOptions,
): Pick<PlatformRuntimeOptions, 'syncPushToken' | 'handlePaymentCallback'> {
  const emit: RuntimeEmitter = options.emit || ((event, payload) => eventBus.emit(event, payload));
  const resolveClient: RuntimeClientResolver = options.clientResolver || getAppSdkCoreClientWithSession;
  const storage = options.platform.storage as ServiceStorageAdapter;
  const appVersion = resolveAppVersion(options.appVersion);

  return {
    syncPushToken: async (payload: PushTokenUpdatedPayload) => {
      const authToken = await readAuthToken(storage);
      if (!authToken) {
        emit(PLATFORM_RUNTIME_HOOK_EVENTS.PUSH_DEVICE_REGISTER_SKIPPED, {
          reason: 'auth_token_missing',
          token: payload.token,
        });
        return;
      }

      const client = (await resolveClient({
        storage,
        authStorageKey: APP_SDK_AUTH_TOKEN_STORAGE_KEY,
      })) as RuntimeClientLike;
      const notificationApi = resolveNotificationApi(client);
      const deviceInfo = await readDeviceInfo(options.platform);
      const deviceId = await readDeviceUUID(options.platform, payload.token);

      await notificationApi.registerDevice({
        deviceType: resolveDeviceType(options.platform.type),
        deviceId,
        pushToken: payload.token,
        osVersion: deviceInfo?.osVersion || deviceInfo?.platformVersion || undefined,
        appVersion,
      });

      emit(PLATFORM_RUNTIME_HOOK_EVENTS.PUSH_DEVICE_REGISTERED, {
        ...payload,
        deviceId,
      });
    },
    handlePaymentCallback: async (payload: PaymentCallbackPayload) => {
      const authToken = await readAuthToken(storage);
      if (!authToken) {
        emit(PLATFORM_RUNTIME_HOOK_EVENTS.PAYMENT_ORDER_STATUS_SYNC_SKIPPED, {
          reason: 'auth_token_missing',
          orderId: payload.orderId,
        });
        return;
      }

      const client = (await resolveClient({
        storage,
        authStorageKey: APP_SDK_AUTH_TOKEN_STORAGE_KEY,
      })) as RuntimeClientLike;
      const ordersApi = resolveOrdersApi(client);
      const statusResult = await ordersApi.getOrderStatus(payload.orderId);

      emit(PLATFORM_RUNTIME_HOOK_EVENTS.PAYMENT_ORDER_STATUS_SYNCED, {
        orderId: payload.orderId,
        callbackStatus: payload.status,
        callbackSuccess: payload.success,
        channel: payload.channel,
        orderStatus: statusResult.data?.status || payload.status,
        orderStatusName: statusResult.data?.statusName,
        orderExpireTime: statusResult.data?.expireTime,
      });
    },
  };
}

