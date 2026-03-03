
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { settingsService } from '@sdkwork/react-mobile-settings';
import { resources } from './resources';
import { Locale, I18nContextType } from './types';

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>('zh-CN');

  // Load locale from settings on boot
  useEffect(() => {
    const init = async () => {
        const config = await settingsService.getConfig();
        if (config && config.language) {
            setLocaleState(config.language);
        }
    };
    init();
  }, []);

  const setLocale = useCallback(async (newLocale: Locale) => {
    setLocaleState(newLocale);
    await settingsService.updateConfig({ language: newLocale });
  }, []);

  const resolveNestedValue = (source: unknown, path: string): string | undefined => {
    if (!source || typeof source !== 'object' || !path) return undefined;
    const segments = path.split('.').filter(Boolean);
    if (segments.length === 0) return undefined;

    let cursor: unknown = source;
    for (const segment of segments) {
      if (!cursor || typeof cursor !== 'object' || !(segment in (cursor as Record<string, unknown>))) {
        return undefined;
      }
      cursor = (cursor as Record<string, unknown>)[segment];
    }

    return typeof cursor === 'string' ? cursor : undefined;
  };

  const t = useCallback((key: string) => {
    const dictionary = resources[locale] as Record<string, unknown>;
    if (!dictionary || !key) return key;

    const normalizedKey = key.replace(/:/g, '.');
    const paths = new Set<string>([key, normalizedKey]);
    const segments = normalizedKey.split('.').filter(Boolean);
    if (segments.length > 1 && segments[0] === segments[1]) {
      paths.add(segments.slice(1).join('.'));
    }

    for (const path of paths) {
      const direct = dictionary[path];
      if (typeof direct === 'string') {
        return direct;
      }
      const nested = resolveNestedValue(dictionary, path);
      if (nested) {
        return nested;
      }
    }

    return key;
  }, [locale]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
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
