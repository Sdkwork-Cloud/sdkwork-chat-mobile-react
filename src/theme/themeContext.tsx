
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  type AccentPreset,
  type AppearanceMode,
  type FontFamilyPreset,
  type ThemePreset,
  useSettingsStore,
} from '@sdkwork/react-mobile-settings';
import type { ThemeType } from '@sdkwork/react-mobile-settings';
import { resolveAppearanceTheme } from './appearanceTokens';

type AppTheme = ThemeType | 'midnight-blue';

export const getThemeMetaColor = (theme: string): string => {
  const colorMap: Record<string, string> = {
    light: '#ededed',
    dark: '#000000',
    'wechat-dark': '#111111',
    'midnight-blue': '#0d1117',
  };
  return colorMap[theme] || '#ededed';
};

interface ThemeContextType {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  appearanceMode: AppearanceMode;
  setAppearanceMode: (mode: AppearanceMode) => void;
  themePreset: ThemePreset;
  setThemePreset: (preset: ThemePreset) => void;
  accentPreset: AccentPreset;
  setAccentPreset: (preset: AccentPreset) => void;
  fontFamilyPreset: FontFamilyPreset;
  setFontFamilyPreset: (preset: FontFamilyPreset) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const mapLegacyTheme = (theme: AppTheme): { appearanceMode: AppearanceMode; themePreset: ThemePreset } => {
  if (theme === 'light' || theme === 'wechat-light') {
    return { appearanceMode: 'light', themePreset: 'wechat' };
  }
  if (theme === 'wechat-dark') {
    return { appearanceMode: 'dark', themePreset: 'wechat' };
  }
  if (theme === 'midnight-blue' || theme === 'geek') {
    return { appearanceMode: 'dark', themePreset: 'midnight' };
  }
  return { appearanceMode: 'dark', themePreset: 'classic' };
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const config = useSettingsStore((state) => state.config);
  const loadConfig = useSettingsStore((state) => state.loadConfig);
  const updateConfig = useSettingsStore((state) => state.updateConfig);
  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    void loadConfig();
  }, [loadConfig]);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (event: MediaQueryListEvent) => {
      setSystemPrefersDark(event.matches);
    };
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  const appearanceMode: AppearanceMode = config?.appearanceMode ?? 'system';
  const themePreset: ThemePreset = config?.themePreset ?? 'wechat';
  const accentPreset: AccentPreset = config?.accentPreset ?? 'blue';
  const fontScale = clamp(config?.fontScale ?? 1, 0.85, 1.35);
  const fontFamilyPreset: FontFamilyPreset = config?.fontFamilyPreset ?? 'system';

  const resolvedTheme = useMemo(
    () =>
      resolveAppearanceTheme({
        appearanceMode,
        themePreset,
        accentType: config?.accentType ?? 'preset',
        accentPreset,
        accentHex: config?.accentHex ?? '',
        fontScale,
        fontFamilyPreset,
        systemPrefersDark,
      }),
    [
      accentPreset,
      appearanceMode,
      config?.accentHex,
      config?.accentType,
      fontFamilyPreset,
      fontScale,
      systemPrefersDark,
      themePreset,
    ]
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedTheme.legacyTheme);
    document.documentElement.setAttribute('data-theme-mode', resolvedTheme.mode);
    document.documentElement.setAttribute('data-theme-preset', themePreset);
    Object.entries(resolvedTheme.cssVariables).forEach(([token, value]) => {
      document.documentElement.style.setProperty(token, value);
    });
    document.documentElement.style.fontSize = `${Math.round(16 * fontScale)}px`;

    const metaThemeColor = document.querySelector('meta[name=theme-color]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', resolvedTheme.themeColor);
    }
  }, [fontScale, resolvedTheme, themePreset]);

  const theme: AppTheme = (config?.theme as AppTheme) || resolvedTheme.legacyTheme;
  const fontSize = Math.round(16 * fontScale);

  const setTheme = (newTheme: AppTheme) => {
    const mapped = mapLegacyTheme(newTheme);
    void updateConfig({
      theme: newTheme as ThemeType,
      appearanceMode: mapped.appearanceMode,
      themePreset: mapped.themePreset,
    });
  };

  const setFontSize = (size: number) => {
    const normalizedSize = clamp(size, 14, 24);
    const nextScale = clamp(normalizedSize / 16, 0.85, 1.35);
    void updateConfig({
      fontScale: nextScale,
      fontSize: Math.round(16 * nextScale),
    });
  };

  const setAppearanceMode = (mode: AppearanceMode) => {
    void updateConfig({ appearanceMode: mode });
  };

  const setThemePreset = (preset: ThemePreset) => {
    void updateConfig({ themePreset: preset });
  };

  const setAccentPreset = (preset: AccentPreset) => {
    void updateConfig({
      accentType: 'preset',
      accentPreset: preset,
    });
  };

  const setFontFamilyPreset = (preset: FontFamilyPreset) => {
    void updateConfig({ fontFamilyPreset: preset });
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        fontSize,
        setFontSize,
        appearanceMode,
        setAppearanceMode,
        themePreset,
        setThemePreset,
        accentPreset,
        setAccentPreset,
        fontFamilyPreset,
        setFontFamilyPreset,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export type { ThemeType };
export type { AppTheme };
