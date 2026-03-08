import { APP_SDK_AUTH_TOKEN_STORAGE_KEY, createAppSdkCoreConfig, getAppSdkCoreClientWithSession, resolveServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { ServiceFactoryDeps, ServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { SdkworkAppClient } from '@sdkwork/app-sdk';
import type { AppConfig } from '../types';

const TAG = 'SettingsSdkService';

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

  private async getClient(): Promise<SdkworkAppClient> {
    return getAppSdkCoreClientWithSession({
      storage: this.deps.storage,
      authStorageKey: APP_SDK_AUTH_TOKEN_STORAGE_KEY,
    });
  }

  hasSdkBaseUrl(): boolean {
    const baseUrl = (createAppSdkCoreConfig().baseUrl || '').trim();
    if (!baseUrl) return false;
    const authToken = this.readAuthToken();
    return authToken.length > 0;
  }

  private readAuthToken(): string {
    try {
      const raw = this.deps.storage.get<string | null | undefined>(APP_SDK_AUTH_TOKEN_STORAGE_KEY);
      if (typeof raw !== 'string') return '';
      const normalized = raw.trim();
      if (!normalized) return '';
      return normalized.toLowerCase().startsWith('bearer ')
        ? normalized.slice(7).trim()
        : normalized;
    } catch {
      // Platform runtime may be unavailable in tests or early bootstrap.
      return '';
    }
  }

  private isSuccessCode(code: string | undefined): boolean {
    return code === '2000';
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
    if (typeof source.fontSize === 'number') {
      patch.fontSize = source.fontSize;
    } else if (typeof source.fontSize === 'string') {
      const parsed = Number(source.fontSize);
      if (Number.isFinite(parsed)) {
        patch.fontSize = parsed;
      }
    }

    return Object.keys(patch).length ? patch : null;
  }

  private buildUiUpdateForm(body: AppConfig): {
    theme: string;
    language: string;
    fontSize: string;
    notificationsEnabled: boolean;
  } {
    return {
      theme: body.theme,
      language: body.language,
      fontSize: String(body.fontSize),
      notificationsEnabled: body.notificationsEnabled,
    };
  }

  async pullConfig(): Promise<Partial<AppConfig> | null> {
    if (!this.hasSdkBaseUrl()) return null;

    try {
      const client = await this.getClient();

      const uiResult = await client.settings.getUi() as SdkApiResult<unknown>;
      if (this.isSuccessCode(uiResult.code)) {
        const mapped = this.mapRemoteConfig(uiResult.data);
        if (mapped) return mapped;
      }
      this.deps.logger.warn(TAG, 'SDK pull ui config business failure', { code: uiResult.code, message: uiResult.msg });
      return null;
    } catch (error) {
      this.deps.logger.warn(TAG, 'SDK pull config request failed', { error });
      return null;
    }
  }

  async pushConfig(nextConfig: AppConfig, partial: Partial<AppConfig>): Promise<Partial<AppConfig> | null> {
    if (!this.hasSdkBaseUrl()) return null;

    const body = {
      ...nextConfig,
      ...partial,
    };

    try {
      const client = await this.getClient();

      const uiBody = this.buildUiUpdateForm(body);
      const uiResult = await client.settings.updateUi(uiBody) as SdkApiResult<unknown>;
      if (this.isSuccessCode(uiResult.code)) {
        const latestUi = await client.settings.getUi() as SdkApiResult<unknown>;
        if (this.isSuccessCode(latestUi.code)) {
          return this.mapRemoteConfig(latestUi.data);
        }
        return this.mapRemoteConfig(body);
      }
      this.deps.logger.warn(TAG, 'SDK push ui config business failure', { code: uiResult.code, message: uiResult.msg });
      return null;
    } catch (error) {
      this.deps.logger.warn(TAG, 'SDK push config request failed', { error });
      return null;
    }
  }
}

export function createSettingsSdkService(_deps?: ServiceFactoryDeps): ISettingsSdkService {
  return new SettingsSdkServiceImpl(_deps);
}

export const settingsSdkService: ISettingsSdkService = createSettingsSdkService();
