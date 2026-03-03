import type { BaseEntity } from '@sdkwork/react-mobile-core';

export type ThemeType = 'light' | 'dark' | 'wechat-light' | 'wechat-dark' | 'geek' | 'midnight-blue';
export type AIProviderMode = 'cloud' | 'local';
export type AppearanceMode = 'system' | 'light' | 'dark';
export type ThemePreset = 'wechat' | 'classic' | 'midnight' | 'oled';
export type AccentType = 'preset' | 'custom';
export type AccentPreset = 'blue' | 'teal' | 'green' | 'orange' | 'rose' | 'violet';
export type FontFamilyPreset = 'system' | 'rounded' | 'serif' | 'mono';
export type FeedbackType = 'bug' | 'suggestion' | 'complaint' | 'other';
export type FeedbackStatus = 'submitted' | 'processing' | 'resolved' | 'closed';

export interface ModelConfigItem {
  enabled: boolean;
  mode: AIProviderMode;
  provider: string;
  modelName: string;
  apiKey?: string;
  endpoint?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AIConfig {
  text: ModelConfigItem;
  image: ModelConfigItem;
  video: ModelConfigItem;
  speech: ModelConfigItem;
  music: ModelConfigItem;
}

export interface AppConfig extends BaseEntity {
  schemaVersion: number;
  appearanceMode: AppearanceMode;
  themePreset: ThemePreset;
  accentType: AccentType;
  accentPreset: AccentPreset;
  accentHex: string;
  fontScale: number;
  fontFamilyPreset: FontFamilyPreset;
  theme: ThemeType;
  notificationsEnabled: boolean;
  language: 'zh-CN' | 'en-US';
  autoPlayVideo: boolean;
  openAIAssistantEnabled: boolean;
  chatBackground: string;
  fontSize: number;
  aiConfig: AIConfig;
}

export interface SettingsState {
  config: AppConfig | null;
  isLoading: boolean;
  error: string | null;
}

export type SettingsEventType =
  | 'settings:config_updated'
  | 'settings:theme_changed'
  | 'settings:language_changed';

export interface SettingsEventPayload {
  'settings:config_updated': { config: AppConfig };
  'settings:theme_changed': { theme: ThemeType };
  'settings:language_changed': { language: string };
}

export interface ISettingsService {
  getConfig(): Promise<AppConfig | null>;
  updateConfig(partial: Partial<AppConfig>): Promise<void>;
  updateAIConfig(domain: keyof AIConfig, settings: Partial<ModelConfigItem>): Promise<void>;
  resetAppearanceConfig(): Promise<void>;
  estimateStorageUsage(): Promise<number>;
}

export interface FeedbackSubmitInput {
  type: FeedbackType;
  content: string;
  contact?: string;
  attachmentUrl?: string;
  screenshotUrl?: string;
}

export interface FeedbackRecord extends BaseEntity {
  type: FeedbackType;
  content: string;
  contact?: string;
  status: FeedbackStatus;
  submitTime: number;
  processTime?: number;
}

export interface IFeedbackService {
  submitFeedback(input: FeedbackSubmitInput): Promise<FeedbackRecord>;
  getFeedbackList(): Promise<FeedbackRecord[]>;
}
