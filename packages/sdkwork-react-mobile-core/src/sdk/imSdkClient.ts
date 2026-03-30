import {
  createClient,
  type SdkworkBackendClient,
  type SdkworkBackendConfig,
} from '@sdkwork/im-backend-sdk';
import type {
  OpenChatBackendClientLike,
  OpenChatConnectionState,
  OpenChatImSdk,
} from '@openchat/sdkwork-im-sdk';
import { OpenChatImSdk as OpenChatImSdkClient } from '@openchat/sdkwork-im-sdk';
import { OpenChatWukongimAdapter } from '@openchat/sdkwork-im-wukongim-adapter';
import { createAppSdkCoreRuntimeConfig, type AppRuntimeEnv, type AppSdkCoreRuntimeConfig } from './appSdkClient';
import { normalizeAppSdkAuthToken } from './authSession';

export interface AppImSdkRuntimeConfig {
  env: AppRuntimeEnv;
  baseUrl: string;
  timeout: number;
  apiKey?: string;
  accessToken?: string;
  tenantId?: string;
  organizationId?: string;
  platform?: string;
}

export interface AppImSessionIdentity {
  userId: string;
  username: string;
  displayName: string;
  authToken: string;
  accessToken?: string;
  refreshToken?: string;
}

export interface AppImSdkSessionOptions {
  bootstrapRealtime?: boolean;
}

let appImClient: SdkworkBackendClient | null = null;
let appImSdk: OpenChatImSdk | null = null;
let appImConfig: SdkworkBackendConfig | null = null;
let appImRuntimeConfig: AppImSdkRuntimeConfig | null = null;
let appImSessionIdentity: AppImSessionIdentity | null = null;
let appImConnectionState: OpenChatConnectionState = 'idle';
let appImConnectionStateUnsubscribe: (() => void) | null = null;

const connectionStateListeners = new Set<(state: OpenChatConnectionState) => void>();

function emitConnectionState(state: OpenChatConnectionState): void {
  appImConnectionState = state;
  for (const listener of connectionStateListeners) {
    listener(state);
  }
}

function cloneSessionIdentity(session: AppImSessionIdentity): AppImSessionIdentity {
  return {
    userId: session.userId,
    username: session.username,
    displayName: session.displayName,
    authToken: session.authToken,
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
  };
}

export function createAppImSdkRuntimeConfig(
  overrides: Partial<AppSdkCoreRuntimeConfig & { baseUrl?: string }> = {},
): AppImSdkRuntimeConfig {
  const runtime = createAppSdkCoreRuntimeConfig({
    env: overrides.env,
    imBaseUrl: overrides.baseUrl ?? overrides.imBaseUrl,
    timeout: overrides.timeout,
    apiKey: overrides.apiKey,
    accessToken: overrides.accessToken,
    tenantId: overrides.tenantId,
    organizationId: overrides.organizationId,
    platform: overrides.platform,
  });

  return {
    env: runtime.env,
    baseUrl: runtime.imBaseUrl,
    timeout: runtime.timeout,
    apiKey: runtime.apiKey,
    accessToken: runtime.accessToken,
    tenantId: runtime.tenantId,
    organizationId: runtime.organizationId,
    platform: runtime.platform,
  };
}

export function createAppImSdkClientConfig(
  overrides: Partial<SdkworkBackendConfig & { env?: AppRuntimeEnv }> = {},
): SdkworkBackendConfig {
  const runtime = createAppImSdkRuntimeConfig({
    env: overrides.env,
    baseUrl: overrides.baseUrl,
    timeout: overrides.timeout,
    apiKey: overrides.apiKey,
    accessToken: overrides.accessToken,
    tenantId: overrides.tenantId,
    organizationId: overrides.organizationId,
    platform: overrides.platform,
  });

  appImRuntimeConfig = runtime;

  return {
    baseUrl: runtime.baseUrl,
    timeout: runtime.timeout,
    apiKey: runtime.apiKey,
    accessToken: runtime.accessToken,
    tenantId: runtime.tenantId,
    organizationId: runtime.organizationId,
    platform: runtime.platform,
    authToken: overrides.authToken,
    tokenManager: overrides.tokenManager,
    authMode: overrides.authMode,
    headers: overrides.headers,
  };
}

export function hasAppImSdkBaseUrl(): boolean {
  return createAppImSdkRuntimeConfig().baseUrl.trim().length > 0;
}

export function initAppImSdkClient(
  overrides: Partial<SdkworkBackendConfig & { env?: AppRuntimeEnv }> = {},
): SdkworkBackendClient {
  appImConfig = createAppImSdkClientConfig(overrides);
  appImClient = createClient(appImConfig);
  return appImClient;
}

export function getAppImSdkClient(): SdkworkBackendClient {
  if (!appImClient) {
    return initAppImSdkClient();
  }
  return appImClient;
}

export function getAppImSdkClientConfig(): SdkworkBackendConfig | null {
  return appImConfig;
}

export function getAppImSdkRuntimeConfig(): AppImSdkRuntimeConfig {
  if (!appImRuntimeConfig) {
    appImRuntimeConfig = createAppImSdkRuntimeConfig();
  }
  return appImRuntimeConfig;
}

function bindConnectionState(runtime: OpenChatImSdk): void {
  appImConnectionStateUnsubscribe?.();
  appImConnectionStateUnsubscribe = runtime.realtime.onConnectionStateChange((state) => {
    emitConnectionState(state as OpenChatConnectionState);
  });
}

export function initAppImSdk(
  overrides: Partial<SdkworkBackendConfig & { env?: AppRuntimeEnv }> = {},
): OpenChatImSdk {
  const backendClient = initAppImSdkClient(overrides) as unknown as OpenChatBackendClientLike;
  appImSdk = new OpenChatImSdkClient({
    backendClient,
    realtimeAdapter: new OpenChatWukongimAdapter(),
  });
  bindConnectionState(appImSdk);
  emitConnectionState('idle');
  return appImSdk;
}

export function getAppImSdk(): OpenChatImSdk {
  if (!appImSdk) {
    return initAppImSdk();
  }
  return appImSdk;
}

export function getAppImSessionIdentity(): AppImSessionIdentity | null {
  return appImSessionIdentity ? cloneSessionIdentity(appImSessionIdentity) : null;
}

export function getAppImSdkConnectionState(): OpenChatConnectionState {
  return appImConnectionState;
}

export function subscribeAppImSdkConnectionState(
  listener: (state: OpenChatConnectionState) => void,
): () => void {
  connectionStateListeners.add(listener);
  listener(appImConnectionState);
  return () => {
    connectionStateListeners.delete(listener);
  };
}

export async function syncAppImSdkSession(
  session: AppImSessionIdentity,
  options: AppImSdkSessionOptions = {},
): Promise<AppImSessionIdentity> {
  const normalizedAuthToken = normalizeAppSdkAuthToken(session.authToken);
  if (!normalizedAuthToken) {
    throw new Error('IM auth token is required');
  }

  const runtimeAccessToken = (createAppImSdkRuntimeConfig().accessToken || '').trim();
  const accessToken = (session.accessToken || runtimeAccessToken || '').trim() || undefined;

  const normalizedSession: AppImSessionIdentity = {
    userId: (session.userId || '').trim(),
    username: (session.username || '').trim(),
    displayName: (session.displayName || '').trim(),
    authToken: normalizedAuthToken,
    ...(accessToken ? { accessToken } : {}),
    ...(session.refreshToken ? { refreshToken: session.refreshToken.trim() } : {}),
  };

  appImSessionIdentity = normalizedSession;

  const backendClient = getAppImSdkClient();
  backendClient.setAuthToken(normalizedAuthToken);
  backendClient.setAccessToken(accessToken || normalizedAuthToken);

  const runtime = getAppImSdk();
  runtime.session.setAuthToken?.(normalizedAuthToken);
  runtime.session.setAccessToken(normalizedAuthToken);

  if (accessToken && accessToken !== normalizedAuthToken) {
    backendClient.setAccessToken(accessToken);
  }

  if (options.bootstrapRealtime !== false) {
    try {
      await runtime.session.connectRealtime();
    } catch (error) {
      emitConnectionState('error');
      throw error;
    }
  }

  return cloneSessionIdentity(normalizedSession);
}

export async function clearAppImSdkSession(): Promise<void> {
  const runtime = appImSdk;
  if (runtime) {
    try {
      await runtime.session.disconnectRealtime();
    } catch {
      // Keep local cleanup authoritative when realtime teardown fails.
    }
  }

  appImSessionIdentity = null;
  resetAppImSdkClient();
}

export function resetAppImSdkClient(): void {
  appImConnectionStateUnsubscribe?.();
  appImConnectionStateUnsubscribe = null;
  appImClient = null;
  appImSdk = null;
  appImConfig = null;
  appImRuntimeConfig = null;
  appImSessionIdentity = null;
  emitConnectionState('idle');
}
