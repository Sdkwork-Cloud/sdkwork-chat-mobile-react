import { describe, expect, it } from 'vitest';
import { resolveAppearanceTheme } from './appearanceTokens';

describe('resolveAppearanceTheme', () => {
  it('uses dark mode when appearanceMode is system and system prefers dark', () => {
    const resolved = resolveAppearanceTheme({
      appearanceMode: 'system',
      themePreset: 'wechat',
      accentType: 'preset',
      accentPreset: 'blue',
      accentHex: '#2979FF',
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
      accentPreset: 'orange',
      accentHex: '',
      fontScale: 1,
      fontFamilyPreset: 'system',
      systemPrefersDark: false,
    });

    expect(resolved.cssVariables['--primary-color']).toBe('#F97316');
  });

  it('normalizes custom accent to full uppercase hex', () => {
    const resolved = resolveAppearanceTheme({
      appearanceMode: 'dark',
      themePreset: 'midnight',
      accentType: 'custom',
      accentPreset: 'blue',
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
      accentPreset: 'blue',
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
    expect(resolved.cssVariables['--primary-color']).toBe('#2979FF');
    expect(resolved.cssVariables['--font-family-base']).toContain('SF Pro');
  });
});
