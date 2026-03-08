import {
  getPlatform as getCorePlatform,
  initializePlatform as initializeCorePlatform,
} from '@sdkwork/react-mobile-core/platform';
import type { IPlatform as ICorePlatform, PlatformType as CorePlatformType } from '@sdkwork/react-mobile-core/platform';

export enum PlatformType {
  WEB = 'WEB',
  TAURI = 'TAURI',
  IOS = 'IOS',
  ANDROID = 'ANDROID',
}

export interface IDevice {
  getUUID(): Promise<string>;
  getInfo(): Promise<{ model: string; os: string; version: string }>;
  vibrate(pattern: number | number[]): void;
}

export interface IStorage {
  get(key: string): Promise<any | null>;
  set(key: string, value: any): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
}

export interface IClipboard {
  write(text: string): Promise<void>;
  read(): Promise<string>;
}

export interface ICamera {
  takePhoto(): Promise<string>;
  scanQRCode(): Promise<string>;
}

export interface IPlatform {
  type: PlatformType;
  initialize(): Promise<void>;
  device: IDevice;
  storage: IStorage;
  clipboard: IClipboard;
  camera: ICamera;
}

const memoryStorage = new Map<string, unknown>();

const createFallbackPlatform = (): IPlatform => ({
  type: PlatformType.WEB,
  initialize: async () => {},
  device: {
    getUUID: async () => {
      if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
      }
      return `web_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    },
    getInfo: async () => ({
      model: 'Browser',
      os: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      version: 'web',
    }),
    vibrate: (pattern) => {
      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        navigator.vibrate(pattern);
      }
    },
  },
  storage: {
    get: async (key) => (memoryStorage.has(key) ? memoryStorage.get(key) : null),
    set: async (key, value) => {
      memoryStorage.set(key, value);
    },
    remove: async (key) => {
      memoryStorage.delete(key);
    },
    clear: async () => {
      memoryStorage.clear();
    },
  },
  clipboard: {
    write: async (text) => {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      }
    },
    read: async () => {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.readText) {
        return navigator.clipboard.readText();
      }
      return '';
    },
  },
  camera: {
    takePhoto: async () => {
      throw new Error('Camera is not available in fallback platform');
    },
    scanQRCode: async () => {
      throw new Error('QR scanner is not available in fallback platform');
    },
  },
});

const mapCoreType = (type: CorePlatformType): PlatformType => {
  if (type === 'ios') return PlatformType.IOS;
  if (type === 'android') return PlatformType.ANDROID;
  return PlatformType.WEB;
};

const adaptCorePlatform = (corePlatform: ICorePlatform): IPlatform => ({
  type: mapCoreType(corePlatform.type),
  initialize: async () => {},
  device: {
    getUUID: () => corePlatform.device.getUUID(),
    getInfo: async () => {
      const info = await corePlatform.device.getInfo();
      return {
        model: info.model,
        os: info.platform,
        version: info.platformVersion || info.osVersion || '',
      };
    },
    vibrate: (pattern) => {
      void corePlatform.device.vibrate(pattern).catch(() => {});
    },
  },
  storage: {
    get: (key) => corePlatform.storage.get(key),
    set: (key, value) => corePlatform.storage.set(key, value),
    remove: (key) => corePlatform.storage.remove(key),
    clear: () => corePlatform.storage.clear(),
  },
  clipboard: {
    write: (text) => corePlatform.clipboard.write(text),
    read: () => corePlatform.clipboard.read(),
  },
  camera: {
    takePhoto: () => corePlatform.camera.takePhoto(),
    scanQRCode: () => corePlatform.camera.scanQRCode(),
  },
});

let platformInstance: IPlatform = createFallbackPlatform();
let initializationPromise: Promise<void> | null = null;

export async function initializePlatform(): Promise<void> {
  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    try {
      await initializeCorePlatform();
      platformInstance = adaptCorePlatform(getCorePlatform());
    } catch (error) {
      platformInstance = createFallbackPlatform();
      console.error('[Platform] Core platform initialization failed, using fallback platform', error);
    }
  })();

  return initializationPromise;
}

export class PlatformManager {
  static setInstance(platform: IPlatform) {
    platformInstance = platform;
  }

  static getInstance(): IPlatform {
    return platformInstance;
  }
}

export const Platform: IPlatform = {
  get type() {
    return PlatformManager.getInstance().type;
  },
  get device() {
    return PlatformManager.getInstance().device;
  },
  get storage() {
    return PlatformManager.getInstance().storage;
  },
  get clipboard() {
    return PlatformManager.getInstance().clipboard;
  },
  get camera() {
    return PlatformManager.getInstance().camera;
  },
  initialize() {
    return initializePlatform();
  },
} as IPlatform;
