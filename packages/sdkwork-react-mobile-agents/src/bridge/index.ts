// ============================================
// Agents Module Capacitor Bridge
// ============================================

import { Capacitor } from '@capacitor/core';

// Export types
export type {
  ClipboardOptions,
  ClipboardResult,
  HapticOptions,
} from './types';

// Export native bridges
export { ClipboardBridge } from './native/clipboard';
export { HapticBridge } from './native/haptic';

/**
 * Check if running in native environment
 */
export function isNative(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Get current platform
 */
export function getPlatform(): 'ios' | 'android' | 'web' {
  const platform = Capacitor.getPlatform();
  if (platform === 'ios') return 'ios';
  if (platform === 'android') return 'android';
  return 'web';
}

/**
 * Check if feature is available on current platform
 */
export function isFeatureAvailable(
  feature: 'clipboard' | 'haptic'
): boolean {
  if (!isNative()) {
    // Web fallback - most features work on web
    return true;
  }

  switch (feature) {
    case 'clipboard':
      return true;
    case 'haptic':
      return true; // Haptic works on both iOS and Android
    default:
      return false;
  }
}
