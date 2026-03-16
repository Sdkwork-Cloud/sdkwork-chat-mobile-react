import { describe, expect, it } from 'vitest';

import { isProbablyMojibake, resolveSettingsTranslation } from './resolveSettingsTranslation';

const toMojibake = (value: string) => Buffer.from(value, 'utf8').toString('latin1');

describe('resolveSettingsTranslation', () => {
  it('prefers clean app translations when they are readable', () => {
    const result = resolveSettingsTranslation({
      appT: (key) => (key === 'settings.theme' ? '\u4e3b\u9898\u8bbe\u7f6e' : key),
      settingsT: () => '\u5916\u89c2',
      key: 'settings.theme',
      fallback: 'Theme',
    });

    expect(result).toBe('\u4e3b\u9898\u8bbe\u7f6e');
  });

  it('falls back to settings translations when app translations are mojibake', () => {
    const result = resolveSettingsTranslation({
      appT: (key) => (key === 'settings.language_zh' ? toMojibake('\u7b80\u4f53\u4e2d\u6587') : key),
      settingsT: (key) => (key === 'settings.language_zh' ? '\u7b80\u4f53\u4e2d\u6587' : key),
      key: 'settings.language_zh',
      fallback: 'Simplified Chinese',
    });

    expect(isProbablyMojibake(toMojibake('\u53cd\u9988'))).toBe(true);
    expect(result).toBe('\u7b80\u4f53\u4e2d\u6587');
  });

  it('does not flag readable Chinese or English copy as mojibake', () => {
    expect(isProbablyMojibake('Theme Colors')).toBe(false);
    expect(isProbablyMojibake('\u4e3b\u9898\u8272\u5f69')).toBe(false);
    expect(isProbablyMojibake('Delete this chat?')).toBe(false);
  });

  it('falls back to literal text when neither translator resolves the key', () => {
    const result = resolveSettingsTranslation({
      appT: (key) => key,
      settingsT: (key) => key,
      key: 'feedback.empty_history',
      fallback: 'No feedback submitted yet',
    });

    expect(result).toBe('No feedback submitted yet');
  });
});
