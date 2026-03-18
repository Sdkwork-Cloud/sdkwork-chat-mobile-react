import { useCallback } from 'react';
import enUS from './locales/en-US';
import zhCN from './locales/zh-CN';
import type { AgentsTranslationKeys } from './types';

type Locale = 'zh-CN' | 'en-US';
type ExternalTranslator = (key: string, params?: Record<string, string | number>) => string;

const DEFAULT_LOCALE: Locale = 'zh-CN';
const resources: Record<Locale, Record<string, string>> = {
  'zh-CN': zhCN,
  'en-US': enUS,
};

let currentLocale: Locale = DEFAULT_LOCALE;

const normalizeLocale = (locale?: string): Locale => (locale === 'en-US' ? 'en-US' : 'zh-CN');

const interpolate = (message: string, params?: Record<string, string | number>) => {
  if (!params) {
    return message;
  }

  return Object.entries(params).reduce((output, [paramKey, value]) => {
    const nextValue = String(value);
    return output
      .replace(new RegExp(`{{${paramKey}}}`, 'g'), nextValue)
      .replace(new RegExp(`\\{${paramKey}\\}`, 'g'), nextValue);
  }, message);
};

const getLocalTranslation = (locale: Locale, key: AgentsTranslationKeys): string => {
  return resources[locale][key] || resources[DEFAULT_LOCALE][key] || key;
};

export function setLocale(locale: string): void {
  currentLocale = normalizeLocale(locale);
}

export function getLocale(): Locale {
  return currentLocale;
}

export function t(key: AgentsTranslationKeys, params?: Record<string, string | number>): string {
  return interpolate(getLocalTranslation(currentLocale, key), params);
}

export function useAgentsI18n(externalT?: ExternalTranslator, locale?: string) {
  const activeLocale = normalizeLocale(locale || currentLocale);

  const translate = useCallback(
    (key: AgentsTranslationKeys, params?: Record<string, string | number>) => {
      if (externalT) {
        const externalValue = externalT(key, params);
        if (externalValue && externalValue !== key) {
          return externalValue;
        }
      }
      return interpolate(getLocalTranslation(activeLocale, key), params);
    },
    [activeLocale, externalT],
  );

  return {
    t: translate,
    locale: activeLocale,
    setLocale,
  };
}

export type { AgentsTranslationKeys } from './types';
