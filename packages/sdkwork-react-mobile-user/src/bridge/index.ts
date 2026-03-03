// ============================================
// User Module Capacitor Bridge
// ============================================

import { Capacitor } from '@capacitor/core';

// Export types
export type {
  CameraOptions,
  CameraResult,
  FileSystemOptions,
  FileResult,
  DirectoryResult,
  FileInfo,
} from './types';

// Export native bridges
export { CameraBridge } from './native/camera';
export { FileSystemBridge } from './native/fileSystem';
export { ShareBridge } from './native/share';

// Export hooks
export { useCamera } from './hooks/useCamera';
export { useFileSystem } from './hooks/useFileSystem';
export { useShare } from './hooks/useShare';

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
export function isFeatureAvailable(feature: 'camera' | 'filesystem' | 'share' | 'geolocation'): boolean {
  if (!isNative()) {
    // Web fallback - most features work on web
    return true;
  }
  
  const platform = getPlatform();
  
  switch (feature) {
    case 'camera':
      return true; // Camera works on both iOS and Android
    case 'filesystem':
      return true; // Filesystem works on both iOS and Android
    case 'share':
      return true; // Share works on both iOS and Android
    case 'geolocation':
      return true; // Geolocation works on both iOS and Android
    default:
      return false;
  }
}
