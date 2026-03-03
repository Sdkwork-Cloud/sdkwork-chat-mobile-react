import { getPlatform, isWeb, isMobile, isNative, isPlatformInitialized } from './index';

// Memory storage fallback when platform is not initialized
const memoryStorage = new Map<string, any>();

const memoryStorageAdapter = {
  get: async <T>(key: string): Promise<T | null> => {
    return memoryStorage.get(key) || null;
  },
  set: async (key: string, value: any): Promise<void> => {
    memoryStorage.set(key, value);
  },
  remove: async (key: string): Promise<void> => {
    memoryStorage.delete(key);
  },
  clear: async (): Promise<void> => {
    memoryStorage.clear();
  },
};

/**
 * Platform service for accessing platform capabilities
 * Safely handles cases where platform is not yet initialized
 */
export const platformService = {
  get storage() {
    if (!isPlatformInitialized()) {
      console.warn('[platformService] Platform not initialized, using memory storage');
      return memoryStorageAdapter;
    }
    return getPlatform().storage;
  },

  getPlatform: () => {
    if (!isPlatformInitialized()) {
      return null;
    }
    return getPlatform();
  },

  isWeb,
  isMobile,
  isNative,

  /**
   * Check if running on iOS
   */
  isIOS: () => {
    if (typeof navigator === 'undefined') return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  },

  /**
   * Check if running on Android
   */
  isAndroid: () => {
    if (typeof navigator === 'undefined') return false;
    return /Android/.test(navigator.userAgent);
  },

  /**
   * Get app version
   */
  getAppVersion: () => {
    return '1.0.0';
  },

  /**
   * Get device info
   */
  getDeviceInfo: () => {
    if (!isPlatformInitialized()) {
      return {
        platform: null,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        language: typeof navigator !== 'undefined' ? navigator.language : 'zh-CN',
      };
    }
    return {
      platform: getPlatform(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      language: typeof navigator !== 'undefined' ? navigator.language : 'zh-CN',
    };
  },
};
