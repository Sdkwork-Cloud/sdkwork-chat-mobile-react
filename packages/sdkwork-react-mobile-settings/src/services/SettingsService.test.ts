import { describe, expect, it } from 'vitest';
import { settingsService } from './SettingsService';

describe('SettingsService', () => {
  it('resets appearance fields to defaults but keeps non-appearance fields', async () => {
    await settingsService.updateConfig({
      appearanceMode: 'dark',
      themePreset: 'midnight',
      accentType: 'custom',
      accentPreset: 'rose',
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
    expect(config?.accentPreset).toBe('blue');
    expect(config?.accentHex).toBe('#2979FF');
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
    expect(config?.accentPreset).toBe('blue');
    expect(config?.accentHex).toBe('#2979FF');
    expect(config?.fontFamilyPreset).toBe('system');
    expect(config?.language).toBe('zh-CN');
  });

  it('uses preset accent color when accentType is preset', async () => {
    await settingsService.updateConfig({
      accentType: 'preset',
      accentPreset: 'orange',
      accentHex: '#00FF00',
    });

    const config = await settingsService.getConfig();
    expect(config).not.toBeNull();
    expect(config?.accentType).toBe('preset');
    expect(config?.accentPreset).toBe('orange');
    expect(config?.accentHex).toBe('#F97316');
  });
});
