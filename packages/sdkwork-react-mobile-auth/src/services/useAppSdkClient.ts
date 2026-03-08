import { useMemo } from 'react';
import type { SdkworkAppClient, SdkworkAppConfig } from '@sdkwork/app-sdk';
import {
  APP_SDK_AUTH_TOKEN_STORAGE_KEY,
  applyAppSdkCoreSessionTokens,
  createAppSdkCoreConfig,
  createAppSdkCoreRuntimeConfig,
  getAppSdkCoreClient,
  getAppSdkCoreConfig,
  initAppSdkCoreClient,
  resetAppSdkCoreClient,
  type AppRuntimeEnv,
  type AppSdkCoreRuntimeConfig,
} from '@sdkwork/react-mobile-core';

export type { AppRuntimeEnv };

export interface AppSdkClientConfig extends SdkworkAppConfig {
  env: AppRuntimeEnv;
}

export type AppSdkRuntimeConfig = AppSdkCoreRuntimeConfig;

export interface AppSdkSessionTokens {
  authToken?: string;
  accessToken?: string;
  refreshToken?: string;
}

export const APP_SDK_ACCESS_TOKEN_STORAGE_KEY = 'sdkwork_access_token';
export const APP_SDK_REFRESH_TOKEN_STORAGE_KEY = 'sdkwork_refresh_token';

let appSdkConfig: AppSdkClientConfig | null = null;

function readStorage(key: string): string | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }
  try {
    const value = window.localStorage.getItem(key);
    return value || undefined;
  } catch {
    return undefined;
  }
}

function writeStorage(key: string, value?: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    if (value && value.trim()) {
      window.localStorage.setItem(key, value.trim());
    } else {
      window.localStorage.removeItem(key);
    }
  } catch {
    // ignore storage errors
  }
}

function removeStorage(key: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore storage errors
  }
}

function normalizeAuthToken(value?: string): string {
  const normalized = (value || '').trim();
  if (!normalized) {
    return '';
  }
  if (normalized.toLowerCase().startsWith('bearer ')) {
    return normalized.slice(7).trim();
  }
  return normalized;
}

export function createAppSdkRuntimeConfig(
  overrides: Partial<AppSdkRuntimeConfig> = {},
): AppSdkRuntimeConfig {
  return createAppSdkCoreRuntimeConfig(overrides);
}

export function createAppSdkClientConfig(
  overrides: Partial<SdkworkAppConfig> = {},
): AppSdkClientConfig {
  const runtimeConfig = createAppSdkRuntimeConfig({
    apiBaseUrl: overrides.baseUrl,
    timeout: overrides.timeout,
    apiKey: overrides.apiKey,
    accessToken: overrides.accessToken,
    tenantId: overrides.tenantId,
    organizationId: overrides.organizationId,
    platform: overrides.platform,
  });
  const coreConfig = createAppSdkCoreConfig(overrides);
  return {
    env: runtimeConfig.env,
    ...coreConfig,
  };
}

export function initAppSdkClient(overrides: Partial<SdkworkAppConfig> = {}): SdkworkAppClient {
  appSdkConfig = createAppSdkClientConfig(overrides);
  return initAppSdkCoreClient(overrides);
}

export function getAppSdkClient(): SdkworkAppClient {
  return getAppSdkCoreClient();
}

export function getAppSdkClientConfig(): AppSdkClientConfig | null {
  if (appSdkConfig) {
    return appSdkConfig;
  }

  const coreConfig = getAppSdkCoreConfig();
  if (!coreConfig) {
    return null;
  }

  appSdkConfig = createAppSdkClientConfig(coreConfig);
  return appSdkConfig;
}

export function resolveAppSdkAccessToken(): string {
  const fromConfig = (getAppSdkClientConfig()?.accessToken || '').trim();
  if (fromConfig) {
    return fromConfig;
  }

  const fromRuntime = (createAppSdkRuntimeConfig().accessToken || '').trim();
  if (fromRuntime) {
    return fromRuntime;
  }

  getAppSdkClient();
  return (getAppSdkClientConfig()?.accessToken || '').trim();
}

export function resetAppSdkClient(): void {
  appSdkConfig = null;
  resetAppSdkCoreClient();
}

export function applyAppSdkSessionTokens(tokens: {
  authToken?: string;
  accessToken?: string;
}): void {
  applyAppSdkCoreSessionTokens(tokens);
}

export function readAppSdkSessionTokens(): AppSdkSessionTokens {
  const authToken = normalizeAuthToken(readStorage(APP_SDK_AUTH_TOKEN_STORAGE_KEY));
  const accessToken = (
    getAppSdkClientConfig()?.accessToken ||
    createAppSdkRuntimeConfig().accessToken ||
    ''
  ).trim();
  const refreshToken = (readStorage(APP_SDK_REFRESH_TOKEN_STORAGE_KEY) || '').trim();

  return {
    authToken: authToken || undefined,
    accessToken: accessToken || undefined,
    refreshToken: refreshToken || undefined,
  };
}

export function persistAppSdkSessionTokens(tokens: AppSdkSessionTokens): void {
  const authToken = normalizeAuthToken(tokens.authToken);
  const accessToken = (
    tokens.accessToken !== undefined
      ? (tokens.accessToken || '').trim()
      : resolveAppSdkAccessToken()
  ).trim();
  const refreshToken = (tokens.refreshToken || '').trim();

  writeStorage(APP_SDK_AUTH_TOKEN_STORAGE_KEY, authToken || undefined);
  writeStorage(APP_SDK_REFRESH_TOKEN_STORAGE_KEY, refreshToken || undefined);

  applyAppSdkSessionTokens({ authToken, accessToken });
}

export function clearAppSdkSessionTokens(): void {
  removeStorage(APP_SDK_AUTH_TOKEN_STORAGE_KEY);
  removeStorage(APP_SDK_ACCESS_TOKEN_STORAGE_KEY);
  removeStorage(APP_SDK_REFRESH_TOKEN_STORAGE_KEY);

  applyAppSdkSessionTokens({
    authToken: '',
    accessToken: resolveAppSdkAccessToken(),
  });
  resetAppSdkClient();
}

export function getAppSdkClientWithSession(overrides: Partial<SdkworkAppConfig> = {}): SdkworkAppClient {
  const client = Object.keys(overrides).length > 0 ? initAppSdkClient(overrides) : getAppSdkClient();
  const session = readAppSdkSessionTokens();
  applyAppSdkSessionTokens({
    authToken: session.authToken || '',
    accessToken: session.accessToken ?? resolveAppSdkAccessToken(),
  });
  return client;
}

export function useAppSdkClient(overrides: Partial<SdkworkAppConfig> = {}): SdkworkAppClient {
  const key = JSON.stringify(overrides || {});
  return useMemo(() => getAppSdkClientWithSession(overrides), [key]);
}
