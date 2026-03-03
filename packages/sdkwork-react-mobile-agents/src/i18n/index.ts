import { useCallback } from 'react';
import type { AgentsTranslationKeys } from './types';

// 导入语言包
import zhCN from './locales/zh-CN';
import enUS from './locales/en-US';

// 语言包映射
const agentsLocales: Record<string, Record<string, string>> = {
  'zh-CN': zhCN,
  'en-US': enUS,
};

// 当前语言
let currentLocale = 'zh-CN';

/**
 * 设置当前语言
 */
export function setLocale(locale: string): void {
  currentLocale = locale;
}

/**
 * 获取当前语言
 */
export function getLocale(): string {
  return currentLocale;
}

/**
 * 翻译函数
 */
export function t(key: AgentsTranslationKeys, params?: Record<string, string>): string {
  const localeData = agentsLocales[currentLocale] || agentsLocales['zh-CN'];
  let text = localeData[key] || key;
  
  // 替换参数
  if (params) {
    Object.entries(params).forEach(([paramKey, value]) => {
      text = text.replace(new RegExp(`{{${paramKey}}}`, 'g'), value);
    });
  }
  
  return text;
}

/**
 * 使用智能体模块翻译 Hook
 */
export function useAgentsI18n() {
  const translate = useCallback(
    (key: AgentsTranslationKeys, params?: Record<string, string>) => {
      return t(key, params);
    },
    []
  );

  return { t: translate, locale: currentLocale, setLocale };
}

// 导出类型
export type { AgentsTranslationKeys } from './types';
