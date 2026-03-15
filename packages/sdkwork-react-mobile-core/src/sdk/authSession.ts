import type { ServiceStorageAdapter } from '../types';

export const APP_SDK_AUTH_TOKEN_STORAGE_KEY = 'sdkwork_token';
export const APP_SDK_ACCESS_TOKEN_STORAGE_KEY = 'sdkwork_access_token';
export const APP_SDK_REFRESH_TOKEN_STORAGE_KEY = 'sdkwork_refresh_token';

export interface AppSdkStoredSessionTokens {
  authToken?: string;
  accessToken?: string;
  refreshToken?: string;
}

export interface AppSdkSessionStorageOptions {
  storage?: ServiceStorageAdapter;
  authTokenStorageKey?: string;
  accessTokenStorageKey?: string;
  refreshTokenStorageKey?: string;
}

type SessionTokenApplier = (tokens: {
  authToken?: string;
  accessToken?: string;
}) => void;

const GLOBAL_APPLIER_KEY = '__sdkworkApplySessionTokens__';

function getGlobalApplierHost(): {
  __sdkworkApplySessionTokens__?: SessionTokenApplier | null;
} {
  return globalThis as {
    __sdkworkApplySessionTokens__?: SessionTokenApplier | null;
  };
}

export function configureAppSdkSessionTokenApplier(applier: SessionTokenApplier): void {
  getGlobalApplierHost()[GLOBAL_APPLIER_KEY] = applier;
}

export function normalizeAppSdkAuthToken(value?: string): string {
  const normalized = (value || '').trim();
  if (!normalized) {
    return '';
  }
  if (normalized.toLowerCase().startsWith('bearer ')) {
    return normalized.slice(7).trim();
  }
  return normalized;
}

function resolveStorageKeys(options: AppSdkSessionStorageOptions = {}) {
  return {
    authTokenStorageKey: (options.authTokenStorageKey || APP_SDK_AUTH_TOKEN_STORAGE_KEY).trim(),
    accessTokenStorageKey: (options.accessTokenStorageKey || APP_SDK_ACCESS_TOKEN_STORAGE_KEY).trim(),
    refreshTokenStorageKey: (options.refreshTokenStorageKey || APP_SDK_REFRESH_TOKEN_STORAGE_KEY).trim(),
  };
}

async function readStorageValue(
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

async function writeStorageValue(
  storage: ServiceStorageAdapter | undefined,
  key: string,
  value: string,
): Promise<void> {
  if (!storage || !key) {
    return;
  }

  if (!value) {
    try {
      await Promise.resolve(storage.remove(key));
    } catch {
      // ignore storage errors
    }
    return;
  }

  try {
    await Promise.resolve(storage.set(key, value));
  } catch {
    // ignore storage errors
  }
}

export async function readStoredAppSdkSessionTokens(
  options: AppSdkSessionStorageOptions = {},
): Promise<Required<AppSdkStoredSessionTokens>> {
  const keys = resolveStorageKeys(options);

  const authToken = normalizeAppSdkAuthToken(
    await readStorageValue(options.storage, keys.authTokenStorageKey),
  );
  const accessToken = (await readStorageValue(options.storage, keys.accessTokenStorageKey)).trim();
  const refreshToken = (await readStorageValue(options.storage, keys.refreshTokenStorageKey)).trim();

  return {
    authToken,
    accessToken,
    refreshToken,
  };
}

export async function persistAppSdkSessionTokens(
  tokens: AppSdkStoredSessionTokens,
  options: AppSdkSessionStorageOptions = {},
): Promise<Required<AppSdkStoredSessionTokens>> {
  const keys = resolveStorageKeys(options);
  const normalized = {
    authToken: normalizeAppSdkAuthToken(tokens.authToken),
    accessToken: (tokens.accessToken || '').trim(),
    refreshToken: (tokens.refreshToken || '').trim(),
  };

  await writeStorageValue(options.storage, keys.authTokenStorageKey, normalized.authToken);
  await writeStorageValue(options.storage, keys.accessTokenStorageKey, normalized.accessToken);
  await writeStorageValue(options.storage, keys.refreshTokenStorageKey, normalized.refreshToken);

  return normalized;
}

export async function clearStoredAppSdkSessionTokens(
  options: AppSdkSessionStorageOptions = {},
): Promise<void> {
  await persistAppSdkSessionTokens(
    {
      authToken: '',
      accessToken: '',
      refreshToken: '',
    },
    options,
  );
}

export function applyStoredAppSdkSessionTokens(tokens: AppSdkStoredSessionTokens): void {
  getGlobalApplierHost()[GLOBAL_APPLIER_KEY]?.({
    authToken: normalizeAppSdkAuthToken(tokens.authToken),
    accessToken: (tokens.accessToken || '').trim(),
  });
}
