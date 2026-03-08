// ============================================
// Platform Abstraction
// ============================================
export {
  getPlatform,
  isWeb,
  isMobile,
  isNative,
  getPlatformType,
  type Platform,
  type PlatformType,
} from './platform';

export { platformService } from './platform/platformService';

// ============================================
// Events
// ============================================
export { eventBus, EVENTS } from './events';

// ============================================
// Types
// ============================================
export type {
  BaseEntity,
  Result,
  PageRequest,
  Page,
  SortOrder,
  Sort,
  FilterOperator,
  FilterCriterion,
  QueryParams,
  IBaseService,
  ServiceApiClient,
  ServiceStorageAdapter,
  ServiceEventBusAdapter,
  ServiceLoggerAdapter,
  ServiceClock,
  ServiceIdGenerator,
  ServiceCommandResult,
  ServiceCommandAdapter,
  ServiceFactoryRuntimeDeps,
  ServiceFactoryDeps,
} from './types';

export { createDefaultServiceFactoryRuntimeDeps, resolveServiceFactoryRuntimeDeps } from './factory/runtimeDeps';

// ============================================
// Storage
// ============================================
export { AbstractStorageService } from './storage/AbstractStorageService';
export { getPersistStorage } from './storage/persistStorage';

// ============================================
// Hooks
// ============================================
export {
  useStorage,
  usePlatform,
  useOnlineStatus,
  useVisibility,
} from './hooks';

// ============================================
// Utils
// ============================================
export {
  generateId,
  formatDate,
  debounce,
  throttle,
  deepClone,
  deepMerge,
} from './utils';

export { logger } from './utils/logger';

// ============================================
// SDK
// ============================================
export {
  APP_SDK_AUTH_TOKEN_STORAGE_KEY,
  appSdkCoreRequest,
  applyAppSdkCoreSessionTokens,
  getAppSdkCoreClientWithSession,
  createAppSdkCoreConfig,
  createAppSdkCoreRuntimeConfig,
  getAppSdkCoreClient,
  getAppSdkCoreConfig,
  initAppSdkCoreClient,
  resetAppSdkCoreClient,
  type AppRuntimeEnv,
  type AppSdkCoreRuntimeConfig,
  type AppSdkCoreSessionOptions,
  type AppSdkCoreRequestOptions,
} from './sdk/appSdkClient';

// ============================================
// Constants
// ============================================
export {
  STORAGE_KEYS,
  APP_CONFIG,
  DEFAULT_PAGINATION,
} from './constants';
