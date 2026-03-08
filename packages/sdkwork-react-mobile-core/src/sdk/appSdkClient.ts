import { createClient, type SdkworkAppClient, type SdkworkAppConfig } from '@sdkwork/app-sdk';
import type { ServiceStorageAdapter } from '../types';

const DEFAULT_TIMEOUT = 30000;
const DEFAULT_AUTH_STORAGE_KEY = 'sdkwork_token';
const DEFAULT_DEV_BASE_URL = 'https://api-dev.sdkwork.com';
const DEFAULT_PROD_BASE_URL = 'https://api.sdkwork.com';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export type AppRuntimeEnv = 'development' | 'staging' | 'production' | 'test';

export const APP_SDK_AUTH_TOKEN_STORAGE_KEY = DEFAULT_AUTH_STORAGE_KEY;

export interface AppSdkCoreSessionOptions {
  storage?: ServiceStorageAdapter;
  authStorageKey?: string;
  authToken?: string;
  accessToken?: string;
  configOverrides?: Partial<SdkworkAppConfig>;
}

export interface AppSdkCoreRequestOptions extends AppSdkCoreSessionOptions {
  method?: HttpMethod;
  params?: Record<string, unknown>;
  body?: unknown;
}

export interface AppSdkCoreRuntimeConfig {
  env: AppRuntimeEnv;
  apiBaseUrl: string;
  imBaseUrl: string;
  timeout: number;
  apiKey?: string;
  accessToken?: string;
  tenantId?: string;
  organizationId?: string;
  platform?: string;
}

let appSdkClient: SdkworkAppClient | null = null;
let appSdkConfig: SdkworkAppConfig | null = null;

function readRuntimeEnv(name: string): string | undefined {
  const importMetaEnv = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
  if (importMetaEnv && name in importMetaEnv) {
    return importMetaEnv[name];
  }
  const processEnv = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;
  return processEnv?.[name];
}

function firstDefined(...values: Array<string | undefined>): string | undefined {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }
  return undefined;
}

function resolveRuntimeEnv(value?: string): AppRuntimeEnv {
  const normalized = (value || '').trim().toLowerCase();
  if (normalized === 'production' || normalized === 'prod') {
    return 'production';
  }
  if (normalized === 'staging' || normalized === 'stage') {
    return 'staging';
  }
  if (normalized === 'test') {
    return 'test';
  }
  return 'development';
}

function resolveDefaultBaseUrl(env: AppRuntimeEnv): string {
  return env === 'production' ? DEFAULT_PROD_BASE_URL : DEFAULT_DEV_BASE_URL;
}

function normalizeBaseUrl(baseUrl?: string, env?: AppRuntimeEnv): string {
  const safe = (baseUrl || resolveDefaultBaseUrl(env || resolveRuntimeEnv())).trim();
  return safe.replace(/\/+$/g, '');
}

function parseTimeout(value?: string, fallback: number = DEFAULT_TIMEOUT): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
}

function normalizeBody(body: unknown): unknown {
  if (typeof body !== 'string') {
    return body;
  }
  const raw = body.trim();
  if (!raw) {
    return undefined;
  }
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return body;
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

async function readStorageToken(
  storage: ServiceStorageAdapter | undefined,
  key: string,
): Promise<string> {
  if (!storage || !key) {
    return '';
  }
  try {
    const value = await Promise.resolve(storage.get<string>(key));
    return (value || '').trim();
  } catch {
    return '';
  }
}

export function createAppSdkCoreConfig(
  overrides: Partial<SdkworkAppConfig> = {},
): SdkworkAppConfig {
  const runtimeConfig = createAppSdkCoreRuntimeConfig({
    apiBaseUrl: overrides.baseUrl,
    timeout: overrides.timeout,
    apiKey: overrides.apiKey,
    accessToken: overrides.accessToken,
    tenantId: overrides.tenantId,
    organizationId: overrides.organizationId,
    platform: overrides.platform,
  });

  return {
    baseUrl: runtimeConfig.apiBaseUrl,
    timeout: runtimeConfig.timeout,
    apiKey: runtimeConfig.apiKey,
    authToken: overrides.authToken,
    accessToken: runtimeConfig.accessToken,
    tenantId: runtimeConfig.tenantId,
    organizationId: runtimeConfig.organizationId,
    platform: runtimeConfig.platform,
    tokenManager: overrides.tokenManager,
    authMode: overrides.authMode,
    headers: overrides.headers,
  };
}

export function createAppSdkCoreRuntimeConfig(
  overrides: Partial<AppSdkCoreRuntimeConfig> = {},
): AppSdkCoreRuntimeConfig {
  const env = overrides.env ?? resolveRuntimeEnv(
    firstDefined(
      readRuntimeEnv('VITE_APP_ENV'),
      readRuntimeEnv('MODE'),
      readRuntimeEnv('NODE_ENV'),
    ),
  );

  const apiBaseUrl = normalizeBaseUrl(
    firstDefined(
      overrides.apiBaseUrl,
      readRuntimeEnv('VITE_API_BASE_URL'),
      readRuntimeEnv('VITE_APP_API_BASE_URL'),
      readRuntimeEnv('SDKWORK_API_BASE_URL'),
      readRuntimeEnv('VITE_APP_BASE_URL'),
      resolveDefaultBaseUrl(env),
    ),
    env,
  );

  const imBaseUrl = normalizeBaseUrl(
    firstDefined(
      overrides.imBaseUrl,
      readRuntimeEnv('VITE_IM_API_BASE_URL'),
      readRuntimeEnv('VITE_APP_IM_API_BASE_URL'),
      readRuntimeEnv('SDKWORK_IM_API_BASE_URL'),
      apiBaseUrl,
    ),
    env,
  );

  return {
    env,
    apiBaseUrl,
    imBaseUrl,
    timeout:
      overrides.timeout ??
      parseTimeout(firstDefined(readRuntimeEnv('VITE_TIMEOUT'), readRuntimeEnv('SDKWORK_TIMEOUT'))),
    apiKey: overrides.apiKey ?? firstDefined(readRuntimeEnv('VITE_API_KEY'), readRuntimeEnv('SDKWORK_API_KEY')),
    accessToken:
      overrides.accessToken ?? firstDefined(readRuntimeEnv('VITE_ACCESS_TOKEN'), readRuntimeEnv('SDKWORK_ACCESS_TOKEN')),
    tenantId:
      overrides.tenantId ?? firstDefined(readRuntimeEnv('VITE_TENANT_ID'), readRuntimeEnv('SDKWORK_TENANT_ID')),
    organizationId:
      overrides.organizationId ??
      firstDefined(readRuntimeEnv('VITE_ORGANIZATION_ID'), readRuntimeEnv('SDKWORK_ORGANIZATION_ID')),
    platform:
      overrides.platform ??
      firstDefined(readRuntimeEnv('VITE_PLATFORM'), readRuntimeEnv('SDKWORK_PLATFORM')) ??
      'mobile',
  };
}

export function initAppSdkCoreClient(
  overrides: Partial<SdkworkAppConfig> = {},
): SdkworkAppClient {
  appSdkConfig = createAppSdkCoreConfig(overrides);
  appSdkClient = createClient(appSdkConfig);
  return appSdkClient;
}

export function getAppSdkCoreClient(): SdkworkAppClient {
  if (!appSdkClient) {
    return initAppSdkCoreClient();
  }
  return appSdkClient;
}

export function getAppSdkCoreConfig(): SdkworkAppConfig | null {
  return appSdkConfig;
}

export function resetAppSdkCoreClient(): void {
  appSdkClient = null;
  appSdkConfig = null;
}

export function applyAppSdkCoreSessionTokens(tokens: {
  authToken?: string;
  accessToken?: string;
}): void {
  const client = getAppSdkCoreClient();
  client.setAuthToken(normalizeAuthToken(tokens.authToken));
  if (tokens.accessToken !== undefined) {
    client.setAccessToken((tokens.accessToken || '').trim());
  }
}

async function resolveCoreSessionTokens(
  options: AppSdkCoreSessionOptions = {},
): Promise<{ authToken: string; accessToken: string }> {
  const configuredAuthStorageKey = (options.authStorageKey || DEFAULT_AUTH_STORAGE_KEY).trim();
  const storageToken = await readStorageToken(options.storage, configuredAuthStorageKey);
  const authToken = normalizeAuthToken(options.authToken || storageToken || '');
  const accessToken = (
    options.accessToken ||
    firstDefined(readRuntimeEnv('VITE_ACCESS_TOKEN'), readRuntimeEnv('SDKWORK_ACCESS_TOKEN')) ||
    ''
  ).trim();
  return { authToken, accessToken };
}

export async function getAppSdkCoreClientWithSession(
  options: AppSdkCoreSessionOptions = {},
): Promise<SdkworkAppClient> {
  const client = options.configOverrides
    ? initAppSdkCoreClient(options.configOverrides)
    : getAppSdkCoreClient();
  const tokens = await resolveCoreSessionTokens(options);
  applyAppSdkCoreSessionTokens(tokens);
  return client;
}

export async function appSdkCoreRequest<T>(
  path: string,
  options: AppSdkCoreRequestOptions = {},
): Promise<T> {
  void normalizeBody(options.body);
  throw new Error(
    `[SDK compliance] appSdkCoreRequest is disabled for backend calls: ${options.method || 'GET'} ${path}. ` +
      'Use generated SDK domain methods (client.<domain>.<method>) and add missing APIs via /upgrade.',
  );
}
