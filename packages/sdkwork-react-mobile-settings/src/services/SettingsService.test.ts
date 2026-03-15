import { beforeEach, describe, expect, it } from 'vitest';
import type { ISettingsService } from '../types';
import { createSettingsService } from './SettingsService';

describe('SettingsService', () => {
  let settingsService: ISettingsService;

  beforeEach(() => {
    settingsService = createSettingsService();
  });

  it('creates lobster as the default theme color preset for a fresh config', async () => {
    const config = await settingsService.getConfig();

    expect(config).not.toBeNull();
    expect(config?.accentType).toBe('preset');
    expect(config?.accentPreset).toBe('lobster');
    expect(config?.accentHex).toBe('#E5484D');
  });

  it('resets appearance fields to defaults but keeps non-appearance fields', async () => {
    await settingsService.updateConfig({
      appearanceMode: 'dark',
      themePreset: 'midnight',
      accentType: 'custom',
      accentPreset: 'violet-signal',
      accentHex: '#FF00AA',
      fontScale: 1.3,
      fontSize: 21,
      fontFamilyPreset: 'mono',
      notificationsEnabled: false,
      language: 'en-US',
      openAIAssistantEnabled: true,
    });

    await settingsService.resetAppearanceConfig();

    const config = await settingsService.getConfig();
    expect(config).not.toBeNull();
    expect(config?.appearanceMode).toBe('system');
    expect(config?.themePreset).toBe('wechat');
    expect(config?.accentType).toBe('preset');
    expect(config?.accentPreset).toBe('lobster');
    expect(config?.accentHex).toBe('#E5484D');
    expect(config?.fontScale).toBe(1);
    expect(config?.fontSize).toBe(16);
    expect(config?.fontFamilyPreset).toBe('system');
    expect(config?.notificationsEnabled).toBe(false);
    expect(config?.language).toBe('en-US');
    expect(config?.openAIAssistantEnabled).toBe(true);
  });

  it('normalizes invalid appearance and language values to safe defaults', async () => {
    await settingsService.updateConfig({
      appearanceMode: 'broken-mode' as never,
      themePreset: 'broken-preset' as never,
      accentType: 'broken-accent-type' as never,
      accentPreset: 'broken-accent' as never,
      accentHex: '#GGGGGG',
      fontFamilyPreset: 'broken-font' as never,
      language: 'ja-JP' as never,
    });

    const config = await settingsService.getConfig();
    expect(config).not.toBeNull();
    expect(config?.appearanceMode).toBe('dark');
    expect(config?.themePreset).toBe('wechat');
    expect(config?.accentType).toBe('preset');
    expect(config?.accentPreset).toBe('lobster');
    expect(config?.accentHex).toBe('#E5484D');
    expect(config?.fontFamilyPreset).toBe('system');
    expect(config?.language).toBe('zh-CN');
  });

  it('uses preset accent color when accentType is preset', async () => {
    await settingsService.updateConfig({
      accentType: 'preset',
      accentPreset: 'green-tech',
      accentHex: '#00FF00',
    });

    const config = await settingsService.getConfig();
    expect(config).not.toBeNull();
    expect(config?.accentType).toBe('preset');
    expect(config?.accentPreset).toBe('green-tech');
    expect(config?.accentHex).toBe('#19B36B');
  });

  it.each([
    ['blue', 'tech-blue', '#2F6BFF'],
    ['teal', 'aurora-teal', '#14B8C4'],
    ['green', 'green-tech', '#19B36B'],
    ['orange', 'sunset-coral', '#F07A5A'],
    ['rose', 'lobster', '#E5484D'],
    ['violet', 'violet-signal', '#7C5CFF'],
  ])('normalizes legacy accent preset %s to %s', async (legacyPreset, expectedPreset, expectedHex) => {
    await settingsService.updateConfig({
      accentType: 'preset',
      accentPreset: legacyPreset as never,
      accentHex: '#000000',
    });

    const config = await settingsService.getConfig();
    expect(config).not.toBeNull();
    expect(config?.accentPreset).toBe(expectedPreset);
    expect(config?.accentHex).toBe(expectedHex);
  });

  it('exposes stable defaults for settings-center toggle fields', async () => {
    const initialConfig = await settingsService.getConfig();
    expect(initialConfig).not.toBeNull();
    expect((initialConfig as any)?.landscapeModeEnabled ?? false).toBe(false);
    expect((initialConfig as any)?.notificationDetailVisible ?? true).toBe(true);
    expect((initialConfig as any)?.notificationSoundEnabled ?? true).toBe(true);
    expect((initialConfig as any)?.notificationVibrationEnabled ?? true).toBe(true);

    await settingsService.updateConfig({
      landscapeModeEnabled: true,
      notificationDetailVisible: false,
      notificationSoundEnabled: false,
      notificationVibrationEnabled: false,
    } as never);

    const updatedConfig = await settingsService.getConfig();
    expect(updatedConfig).not.toBeNull();
    expect((updatedConfig as any)?.landscapeModeEnabled).toBe(true);
    expect((updatedConfig as any)?.notificationDetailVisible).toBe(false);
    expect((updatedConfig as any)?.notificationSoundEnabled).toBe(false);
    expect((updatedConfig as any)?.notificationVibrationEnabled).toBe(false);

    await settingsService.updateConfig({
      landscapeModeEnabled: undefined,
      notificationDetailVisible: undefined,
      notificationSoundEnabled: undefined,
      notificationVibrationEnabled: undefined,
    } as never);

    const normalizedConfig = await settingsService.getConfig();
    expect(normalizedConfig).not.toBeNull();
    expect((normalizedConfig as any)?.landscapeModeEnabled).toBe(false);
    expect((normalizedConfig as any)?.notificationDetailVisible).toBe(true);
    expect((normalizedConfig as any)?.notificationSoundEnabled).toBe(true);
    expect((normalizedConfig as any)?.notificationVibrationEnabled).toBe(true);
  });

  it('provides default sound effect model config and allows updates', async () => {
    const initialConfig = await settingsService.getConfig();
    expect(initialConfig).not.toBeNull();
    expect((initialConfig as any)?.aiConfig?.soundEffect).toEqual({
      enabled: true,
      mode: 'cloud',
      provider: 'elevenlabs',
      modelName: 'sound-effects-v1',
      endpoint: '',
      maxTokens: 2048,
      temperature: 0.7,
    });

    await settingsService.updateAIConfig('soundEffect' as any, {
      provider: 'stability-ai',
      modelName: 'stable-audio-2',
      temperature: 0.5,
    });

    const updatedConfig = await settingsService.getConfig();
    expect(updatedConfig).not.toBeNull();
    expect((updatedConfig as any)?.aiConfig?.soundEffect?.provider).toBe('stability-ai');
    expect((updatedConfig as any)?.aiConfig?.soundEffect?.modelName).toBe('stable-audio-2');
    expect((updatedConfig as any)?.aiConfig?.soundEffect?.temperature).toBe(0.5);
  });
});
