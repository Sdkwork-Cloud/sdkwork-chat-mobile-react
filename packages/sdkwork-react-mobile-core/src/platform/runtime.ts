import { AppEvents, eventBus } from '../events';
import { getPlatform } from './index';
import type { IPlatform, PaymentChannel } from './types';

export const PLATFORM_RUNTIME_EVENTS = {
  PUSH_TOKEN_UPDATED: 'platform:push:token_updated',
  PUSH_TOKEN_SYNCED: 'platform:push:token_synced',
  PUSH_TOKEN_SYNC_FAILED: 'platform:push:token_sync_failed',
  PUSH_REGISTRATION_FAILED: 'platform:push:registration_failed',
  PUSH_NOTIFICATION_RECEIVED: 'platform:push:notification_received',
  PUSH_NOTIFICATION_ACTION: 'platform:push:notification_action',
  PUSH_REGISTRATION_EVENT: 'platform:push:registration_event',
  PAYMENT_CALLBACK: 'platform:payment:callback',
  PAYMENT_CALLBACK_HANDLED: 'platform:payment:callback_handled',
  PAYMENT_CALLBACK_HANDLE_FAILED: 'platform:payment:callback_handle_failed',
} as const;

export interface PaymentCallbackPayload {
  rawUrl: string;
  orderId: string;
  success: boolean;
  status: string;
  channel?: PaymentChannel;
  code?: string;
  message?: string;
}

export interface PlatformRuntimeOptions {
  pushTokenStorageKey?: string;
  emit?: (event: string, payload?: unknown) => void;
  syncPushToken?: (payload: PushTokenUpdatedPayload) => Promise<void> | void;
  handlePaymentCallback?: (payload: PaymentCallbackPayload) => Promise<void> | void;
}

const DEFAULT_PUSH_TOKEN_STORAGE_KEY = 'sys_push_token_v1';
const SUCCESS_STATUSES = new Set(['success', 'succeeded', 'paid', 'ok', '1', 'true']);

let runtimeCleanup: (() => void) | null = null;
type PushTokenUpdateSource = 'registration' | 'listener';

export interface PushTokenUpdatedPayload {
  token: string;
  previousToken: string | null;
  source: PushTokenUpdateSource;
}

function normalizeStatus(value: string | null): string {
  return (value || '').trim().toLowerCase();
}

function toPaymentChannel(value: string | null): PaymentChannel | undefined {
  const raw = (value || '').trim().toLowerCase();
  if (raw === 'wechat_pay') return 'wechat_pay';
  if (raw === 'alipay') return 'alipay';
  if (raw === 'apple_pay') return 'apple_pay';
  if (raw === 'google_pay') return 'google_pay';
  if (raw === 'web') return 'web';
  if (raw === 'custom') return 'custom';
  return undefined;
}

function extractPushToken(payload: unknown): string | undefined {
  if (!payload || typeof payload !== 'object') return undefined;
  const tokenValue = (payload as { value?: string }).value;
  if (typeof tokenValue === 'string' && tokenValue.trim()) {
    return tokenValue.trim();
  }
  const token = (payload as { token?: string }).token;
  if (typeof token === 'string' && token.trim()) {
    return token.trim();
  }
  return undefined;
}

async function persistPushToken(
  platform: IPlatform,
  token: string,
  key: string,
  emit: (event: string, payload?: unknown) => void,
  options?: {
    source: PushTokenUpdateSource;
    syncPushToken?: (payload: PushTokenUpdatedPayload) => Promise<void> | void;
  },
): Promise<void> {
  const previousToken = await platform.storage.get<string>(key);
  if (previousToken === token) {
    return;
  }

  await platform.storage.set<string>(key, token);
  const payload: PushTokenUpdatedPayload = {
    token,
    previousToken: previousToken || null,
    source: options?.source || 'registration',
  };
  emit(PLATFORM_RUNTIME_EVENTS.PUSH_TOKEN_UPDATED, payload);

  if (!options?.syncPushToken) {
    return;
  }

  try {
    await options.syncPushToken(payload);
    emit(PLATFORM_RUNTIME_EVENTS.PUSH_TOKEN_SYNCED, payload);
  } catch (error) {
    emit(PLATFORM_RUNTIME_EVENTS.PUSH_TOKEN_SYNC_FAILED, {
      ...payload,
      error: error instanceof Error ? error.message : 'unknown error',
    });
  }
}

async function emitPaymentCallbackIfMatched(
  url: string | null | undefined,
  emit: (event: string, payload?: unknown) => void,
  handlePaymentCallback?: (payload: PaymentCallbackPayload) => Promise<void> | void,
): Promise<void> {
  const rawUrl = typeof url === 'string' ? url.trim() : '';
  if (!rawUrl) return;
  const paymentPayload = parsePaymentCallbackUrl(rawUrl);
  if (paymentPayload) {
    emit(PLATFORM_RUNTIME_EVENTS.PAYMENT_CALLBACK, paymentPayload);

    if (!handlePaymentCallback) {
      return;
    }

    try {
      await handlePaymentCallback(paymentPayload);
      emit(PLATFORM_RUNTIME_EVENTS.PAYMENT_CALLBACK_HANDLED, paymentPayload);
    } catch (error) {
      emit(PLATFORM_RUNTIME_EVENTS.PAYMENT_CALLBACK_HANDLE_FAILED, {
        payment: paymentPayload,
        error: error instanceof Error ? error.message : 'unknown error',
      });
    }
  }
}

export function parsePaymentCallbackUrl(url: string): PaymentCallbackPayload | null {
  try {
    const parsed = new URL(url);
    const params = parsed.searchParams;
    const orderId =
      params.get('orderId') ||
      params.get('order_id') ||
      params.get('outTradeNo') ||
      params.get('out_trade_no') ||
      '';
    const statusRaw =
      params.get('status') ||
      params.get('payResult') ||
      params.get('paymentStatus') ||
      params.get('result') ||
      '';

    if (!orderId || !statusRaw) {
      return null;
    }

    const status = normalizeStatus(statusRaw);
    const success = SUCCESS_STATUSES.has(status);
    const channel = toPaymentChannel(params.get('channel') || params.get('payChannel'));
    const code = params.get('code') || undefined;
    const message = params.get('message') || params.get('msg') || undefined;

    return {
      rawUrl: url,
      orderId,
      success,
      status,
      channel,
      code,
      message,
    };
  } catch {
    return null;
  }
}

export async function attachPlatformRuntime(
  platform: IPlatform,
  options: PlatformRuntimeOptions = {},
): Promise<() => void> {
  const emit = options.emit || ((event: string, payload?: unknown) => eventBus.emit(event, payload));
  const pushTokenStorageKey = options.pushTokenStorageKey || DEFAULT_PUSH_TOKEN_STORAGE_KEY;
  const syncPushToken = options.syncPushToken;
  const handlePaymentCallback = options.handlePaymentCallback;
  const cleanups: Array<() => void> = [];

  const appStateCleanup = await platform.app.addListener('appStateChange', ({ isActive }) => {
    emit(isActive ? AppEvents.APP_FOREGROUND : AppEvents.APP_BACKGROUND, { isActive });
  });
  cleanups.push(appStateCleanup);

  if (typeof platform.app.getLaunchUrl === 'function') {
    try {
      const launchResult = await platform.app.getLaunchUrl();
      await emitPaymentCallbackIfMatched(launchResult?.url, emit, handlePaymentCallback);
    } catch {
      // Some runtimes may throw for unsupported launch URL APIs.
    }
  }

  const networkCleanup = await platform.network.addListener((status) => {
    emit(status.connected ? AppEvents.NETWORK_ONLINE : AppEvents.NETWORK_OFFLINE, status);
  });
  cleanups.push(networkCleanup);

  try {
    const appUrlCleanup = await platform.app.addListener('appUrlOpen', ({ url }) => {
      void emitPaymentCallbackIfMatched(url, emit, handlePaymentCallback);
    });
    cleanups.push(appUrlCleanup);
  } catch {
    // appUrlOpen may not be supported by specific runtimes.
  }

  if (platform.push.isSupported()) {
    const registrationCleanup = await platform.push.addListener('registration', (payload) => {
      emit(PLATFORM_RUNTIME_EVENTS.PUSH_REGISTRATION_EVENT, payload);
      const token = extractPushToken(payload);
      if (token) {
        void persistPushToken(platform, token, pushTokenStorageKey, emit, {
          source: 'listener',
          syncPushToken,
        });
      }
    });
    cleanups.push(registrationCleanup);

    const registrationErrorCleanup = await platform.push.addListener('registrationError', (payload) => {
      emit(PLATFORM_RUNTIME_EVENTS.PUSH_REGISTRATION_FAILED, payload);
    });
    cleanups.push(registrationErrorCleanup);

    const pushReceivedCleanup = await platform.push.addListener('pushNotificationReceived', (payload) => {
      emit(PLATFORM_RUNTIME_EVENTS.PUSH_NOTIFICATION_RECEIVED, payload);
    });
    cleanups.push(pushReceivedCleanup);

    const pushActionCleanup = await platform.push.addListener('pushNotificationActionPerformed', (payload) => {
      emit(PLATFORM_RUNTIME_EVENTS.PUSH_NOTIFICATION_ACTION, payload);
    });
    cleanups.push(pushActionCleanup);

    const registrationResult = await platform.push.register();
    if (!registrationResult.success) {
      emit(PLATFORM_RUNTIME_EVENTS.PUSH_REGISTRATION_FAILED, {
        error: registrationResult.error || 'Push registration failed',
      });
    } else if (registrationResult.token) {
      await persistPushToken(platform, registrationResult.token, pushTokenStorageKey, emit, {
        source: 'registration',
        syncPushToken,
      });
    }
  }

  return () => {
    for (const cleanup of cleanups.reverse()) {
      try {
        cleanup();
      } catch {
        // Ignore cleanup failures.
      }
    }
  };
}

export async function initializePlatformRuntime(
  options: PlatformRuntimeOptions = {},
): Promise<() => void> {
  if (runtimeCleanup) {
    return runtimeCleanup;
  }

  const cleanup = await attachPlatformRuntime(getPlatform(), options);
  runtimeCleanup = () => {
    cleanup();
    runtimeCleanup = null;
  };
  return runtimeCleanup;
}
