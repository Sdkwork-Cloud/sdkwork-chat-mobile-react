export type Locale = 'zh-CN' | 'en-US';

export const DEFAULT_LOCALE: Locale = 'zh-CN';

export const SUPPORTED_LOCALES: Locale[] = ['zh-CN', 'en-US'];

export const REQUEST_LOCALE_KEYS = ['locale', 'lang'] as const;
