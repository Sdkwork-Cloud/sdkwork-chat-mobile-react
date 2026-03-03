import { AbstractStorageService, resolveServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { ServiceFactoryDeps, ServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type {
  AccentPreset,
  AppConfig,
  AppearanceMode,
  AIConfig,
  FontFamilyPreset,
  ISettingsService,
  ModelConfigItem,
  ThemePreset,
  ThemeType,
} from '../types';
import { createSettingsSdkService } from './SettingsSdkService';
import type { ISettingsSdkService } from './SettingsSdkService';

const TAG = 'SettingsService';
const SETTINGS_EVENTS = {
  CONFIG_UPDATED: 'settings:config_updated',
  THEME_CHANGED: 'settings:theme_changed',
  LANGUAGE_CHANGED: 'settings:language_changed',
} as const;

const CONFIG_ID = 'sys_global_config';
const CONFIG_SCHEMA_VERSION = 2;

const DEFAULT_ACCENT_PRESET: AccentPreset = 'blue';
const DEFAULT_ACCENT_HEX_MAP: Record<AccentPreset, string> = {
  blue: '#2979FF',
  teal: '#14B8A6',
  green: '#22C55E',
  orange: '#F97316',
  rose: '#F43F5E',
  violet: '#8B5CF6',
};
const DEFAULT_APPEARANCE_CONFIG = {
  appearanceMode: 'system' as AppearanceMode,
  themePreset: 'wechat' as ThemePreset,
  accentType: 'preset' as const,
  accentPreset: DEFAULT_ACCENT_PRESET,
  accentHex: DEFAULT_ACCENT_HEX_MAP[DEFAULT_ACCENT_PRESET],
  fontScale: 1,
  fontFamilyPreset: 'system' as FontFamilyPreset,
};
const APPEARANCE_MODE_SET: Set<AppearanceMode> = new Set(['system', 'light', 'dark']);
const THEME_PRESET_SET: Set<ThemePreset> = new Set(['wechat', 'classic', 'midnight', 'oled']);
const ACCENT_TYPE_SET: Set<'preset' | 'custom'> = new Set(['preset', 'custom']);
const ACCENT_PRESET_SET: Set<AccentPreset> = new Set(['blue', 'teal', 'green', 'orange', 'rose', 'violet']);
const FONT_FAMILY_PRESET_SET: Set<FontFamilyPreset> = new Set(['system', 'rounded', 'serif', 'mono']);
const LANGUAGE_SET: Set<AppConfig['language']> = new Set(['zh-CN', 'en-US']);

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));
const normalizeAppearanceMode = (value: unknown, fallback: AppearanceMode): AppearanceMode =>
  APPEARANCE_MODE_SET.has(value as AppearanceMode) ? (value as AppearanceMode) : fallback;
const normalizeThemePreset = (value: unknown, fallback: ThemePreset): ThemePreset =>
  THEME_PRESET_SET.has(value as ThemePreset) ? (value as ThemePreset) : fallback;
const normalizeAccentType = (value: unknown): 'preset' | 'custom' =>
  ACCENT_TYPE_SET.has(value as 'preset' | 'custom')
    ? (value as 'preset' | 'custom')
    : DEFAULT_APPEARANCE_CONFIG.accentType;
const normalizeAccentPreset = (value: unknown): AccentPreset =>
  ACCENT_PRESET_SET.has(value as AccentPreset) ? (value as AccentPreset) : DEFAULT_ACCENT_PRESET;
const normalizeFontFamilyPreset = (value: unknown): FontFamilyPreset =>
  FONT_FAMILY_PRESET_SET.has(value as FontFamilyPreset)
    ? (value as FontFamilyPreset)
    : DEFAULT_APPEARANCE_CONFIG.fontFamilyPreset;
const normalizeLanguage = (value: unknown): AppConfig['language'] =>
  LANGUAGE_SET.has(value as AppConfig['language']) ? (value as AppConfig['language']) : 'zh-CN';

const normalizeHex = (value: string | undefined): string => {
  if (!value) return '';
  let normalized = value.trim().replace(/^#/, '');
  if (/^[0-9a-fA-F]{3}$/.test(normalized)) {
    normalized = normalized
      .split('')
      .map((char) => `${char}${char}`)
      .join('');
  }
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    return '';
  }
  return `#${normalized.toUpperCase()}`;
};

const deriveAppearanceFromLegacyTheme = (
  theme?: ThemeType
): { appearanceMode: AppearanceMode; themePreset: ThemePreset } => {
  if (theme === 'light' || theme === 'wechat-light') {
    return { appearanceMode: 'light', themePreset: 'wechat' };
  }
  if (theme === 'wechat-dark') {
    return { appearanceMode: 'dark', themePreset: 'wechat' };
  }
  if (theme === 'dark') {
    return { appearanceMode: 'dark', themePreset: 'classic' };
  }
  if (theme === 'geek' || theme === 'midnight-blue') {
    return { appearanceMode: 'dark', themePreset: 'midnight' };
  }
  return { appearanceMode: 'system', themePreset: 'wechat' };
};

const toLegacyTheme = (appearanceMode: AppearanceMode, themePreset: ThemePreset): ThemeType => {
  if (appearanceMode === 'light') {
    return 'light';
  }
  if (themePreset === 'midnight') {
    return 'midnight-blue';
  }
  if (themePreset === 'wechat') {
    return 'wechat-dark';
  }
  return 'dark';
};

class SettingsServiceImpl extends AbstractStorageService<AppConfig> implements ISettingsService {
  protected STORAGE_KEY = 'sys_app_config_v3';
  private readonly deps: ServiceFactoryRuntimeDeps;
  private readonly sdkService: ISettingsSdkService;
  private readonly remoteSyncIntervalMs = 15_000;
  private remoteSyncAt = 0;

  constructor(deps?: ServiceFactoryDeps) {
    super();
    this.deps = resolveServiceFactoryRuntimeDeps(deps);
    this.sdkService = createSettingsSdkService(deps);
  }

  private createDefaultAIConfig(): AIConfig {
    const defaultAIConfig: ModelConfigItem = {
      enabled: true,
      mode: 'cloud',
      provider: 'gemini',
      modelName: 'default',
      temperature: 0.7,
    };

    return {
      text: { ...defaultAIConfig, provider: 'gemini', modelName: 'gemini-3-flash-preview' },
      image: { ...defaultAIConfig, provider: 'midjourney', modelName: 'v6' },
      video: { ...defaultAIConfig, provider: 'runway', modelName: 'gen-3' },
      speech: { ...defaultAIConfig, provider: 'openai', modelName: 'tts-1' },
      music: { ...defaultAIConfig, provider: 'suno', modelName: 'v3' },
    };
  }

  private createDefaultConfig(now?: number): AppConfig {
    const timestamp = typeof now === 'number' ? now : this.deps.clock.now();
    const { appearanceMode, themePreset, fontScale, accentType, accentPreset, accentHex } = DEFAULT_APPEARANCE_CONFIG;
    return {
      id: CONFIG_ID,
      createTime: timestamp,
      updateTime: timestamp,
      schemaVersion: CONFIG_SCHEMA_VERSION,
      appearanceMode,
      themePreset,
      accentType,
      accentPreset,
      accentHex,
      fontScale,
      fontFamilyPreset: DEFAULT_APPEARANCE_CONFIG.fontFamilyPreset,
      theme: toLegacyTheme(appearanceMode, themePreset),
      notificationsEnabled: true,
      language: 'zh-CN',
      autoPlayVideo: true,
      openAIAssistantEnabled: false,
      chatBackground: '',
      fontSize: Math.round(16 * fontScale),
      aiConfig: this.createDefaultAIConfig(),
    };
  }

  private normalizeConfig(config: AppConfig): AppConfig {
    const legacyAppearance = deriveAppearanceFromLegacyTheme(config.theme);
    const appearanceMode = normalizeAppearanceMode(config.appearanceMode, legacyAppearance.appearanceMode);
    const themePreset = normalizeThemePreset(config.themePreset, legacyAppearance.themePreset);
    const accentType = normalizeAccentType(config.accentType);
    const accentPreset = normalizeAccentPreset(config.accentPreset);
    const accentHex = accentType === 'custom'
      ? (normalizeHex(config.accentHex) || DEFAULT_ACCENT_HEX_MAP[accentPreset])
      : DEFAULT_ACCENT_HEX_MAP[accentPreset];
    const fontScale = clamp(
      typeof config.fontScale === 'number'
        ? config.fontScale
        : (typeof config.fontSize === 'number' ? config.fontSize / 16 : 1),
      0.85,
      1.35
    );

    return {
      ...config,
      schemaVersion: CONFIG_SCHEMA_VERSION,
      appearanceMode,
      themePreset,
      accentType,
      accentPreset,
      accentHex,
      fontScale,
      fontFamilyPreset: normalizeFontFamilyPreset(config.fontFamilyPreset),
      theme: toLegacyTheme(appearanceMode, themePreset),
      fontSize: Math.round(16 * fontScale),
      notificationsEnabled: config.notificationsEnabled ?? true,
      language: normalizeLanguage(config.language),
      autoPlayVideo: config.autoPlayVideo ?? true,
      openAIAssistantEnabled: config.openAIAssistantEnabled ?? false,
      chatBackground: config.chatBackground ?? '',
      aiConfig: config.aiConfig || this.createDefaultAIConfig(),
    };
  }

  private hasConfigChanged(source: AppConfig, next: AppConfig): boolean {
    return JSON.stringify(source) !== JSON.stringify(next);
  }

  protected async onInitialize() {
    const list = this.cache || [];
    if (list.length === 0) {
      this.cache = [this.createDefaultConfig()];
      await this.commit();
      this.deps.logger.info(TAG, 'Default config created');
    }
  }

  async getConfig(): Promise<AppConfig | null> {
    const config = await this.findById(CONFIG_ID);
    if (!config) return null;
    let normalized = this.normalizeConfig(config);

    const now = this.deps.clock.now();
    if (now - this.remoteSyncAt >= this.remoteSyncIntervalMs) {
      const remotePatch = await this.sdkService.pullConfig();
      this.remoteSyncAt = now;
      if (remotePatch) {
        normalized = this.normalizeConfig({
          ...normalized,
          ...remotePatch,
        });
      }
    }

    if (this.hasConfigChanged(config, normalized)) {
      await this.save(normalized, { silent: true });
    }
    return normalized;
  }

  async updateConfig(partial: Partial<AppConfig>): Promise<void> {
    let config = await this.getConfig();
    if (!config) {
      await this.onInitialize();
      config = await this.getConfig();
    }
    if (!config) {
      throw new Error('Config initialization failed');
    }

    const mergedPartial: Partial<AppConfig> = { ...partial };
    if (partial.theme && !partial.appearanceMode && !partial.themePreset) {
      const mapped = deriveAppearanceFromLegacyTheme(partial.theme);
      mergedPartial.appearanceMode = mapped.appearanceMode;
      mergedPartial.themePreset = mapped.themePreset;
    }

    let nextConfig = this.normalizeConfig({
      ...config,
      ...mergedPartial,
      updateTime: this.deps.clock.now(),
    });
    const remotePatch = await this.sdkService.pushConfig(nextConfig, partial);
    if (remotePatch) {
      nextConfig = this.normalizeConfig({
        ...nextConfig,
        ...remotePatch,
        updateTime: this.deps.clock.now(),
      });
      this.remoteSyncAt = this.deps.clock.now();
    }

    const saved = await this.save(nextConfig);

    this.deps.eventBus.emit(SETTINGS_EVENTS.CONFIG_UPDATED, { config: saved });

    if (
      partial.theme ||
      partial.appearanceMode ||
      partial.themePreset ||
      partial.accentType ||
      partial.accentPreset ||
      partial.accentHex ||
      partial.fontFamilyPreset
    ) {
      this.deps.eventBus.emit(SETTINGS_EVENTS.THEME_CHANGED, { theme: saved.theme });
    }
    if (partial.language) {
      this.deps.eventBus.emit(SETTINGS_EVENTS.LANGUAGE_CHANGED, { language: partial.language });
    }

    this.deps.logger.info(TAG, 'Config updated', { keys: Object.keys(partial) });
  }

  async resetAppearanceConfig(): Promise<void> {
    await this.updateConfig({
      appearanceMode: DEFAULT_APPEARANCE_CONFIG.appearanceMode,
      themePreset: DEFAULT_APPEARANCE_CONFIG.themePreset,
      accentType: DEFAULT_APPEARANCE_CONFIG.accentType,
      accentPreset: DEFAULT_APPEARANCE_CONFIG.accentPreset,
      accentHex: DEFAULT_APPEARANCE_CONFIG.accentHex,
      fontScale: DEFAULT_APPEARANCE_CONFIG.fontScale,
      fontSize: Math.round(16 * DEFAULT_APPEARANCE_CONFIG.fontScale),
      fontFamilyPreset: DEFAULT_APPEARANCE_CONFIG.fontFamilyPreset,
      theme: toLegacyTheme(
        DEFAULT_APPEARANCE_CONFIG.appearanceMode,
        DEFAULT_APPEARANCE_CONFIG.themePreset
      ),
    });
  }

  async updateAIConfig(domain: keyof AIConfig, settings: Partial<ModelConfigItem>): Promise<void> {
    let config = await this.getConfig();
    if (!config) {
      await this.onInitialize();
      config = await this.getConfig();
    }
    if (!config) {
      throw new Error('Config initialization failed');
    }

    config.aiConfig[domain] = { ...config.aiConfig[domain], ...settings };
    const saved = await this.save(this.normalizeConfig({ ...config, updateTime: this.deps.clock.now() }));

    this.deps.eventBus.emit(SETTINGS_EVENTS.CONFIG_UPDATED, { config: saved });
    this.deps.logger.info(TAG, 'AI config updated', { domain });
  }

  async estimateStorageUsage(): Promise<number> {
    if (typeof window === 'undefined' || !window.localStorage) return 0;

    try {
      let total = 0;
      for (let i = 0; i < window.localStorage.length; i += 1) {
        const key = window.localStorage.key(i);
        if (!key) continue;
        const raw = window.localStorage.getItem(key) || '';
        total += (key.length + raw.length) * 2;
      }
      return total;
    } catch (error) {
      this.deps.logger.warn(TAG, 'Failed to estimate storage usage', error);
      return 0;
    }
  }
}

export function createSettingsService(_deps?: ServiceFactoryDeps): ISettingsService {
  return new SettingsServiceImpl(_deps);
}

export const settingsService: ISettingsService = createSettingsService();


