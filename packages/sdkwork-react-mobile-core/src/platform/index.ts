/**
 * Platform Module - Entry Point
 * Provides unified platform abstraction with auto-detection
 */

import type { IPlatform, PlatformType } from './types';
export type * from './types';
export { inspectPlatformCapabilities } from './capabilities';
export type { PlatformCapabilityReport, CapabilityCheckItem, PaymentCapabilityCheck } from './capabilities';
export {
  PLATFORM_RUNTIME_EVENTS,
  parsePaymentCallbackUrl,
  attachPlatformRuntime,
  initializePlatformRuntime,
} from './runtime';
export type { PlatformRuntimeOptions, PaymentCallbackPayload, PushTokenUpdatedPayload } from './runtime';
export {
  PLATFORM_RUNTIME_HOOK_EVENTS,
  createDefaultPlatformRuntimeHooks,
  flushDefaultPlatformRuntimeHookQueue,
} from './runtimeHooks';
export type { DefaultPlatformRuntimeHooksOptions, RuntimeRetryFlushResult } from './runtimeHooks';

let platformInstance: IPlatform | null = null;
let initializationPromise: Promise<void> | null = null;

/**
 * Initialize the platform
 * Auto-detects the environment and loads the appropriate implementation
 */
export async function initializePlatform(): Promise<void> {
  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    if (typeof window === 'undefined') {
      throw new Error('Platform initialization is only supported in browser environment');
    }

    // Check if running in Capacitor
    const isCapacitor = await detectCapacitor();
    
    if (isCapacitor) {
      const { CapacitorPlatform } = await import('./capacitor');
      platformInstance = new CapacitorPlatform();
    } else {
      const { WebPlatform } = await import('./web');
      platformInstance = new WebPlatform();
    }

    await platformInstance.initialize();
  })();

  return initializationPromise;
}

/**
 * Detect if running in Capacitor environment
 */
async function detectCapacitor(): Promise<boolean> {
  try {
    const { Capacitor } = await import('@capacitor/core');
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

/**
 * Get the platform instance
 * Must call initializePlatform() first
 */
export function getPlatform(): IPlatform {
  if (!platformInstance) {
    throw new Error('Platform not initialized. Call initializePlatform() first.');
  }
  return platformInstance;
}

/**
 * Check if platform is initialized
 */
export function isPlatformInitialized(): boolean {
  return platformInstance !== null;
}

/**
 * Check if running on web
 */
export function isWeb(): boolean {
  if (!platformInstance) return typeof window !== 'undefined';
  return platformInstance.isWeb;
}

/**
 * Check if running on mobile (iOS or Android)
 */
export function isMobile(): boolean {
  if (!platformInstance) {
    if (typeof navigator === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }
  return platformInstance.isIOS || platformInstance.isAndroid;
}

/**
 * Check if running on native platform
 */
export function isNative(): boolean {
  if (!platformInstance) return false;
  return platformInstance.isNative;
}

/**
 * Get platform type
 */
export function getPlatformType(): PlatformType {
  if (!platformInstance) return 'web';
  return platformInstance.type;
}

/**
 * Late-binding proxy for Platform
 * Allows importing Platform anywhere, resolves to instance when accessed
 */
export const Platform: IPlatform = new Proxy({} as IPlatform, {
  get(_, prop: keyof IPlatform) {
    const instance = getPlatform();
    const value = instance[prop];
    if (typeof value === 'function') {
      return value.bind(instance);
    }
    return value;
  },
});

// Re-export platform implementations
export { WebPlatform } from './web';
export { CapacitorPlatform } from './capacitor';
