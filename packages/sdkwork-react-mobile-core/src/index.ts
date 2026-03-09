// ============================================
// Platform Abstraction
// ============================================
export {
  getPlatform,
  isWeb,
  isMobile,
  isNative,
  getPlatformType,
  inspectPlatformCapabilities,
  PLATFORM_RUNTIME_EVENTS,
  PLATFORM_RUNTIME_HOOK_EVENTS,
  parsePaymentCallbackUrl,
  attachPlatformRuntime,
  initializePlatformRuntime,
  createDefaultPlatformRuntimeHooks,
  flushDefaultPlatformRuntimeHookQueue,
  inspectDefaultPlatformRuntimeHookQueue,
  type Platform,
  type PlatformType,
  type PlatformCapabilityReport,
  type CapabilityCheckItem,
  type PaymentCapabilityCheck,
  type WrapperCapabilityCheck,
  type PlatformWrapperName,
  type PlatformWrapperCapabilityMap,
  type WrapperCapabilitySummary,
  type PlatformRuntimeOptions,
  type PaymentCallbackPayload,
  type PushTokenUpdatedPayload,
  type DefaultPlatformRuntimeHooksOptions,
  type RuntimeRetryFlushResult,
  type RuntimeRetryPolicyOptions,
  type RuntimeRetryQueueSnapshotBucket,
  type RuntimeRetryQueueSnapshot,
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
  buildOpenChatQrLink,
  parseOpenChatQrLink,
  OPENCHAT_QR_LINK_VERSION,
  OPENCHAT_QR_LINK_ROUTE,
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
