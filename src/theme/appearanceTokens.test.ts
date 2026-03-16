import { describe, expect, it } from 'vitest';
import { resolveAppearanceTheme } from './appearanceTokens';

describe('resolveAppearanceTheme', () => {
  it('uses dark mode when appearanceMode is system and system prefers dark', () => {
    const resolved = resolveAppearanceTheme({
      appearanceMode: 'system',
      themePreset: 'wechat',
      accentType: 'preset',
      accentPreset: 'lobster',
      accentHex: '#E5484D',
      fontScale: 1,
      fontFamilyPreset: 'system',
      systemPrefersDark: true,
    });

    expect(resolved.mode).toBe('dark');
    expect(resolved.legacyTheme).toBe('wechat-dark');
  });

  it('uses preset accent for primary color when accentType is preset', () => {
    const resolved = resolveAppearanceTheme({
      appearanceMode: 'light',
      themePreset: 'classic',
      accentType: 'preset',
      accentPreset: 'tech-blue',
      accentHex: '',
      fontScale: 1,
      fontFamilyPreset: 'system',
      systemPrefersDark: false,
    });

    expect(resolved.cssVariables['--primary-color']).toBe('#2F6BFF');
  });

  it('uses curated preset gradients for named theme colors', () => {
    const resolved = resolveAppearanceTheme({
      appearanceMode: 'light',
      themePreset: 'wechat',
      accentType: 'preset',
      accentPreset: 'lobster',
      accentHex: '',
      fontScale: 1,
      fontFamilyPreset: 'system',
      systemPrefersDark: false,
    });

    expect(resolved.cssVariables['--primary-gradient']).toBe(
      'linear-gradient(135deg, #FF8E95 0%, #D83A45 100%)'
    );
    expect(resolved.cssVariables['--tab-active-color']).toBe('#D83A45');
  });

  it('normalizes custom accent to full uppercase hex', () => {
    const resolved = resolveAppearanceTheme({
      appearanceMode: 'dark',
      themePreset: 'midnight',
      accentType: 'custom',
      accentPreset: 'lobster',
      accentHex: '#0fa',
      fontScale: 1,
      fontFamilyPreset: 'system',
      systemPrefersDark: false,
    });

    expect(resolved.cssVariables['--primary-color']).toBe('#00FFAA');
  });

  it('emits typography tokens based on font preset', () => {
    const resolved = resolveAppearanceTheme({
      appearanceMode: 'light',
      themePreset: 'classic',
      accentType: 'preset',
      accentPreset: 'lobster',
      accentHex: '',
      fontScale: 1,
      systemPrefersDark: false,
      fontFamilyPreset: 'serif',
    });

    expect(resolved.cssVariables['--font-family-base']).toContain('serif');
    expect(resolved.cssVariables['--font-family-display']).toContain('serif');
  });

  it('falls back to safe defaults when receiving invalid appearance payload', () => {
    const resolved = resolveAppearanceTheme({
      appearanceMode: 'invalid-mode',
      themePreset: 'invalid-preset',
      accentType: 'invalid-accent-type',
      accentPreset: 'invalid-accent',
      accentHex: '#GGGGGG',
      fontScale: 1,
      fontFamilyPreset: 'invalid-font',
      systemPrefersDark: false,
    } as never);

    expect(resolved.mode).toBe('light');
    expect(resolved.legacyTheme).toBe('light');
    expect(resolved.cssVariables['--primary-color']).toBe('#E5484D');
    expect(resolved.cssVariables['--font-family-base']).toContain('SF Pro');
  });
});
