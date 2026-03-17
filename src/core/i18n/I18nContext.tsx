
import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { settingsService } from '@sdkwork/react-mobile-settings';
import { DEFAULT_LOCALE } from './config';
import {
  formatDate as intlFormatDate,
  formatDateTime as intlFormatDateTime,
  formatNumber as intlFormatNumber,
  formatTime as intlFormatTime,
} from './formatters';
import { readPersistedLocale, resolveInitialLocale } from './localeResolver';
import { getTranslationValue } from './resources';
import { Locale, I18nContextType } from './types';

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialLocale = useMemo<Locale>(
    () =>
      resolveInitialLocale({
        search: typeof window !== 'undefined' ? window.location.search : '',
        persistedLocale: readPersistedLocale(),
        navigatorLanguages: typeof navigator !== 'undefined' ? navigator.languages : undefined,
        navigatorLanguage: typeof navigator !== 'undefined' ? navigator.language : undefined,
      }),
    []
  );
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    const syncRequestLocale = () => {
      const nextLocale = resolveInitialLocale({
        search: window.location.search,
        persistedLocale: locale,
        navigatorLanguages: navigator.languages,
        navigatorLanguage: navigator.language,
      });

      if (nextLocale !== locale) {
        setLocaleState(nextLocale);
      }
    };

    window.addEventListener('popstate', syncRequestLocale);
    window.addEventListener('routechange', syncRequestLocale as EventListener);

    return () => {
      window.removeEventListener('popstate', syncRequestLocale);
      window.removeEventListener('routechange', syncRequestLocale as EventListener);
    };
  }, [locale]);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const config = await settingsService.getConfig().catch(() => null);
      if (!cancelled && config?.language) {
        const requestedLocale = resolveInitialLocale({
          search: typeof window !== 'undefined' ? window.location.search : '',
          persistedLocale: config.language,
          navigatorLanguages: typeof navigator !== 'undefined' ? navigator.languages : undefined,
          navigatorLanguage: typeof navigator !== 'undefined' ? navigator.language : undefined,
        });

        setLocaleState(requestedLocale || DEFAULT_LOCALE);
      }
    };
    void init();

    return () => {
      cancelled = true;
    };
  }, []);

  const setLocale = useCallback(async (newLocale: Locale) => {
    setLocaleState(newLocale);
    void settingsService.updateConfig({ language: newLocale });
  }, []);

  const interpolate = (message: string, params?: Record<string, string | number>) => {
    if (!params) {
      return message;
    }

    return Object.entries(params).reduce((output, [paramKey, paramValue]) => {
      const value = String(paramValue);
      return output
        .replace(new RegExp(`\\{${paramKey}\\}`, 'g'), value)
        .replace(new RegExp(`\\{\\{${paramKey}\\}\\}`, 'g'), value);
    }, message);
  };

  const t = useCallback((key: string, params?: Record<string, string | number>) => {
    const message = getTranslationValue(locale, key);
    return message ? interpolate(message, params) : key;
  }, [locale]);

  const formatDate = useCallback(
    (value: Date | number | string, options?: Intl.DateTimeFormatOptions) =>
      intlFormatDate(value, locale, options),
    [locale]
  );
  const formatTime = useCallback(
    (value: Date | number | string, options?: Intl.DateTimeFormatOptions) =>
      intlFormatTime(value, locale, options),
    [locale]
  );
  const formatDateTime = useCallback(
    (value: Date | number | string, options?: Intl.DateTimeFormatOptions) =>
      intlFormatDateTime(value, locale, options),
    [locale]
  );
  const formatNumber = useCallback(
    (value: number, options?: Intl.NumberFormatOptions) => intlFormatNumber(value, locale, options),
    [locale]
  );

  return (
    <I18nContext.Provider
      value={{ locale, setLocale, t, formatDate, formatTime, formatDateTime, formatNumber }}
    >
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within I18nProvider');
  }
  return context;
};

export const useOptionalTranslation = () => useContext(I18nContext);
