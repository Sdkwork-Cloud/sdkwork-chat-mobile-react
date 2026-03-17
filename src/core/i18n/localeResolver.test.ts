import { describe, expect, it } from 'vitest';
import { DEFAULT_LOCALE, type Locale } from './config';
import { normalizeLocale, resolveInitialLocale } from './localeResolver';

describe('localeResolver', () => {
  it('normalizes supported locales and aliases', () => {
    expect(normalizeLocale('en-US')).toBe('en-US');
    expect(normalizeLocale('en')).toBe('en-US');
    expect(normalizeLocale('zh')).toBe('zh-CN');
    expect(normalizeLocale('zh-Hans-CN')).toBe('zh-CN');
  });

  it('falls back to the default locale for unsupported values', () => {
    expect(normalizeLocale('ja-JP')).toBe(DEFAULT_LOCALE);
    expect(normalizeLocale('')).toBe(DEFAULT_LOCALE);
    expect(normalizeLocale(undefined)).toBe(DEFAULT_LOCALE);
  });

  it('prefers explicit request locale over persisted and navigator locales', () => {
    const locale = resolveInitialLocale({
      search: '?lang=en-US',
      persistedLocale: 'zh-CN',
      navigatorLanguages: ['zh-CN'],
    });

    expect(locale).toBe('en-US');
  });

  it('prefers persisted locale when request locale is absent', () => {
    const locale = resolveInitialLocale({
      search: '',
      persistedLocale: 'en-US',
      navigatorLanguages: ['zh-CN'],
    });

    expect(locale).toBe('en-US');
  });

  it('falls back to navigator locale and then the default locale', () => {
    const navigatorLocale = resolveInitialLocale({
      search: '',
      persistedLocale: null,
      navigatorLanguages: ['en-GB'],
    });
    const defaultLocale = resolveInitialLocale({
      search: '',
      persistedLocale: null,
      navigatorLanguages: ['fr-FR'],
    });

    expect(navigatorLocale).toBe('en-US');
    expect(defaultLocale).toBe(DEFAULT_LOCALE);
  });

  it('returns a supported locale type', () => {
    const locale: Locale = resolveInitialLocale({
      search: '',
      persistedLocale: null,
      navigatorLanguages: ['zh-CN'],
    });

    expect(locale).toBe('zh-CN');
  });
});
