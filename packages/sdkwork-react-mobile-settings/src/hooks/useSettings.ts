import { useEffect } from 'react';
import { getTranslationValue } from '@/src/core/i18n/resources';
import { useSettingsStore } from '../stores/settingsStore';

export function useSettings() {
  const config = useSettingsStore((state) => state.config);
  const isLoading = useSettingsStore((state) => state.isLoading);
  const error = useSettingsStore((state) => state.error);
  const loadConfig = useSettingsStore((state) => state.loadConfig);
  const updateConfig = useSettingsStore((state) => state.updateConfig);
  const updateAIConfig = useSettingsStore((state) => state.updateAIConfig);
  const updateTheme = useSettingsStore((state) => state.updateTheme);
  const updateLanguage = useSettingsStore((state) => state.updateLanguage);
  const resetAppearanceConfig = useSettingsStore((state) => state.resetAppearanceConfig);

  useEffect(() => {
    void loadConfig();
  }, [loadConfig]);

  const t = (key: string): string => {
    const locale = config?.language || 'zh-CN';
    return getTranslationValue(locale, key) || key;
  };

  return {
    config,
    isLoading,
    error,
    theme: config?.theme || 'wechat-dark',
    language: config?.language || 'zh-CN',
    setTheme: updateTheme,
    setLanguage: updateLanguage,
    updateConfig,
    updateAIConfig,
    updateTheme,
    updateLanguage,
    resetAppearanceConfig,
    t,
  };
}

export function useTheme() {
  const config = useSettingsStore((state) => state.config);
  const updateTheme = useSettingsStore((state) => state.updateTheme);

  return {
    theme: config?.theme || 'wechat-dark',
    setTheme: updateTheme,
  };
}

export function useLanguage() {
  const config = useSettingsStore((state) => state.config);
  const updateLanguage = useSettingsStore((state) => state.updateLanguage);

  return {
    language: config?.language || 'zh-CN',
    setLanguage: updateLanguage,
  };
}

export function useAIConfig() {
  const config = useSettingsStore((state) => state.config);
  const updateAIConfig = useSettingsStore((state) => state.updateAIConfig);

  return {
    aiConfig: config?.aiConfig,
    updateAIConfig,
  };
}
