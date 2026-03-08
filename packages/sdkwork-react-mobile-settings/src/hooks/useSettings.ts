import { useEffect } from 'react';
import { useSettingsStore } from '../stores/settingsStore';

const translations: Record<string, Record<string, string>> = {
  'zh-CN': {
    'settings.title': '\u8bbe\u7f6e',
    'settings.account': '\u8d26\u53f7\u7ba1\u7406',
    'settings.model_settings': '\u6a21\u578b\u8bbe\u7f6e',
    'settings.notifications': '\u901a\u77e5\u8bbe\u7f6e',
    'settings.theme': '\u4e3b\u9898\u8bbe\u7f6e',
    'settings.language': '\u8bed\u8a00\u8bbe\u7f6e',
    'settings.storage': '\u5b58\u50a8\u7a7a\u95f4',
    'settings.about': '\u5173\u4e8e',
    'settings.logout': '\u9000\u51fa\u767b\u5f55',
    'settings.logout_confirm': '\u786e\u5b9a\u9000\u51fa\u767b\u5f55?',
    'settings.logout_success': '\u5df2\u9000\u51fa\u767b\u5f55',
    'settings.openai_assistant': 'OpenChat AI \u52a9\u624b\u60ac\u6d6e\u6309\u94ae',
    'settings.openai_assistant_desc': '\u5728\u9875\u9762\u4e2d\u663e\u793a\u60ac\u6d6e\u52a9\u624b\u5165\u53e3',
    'settings.config_center.title': '\u914d\u7f6e\u4e2d\u5fc3',
    'settings.config_center.mode_title': '\u663e\u793a\u6a21\u5f0f',
    'settings.config_center.mode_desc': '\u8ddf\u968f\u7cfb\u7edf\u6216\u5f3a\u5236\u6307\u5b9a',
    'settings.config_center.mode_system': '\u8ddf\u968f\u7cfb\u7edf',
    'settings.config_center.mode_light': '\u6d45\u8272',
    'settings.config_center.mode_dark': '\u6df1\u8272',
    'settings.config_center.preset_title': '\u4e3b\u9898\u98ce\u683c',
    'settings.config_center.preset_desc': '\u9009\u62e9\u89c6\u89c9\u98ce\u683c',
    'settings.config_center.preset_wechat': 'WeChat',
    'settings.config_center.preset_wechat_desc': '\u5747\u8861\u3001\u719f\u6089',
    'settings.config_center.preset_classic': '\u7ecf\u5178',
    'settings.config_center.preset_classic_desc': '\u4e2d\u6027\u7b80\u6d01',
    'settings.config_center.preset_midnight': '\u591c\u5e55\u84dd',
    'settings.config_center.preset_midnight_desc': '\u79d1\u6280\u6df1\u8272',
    'settings.config_center.preset_oled': 'OLED',
    'settings.config_center.preset_oled_desc': '\u9ad8\u5bf9\u6bd4\u7eaf\u9ed1',
    'settings.config_center.accent_title': '\u5f3a\u8c03\u8272',
    'settings.config_center.accent_desc': '\u4e3b\u8981\u4ea4\u4e92\u989c\u8272',
    'settings.config_center.accent_invalid': '\u989c\u8272\u683c\u5f0f\u65e0\u6548\uff0c\u8bf7\u8f93\u5165 #RRGGBB \u6216 #RGB',
    'settings.config_center.font_title': '\u5168\u5c40\u5b57\u4f53\u6bd4\u4f8b',
    'settings.config_center.font_desc': '\u5e94\u7528\u4e8e\u6574\u4e2a App',
    'settings.config_center.font_now': '\u5f53\u524d',
    'settings.config_center.font_family_title': '\u5b57\u4f53\u98ce\u683c',
    'settings.config_center.font_family_desc': '\u9009\u62e9\u5168\u5c40\u6392\u7248\u6c14\u8d28',
    'settings.config_center.font_family_system': '\u7cfb\u7edf',
    'settings.config_center.font_family_rounded': '\u5706\u89d2',
    'settings.config_center.font_family_serif': '\u884c\u6587',
    'settings.config_center.font_family_mono': '\u7b49\u5bbd',
    'settings.config_center.preview_title': '\u5b9e\u65f6\u9884\u89c8',
    'settings.config_center.preview_title_text': '\u4f1a\u8bdd\u6807\u9898',
    'settings.config_center.preview_body': '\u4e3b\u9898\u3001\u989c\u8272\u4e0e\u5b57\u4f53\u53d8\u66f4\u4f1a\u7acb\u5373\u751f\u6548',
    'settings.config_center.applied': '\u5df2\u5e94\u7528',
    'settings.config_center.apply': '\u5e94\u7528',
    'settings.config_center.reset': '\u6062\u590d\u9ed8\u8ba4\u5916\u89c2',
    'settings.config_center.reset_confirm': '\u786e\u5b9a\u6062\u590d\u9ed8\u8ba4\u5916\u89c2\u914d\u7f6e\u5417\uff1f',
    'settings.config_center.reset_done': '\u5df2\u6062\u590d\u9ed8\u8ba4\u5916\u89c2',
    'settings.labels.config_center_desc': '\u7cfb\u7edf\u6a21\u5f0f\u3001\u4e3b\u9898\u98ce\u683c\u3001\u5f3a\u8c03\u8272\u3001\u5b57\u4f53\u98ce\u683c\u4e0e\u6bd4\u4f8b',
    'settings.storage_usage': '\u672c\u5730\u5360\u7528',
    'settings.storage_clean': '\u5237\u65b0\u4f30\u7b97',
    'settings.storage_clean_desc': '\u626b\u63cf\u5f53\u524d\u672c\u5730\u7f13\u5b58\u4e0e\u5a92\u4f53\u5360\u7528',
    'settings.background.saved_current': '\u5df2\u5e94\u7528\u5230\u5f53\u524d\u4f1a\u8bdd',
    'settings.background.saved_global': '\u5df2\u5168\u5c40\u5e94\u7528',
    'settings.background.save_failed': '\u4fdd\u5b58\u80cc\u666f\u5931\u8d25',
    'settings.model_config.api_key_required': '\u8bf7\u586b\u5199 API Key',
    'settings.model_config.endpoint_required': '\u8bf7\u586b\u5199 Base URL',
    'settings.model_config.base_url': 'Base URL',
    'settings.model_config.base_url_placeholder_local': 'http://localhost:11434',
    'settings.model_config.base_url_placeholder_cloud': 'https://api.openai.com/v1',
    'settings.model_config.api_key': 'API Key',
    'settings.model_config.default_params_title': '\u9ed8\u8ba4\u53c2\u6570',
    'settings.model_config.max_tokens': 'Max Tokens',
    'settings.model_config.max_tokens_placeholder': '2048',
    'settings.model_config.save_failed': '\u4fdd\u5b58\u914d\u7f6e\u5931\u8d25',
    'settings.models.sound_effect': '\u97f3\u6548\u6a21\u578b (Sound Effect)',
    'settings.models.sound_effect_desc': 'AI \u97f3\u6548\u751f\u6210\u4e0e\u7f16\u8f91',
    'common.loading': '\u52a0\u8f7d\u4e2d...',
  },
  'en-US': {
    'settings.title': 'Settings',
    'settings.account': 'Account',
    'settings.model_settings': 'Model Settings',
    'settings.notifications': 'Notifications',
    'settings.theme': 'Theme',
    'settings.language': 'Language',
    'settings.storage': 'Storage',
    'settings.about': 'About',
    'settings.logout': 'Log Out',
    'settings.logout_confirm': 'Are you sure you want to log out?',
    'settings.logout_success': 'Logged out successfully',
    'settings.openai_assistant': 'OpenChat AI floating assistant',
    'settings.openai_assistant_desc': 'Show floating assistant entry on pages',
    'settings.config_center.title': 'Configuration Center',
    'settings.config_center.mode_title': 'Display Mode',
    'settings.config_center.mode_desc': 'Follow system or force a mode',
    'settings.config_center.mode_system': 'System',
    'settings.config_center.mode_light': 'Light',
    'settings.config_center.mode_dark': 'Dark',
    'settings.config_center.preset_title': 'Theme Preset',
    'settings.config_center.preset_desc': 'Visual style direction',
    'settings.config_center.preset_wechat': 'WeChat',
    'settings.config_center.preset_wechat_desc': 'Balanced and familiar',
    'settings.config_center.preset_classic': 'Classic',
    'settings.config_center.preset_classic_desc': 'Neutral and clean',
    'settings.config_center.preset_midnight': 'Midnight',
    'settings.config_center.preset_midnight_desc': 'Cool dark blue tone',
    'settings.config_center.preset_oled': 'OLED',
    'settings.config_center.preset_oled_desc': 'High-contrast dark',
    'settings.config_center.accent_title': 'Accent Color',
    'settings.config_center.accent_desc': 'Primary actions and highlights',
    'settings.config_center.accent_invalid': 'Invalid color. Use #RRGGBB or #RGB.',
    'settings.config_center.font_title': 'Global Font Scale',
    'settings.config_center.font_desc': 'Applies to the entire app',
    'settings.config_center.font_now': 'Current',
    'settings.config_center.font_family_title': 'Font Style',
    'settings.config_center.font_family_desc': 'Choose global typography personality',
    'settings.config_center.font_family_system': 'System',
    'settings.config_center.font_family_rounded': 'Rounded',
    'settings.config_center.font_family_serif': 'Serif',
    'settings.config_center.font_family_mono': 'Monospace',
    'settings.config_center.preview_title': 'Live Preview',
    'settings.config_center.preview_title_text': 'Conversation title',
    'settings.config_center.preview_body': 'Theme, color, and font changes are applied instantly.',
    'settings.config_center.applied': 'Applied',
    'settings.config_center.apply': 'Apply',
    'settings.config_center.reset': 'Reset Appearance Defaults',
    'settings.config_center.reset_confirm': 'Reset appearance settings to defaults?',
    'settings.config_center.reset_done': 'Appearance defaults restored',
    'settings.labels.config_center_desc': 'System mode, preset, accent color, font style and scale',
    'settings.storage_usage': 'Local usage',
    'settings.storage_clean': 'Refresh estimate',
    'settings.storage_clean_desc': 'Scan current local cache and media usage',
    'settings.background.saved_current': 'Applied to current chat',
    'settings.background.saved_global': 'Applied globally',
    'settings.background.save_failed': 'Failed to save background',
    'settings.model_config.api_key_required': 'Please enter API Key',
    'settings.model_config.endpoint_required': 'Please enter Base URL',
    'settings.model_config.base_url': 'Base URL',
    'settings.model_config.base_url_placeholder_local': 'http://localhost:11434',
    'settings.model_config.base_url_placeholder_cloud': 'https://api.openai.com/v1',
    'settings.model_config.api_key': 'API Key',
    'settings.model_config.default_params_title': 'Default Parameters',
    'settings.model_config.max_tokens': 'Max Tokens',
    'settings.model_config.max_tokens_placeholder': '2048',
    'settings.model_config.save_failed': 'Failed to save configuration',
    'settings.models.sound_effect': 'Sound Effect Model',
    'settings.models.sound_effect_desc': 'AI sound effects generation and editing',
    'common.loading': 'Loading...',
  },
};

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
    const lang = config?.language || 'zh-CN';
    return translations[lang]?.[key] || key;
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
