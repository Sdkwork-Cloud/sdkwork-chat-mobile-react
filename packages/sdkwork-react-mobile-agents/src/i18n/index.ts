import { useCallback, useEffect } from 'react';
import type { Locale } from '@/src/core/i18n/config';
import { DEFAULT_LOCALE } from '@/src/core/i18n/config';
import { useTranslation } from '@/src/core/i18n/I18nContext';
import { getTranslationValue } from '@/src/core/i18n/resources';
import type { AgentsTranslationKeys } from './types';

let currentLocale: Locale = DEFAULT_LOCALE;

const interpolate = (message: string, params?: Record<string, string>) => {
  if (!params) {
    return message;
  }

  return Object.entries(params).reduce((output, [paramKey, value]) => {
    return output
      .replace(new RegExp(`{{${paramKey}}}`, 'g'), value)
      .replace(new RegExp(`\\{${paramKey}\\}`, 'g'), value);
  }, message);
};

export function setLocale(locale: string): void {
  currentLocale = locale === 'en-US' ? 'en-US' : 'zh-CN';
}

export function getLocale(): Locale {
  return currentLocale;
}

export function t(key: AgentsTranslationKeys, params?: Record<string, string>): string {
  const message = getTranslationValue(currentLocale, key) || key;
  return interpolate(message, params);
}

export function useAgentsI18n() {
  const appI18n = useTranslation();

  useEffect(() => {
    currentLocale = appI18n.locale;
  }, [appI18n.locale]);

  const translate = useCallback(
    (key: AgentsTranslationKeys, params?: Record<string, string>) => appI18n.t(key, params),
    [appI18n]
  );

  return {
    t: translate,
    locale: appI18n.locale,
    setLocale: appI18n.setLocale,
  };
}

export type { AgentsTranslationKeys } from './types';
