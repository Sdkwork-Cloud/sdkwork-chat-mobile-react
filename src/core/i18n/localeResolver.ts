import { DEFAULT_LOCALE, REQUEST_LOCALE_KEYS, type Locale } from './config';

const LOCALE_ALIASES: Record<string, Locale> = {
  en: 'en-US',
  'en-us': 'en-US',
  'en-gb': 'en-US',
  zh: 'zh-CN',
  'zh-cn': 'zh-CN',
  'zh-hans': 'zh-CN',
  'zh-hans-cn': 'zh-CN',
  'zh-sg': 'zh-CN',
};

export interface ResolveInitialLocaleOptions {
  search?: string;
  persistedLocale?: string | null;
  navigatorLanguage?: string | null;
  navigatorLanguages?: readonly string[];
}

export const normalizeLocale = (value?: string | null): Locale => {
  const normalized = (value || '').trim().toLowerCase();
  if (!normalized) {
    return DEFAULT_LOCALE;
  }

  return LOCALE_ALIASES[normalized] || DEFAULT_LOCALE;
};

const resolveRequestLocale = (search = ''): string | null => {
  const params = new URLSearchParams(search);
  for (const key of REQUEST_LOCALE_KEYS) {
    const value = params.get(key);
    if (value) {
      return value;
    }
  }
  return null;
};

export const readPersistedLocale = (): string | null => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }
    const raw = window.localStorage.getItem('sys_app_config_v3');
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Array<Record<string, unknown>>;
    if (!Array.isArray(parsed)) {
      return null;
    }

    const config = parsed.find((item) => item?.id === 'sys_global_config');
    return typeof config?.language === 'string' ? config.language : null;
  } catch {
    return null;
  }
};

export const resolveInitialLocale = (options: ResolveInitialLocaleOptions = {}): Locale => {
  const requestLocale = resolveRequestLocale(options.search);
  if (requestLocale) {
    return normalizeLocale(requestLocale);
  }

  if (options.persistedLocale) {
    return normalizeLocale(options.persistedLocale);
  }

  for (const value of options.navigatorLanguages || []) {
    const locale = normalizeLocale(value);
    if (locale !== DEFAULT_LOCALE || value.toLowerCase().startsWith('zh')) {
      return locale;
    }
  }

  if (options.navigatorLanguage) {
    return normalizeLocale(options.navigatorLanguage);
  }

  return DEFAULT_LOCALE;
};
