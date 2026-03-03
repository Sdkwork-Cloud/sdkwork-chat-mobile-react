import { resolveServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { ServiceFactoryDeps, ServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { AppConfig } from '../types';

const TAG = 'SettingsSdkService';
const APP_API_PREFIX = '/app/v3/api';
const AUTH_TOKEN_STORAGE_KEY = 'sys_auth_token';

interface SdkApiResult<T> {
  data: T;
  code: string;
  msg: string;
  requestId?: string;
}

export interface ISettingsSdkService {
  hasSdkBaseUrl(): boolean;
  pullConfig(): Promise<Partial<AppConfig> | null>;
  pushConfig(nextConfig: AppConfig, partial: Partial<AppConfig>): Promise<Partial<AppConfig> | null>;
}

class SettingsSdkServiceImpl implements ISettingsSdkService {
  private readonly deps: ServiceFactoryRuntimeDeps;

  constructor(deps?: ServiceFactoryDeps) {
    this.deps = resolveServiceFactoryRuntimeDeps(deps);
  }

  private resolveEnv(name: string): string | undefined {
    const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
    return env?.[name];
  }

  private resolveBaseUrl(): string {
    const value = this.resolveEnv('VITE_API_BASE_URL') || '';
    return value.trim().replace(/\/+$/g, '');
  }

  hasSdkBaseUrl(): boolean {
    return this.resolveBaseUrl().length > 0;
  }

  private buildAppApiPath(path: string): string {
    const normalizedPrefixRaw = APP_API_PREFIX.trim();
    const normalizedPrefix = normalizedPrefixRaw ? `/${normalizedPrefixRaw.replace(/^\/+|\/+$/g, '')}` : '';
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    if (!normalizedPrefix || normalizedPrefix === '/') return normalizedPath;
    if (normalizedPath === normalizedPrefix || normalizedPath.startsWith(`${normalizedPrefix}/`)) return normalizedPath;
    return `${normalizedPrefix}${normalizedPath}`;
  }

  private buildUrl(path: string): string {
    return `${this.resolveBaseUrl()}${this.buildAppApiPath(path)}`;
  }

  private async resolveAuthHeaders(options?: { includeContentType?: boolean }): Promise<Record<string, string>> {
    const headers: Record<string, string> = {};
    if (options?.includeContentType !== false) {
      headers['Content-Type'] = 'application/json';
    }

    const accessTokenEnv = this.resolveEnv('VITE_ACCESS_TOKEN');
    const accessTokenStorage = await Promise.resolve(this.deps.storage.get<string>(AUTH_TOKEN_STORAGE_KEY));
    const accessToken = (accessTokenEnv || accessTokenStorage || '').trim();

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
      return headers;
    }
    return headers;
  }

  private isSuccessCode(code: string | undefined): boolean {
    return code === '2000';
  }

  private async requestJson<T>(path: string, init: RequestInit, options?: { includeContentType?: boolean }): Promise<T> {
    if (typeof fetch !== 'function') {
      throw new Error('Global fetch is not available');
    }

    const headers = await this.resolveAuthHeaders(options);
    const response = await fetch(this.buildUrl(path), {
      ...init,
      headers: {
        ...headers,
        ...(init.headers || {}),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }
    return (await response.json()) as T;
  }

  private mapRemoteConfig(data: unknown): Partial<AppConfig> | null {
    if (!data || typeof data !== 'object') return null;
    const source = (data as { settings?: Record<string, unknown> }).settings || (data as Record<string, unknown>);
    const patch: Partial<AppConfig> = {};

    if (typeof source.appearanceMode === 'string') patch.appearanceMode = source.appearanceMode as AppConfig['appearanceMode'];
    if (typeof source.themePreset === 'string') patch.themePreset = source.themePreset as AppConfig['themePreset'];
    if (typeof source.accentType === 'string') patch.accentType = source.accentType as AppConfig['accentType'];
    if (typeof source.accentPreset === 'string') patch.accentPreset = source.accentPreset as AppConfig['accentPreset'];
    if (typeof source.accentHex === 'string') patch.accentHex = source.accentHex;
    if (typeof source.fontScale === 'number') patch.fontScale = source.fontScale;
    if (typeof source.fontFamilyPreset === 'string') patch.fontFamilyPreset = source.fontFamilyPreset as AppConfig['fontFamilyPreset'];
    if (typeof source.theme === 'string') patch.theme = source.theme as AppConfig['theme'];
    if (typeof source.language === 'string') patch.language = source.language as AppConfig['language'];
    if (typeof source.notificationsEnabled === 'boolean') patch.notificationsEnabled = source.notificationsEnabled;
    if (typeof source.autoPlayVideo === 'boolean') patch.autoPlayVideo = source.autoPlayVideo;
    if (typeof source.openAIAssistantEnabled === 'boolean') patch.openAIAssistantEnabled = source.openAIAssistantEnabled;
    if (typeof source.chatBackground === 'string') patch.chatBackground = source.chatBackground;
    if (typeof source.fontSize === 'number') patch.fontSize = source.fontSize;

    return Object.keys(patch).length ? patch : null;
  }

  async pullConfig(): Promise<Partial<AppConfig> | null> {
    if (!this.hasSdkBaseUrl()) return null;

    const endpoints = ['/settings/ui', '/user/settings'];
    for (const endpoint of endpoints) {
      try {
        const result = await this.requestJson<SdkApiResult<unknown>>(endpoint, { method: 'GET' }, { includeContentType: false });
        if (!this.isSuccessCode(result.code)) {
          this.deps.logger.warn(TAG, 'SDK pull config business failure', { endpoint, code: result.code, message: result.msg });
          continue;
        }
        const mapped = this.mapRemoteConfig(result.data);
        if (mapped) return mapped;
      } catch (error) {
        this.deps.logger.warn(TAG, 'SDK pull config request failed', { endpoint, error });
      }
    }

    return null;
  }

  async pushConfig(nextConfig: AppConfig, partial: Partial<AppConfig>): Promise<Partial<AppConfig> | null> {
    if (!this.hasSdkBaseUrl()) return null;

    const body = {
      ...nextConfig,
      ...partial,
    };
    const endpoints = ['/settings/ui', '/user/settings'];

    for (const endpoint of endpoints) {
      try {
        const result = await this.requestJson<SdkApiResult<unknown>>(endpoint, {
          method: 'PUT',
          body: JSON.stringify(body),
        });
        if (!this.isSuccessCode(result.code)) {
          this.deps.logger.warn(TAG, 'SDK push config business failure', { endpoint, code: result.code, message: result.msg });
          continue;
        }
        return this.mapRemoteConfig(result.data);
      } catch (error) {
        this.deps.logger.warn(TAG, 'SDK push config request failed', { endpoint, error });
      }
    }

    return null;
  }
}

export function createSettingsSdkService(_deps?: ServiceFactoryDeps): ISettingsSdkService {
  return new SettingsSdkServiceImpl(_deps);
}

export const settingsSdkService: ISettingsSdkService = createSettingsSdkService();
