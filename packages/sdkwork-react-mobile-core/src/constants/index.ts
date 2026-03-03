/**
 * Default storage keys
 */
export const STORAGE_KEYS = {
  APP_LEVEL: 'sys_app_settings_v1',
  USER_PREFERENCES: 'sys_user_preferences_v1',
  
  AUTH_TOKEN: 'sys_auth_token_v1',
  AUTH_USER: 'sys_auth_user_v1',
  
  CACHE_PREFIX: 'sys_cache_',
  
  FEATURE_FLAGS: 'sys_feature_flags_v1',
} as const;

/**
 * App configuration
 */
export const APP_CONFIG = {
  VERSION: '1.0.0',
  BUILD_NUMBER: '100',
  API_BASE_URL: 'https://api.example.com',
  WS_BASE_URL: 'wss://api.example.com',
  DEFAULT_LANGUAGE: 'zh-CN',
  SUPPORTED_LANGUAGES: ['zh-CN', 'en-US'],
  MAX_UPLOAD_SIZE: 10 * 1024 * 1024,
  DEFAULT_TIMEOUT: 30000,
} as const;

/**
 * Default pagination settings
 */
export const DEFAULT_PAGINATION = {
  PAGE: 1,
  SIZE: 20,
  MAX_SIZE: 1000,
} as const;

/**
 * Event names
 */
export const EVENT_NAMES = {
  DATA_CHANGE: 'sys:data_change',
  THEME_CHANGE: 'ui:theme_change',
  LANGUAGE_CHANGE: 'ui:language_change',
  STATUS_CHANGE: 'sys:status_change',
  ONLINE_STATUS: 'sys:online_status',
  AUTH_LOGIN: 'auth:login',
  AUTH_LOGOUT: 'auth:logout',
  AUTH_TOKEN_REFRESH: 'auth:token_refresh',
} as const;

/**
 * HTTP status codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
} as const;
