// ============================================
// Clipboard Types
// ============================================

export interface ClipboardOptions {
  text: string;
}

export interface ClipboardResult {
  success: boolean;
  text?: string;
  error?: string;
}

// ============================================
// Haptic Types
// ============================================

export interface HapticOptions {
  type: 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'warning' | 'error';
}

export interface HapticResult {
  success: boolean;
  error?: string;
}

// ============================================
// Keyboard Types
// ============================================

export interface KeyboardOptions {
  animated?: boolean;
}

export interface KeyboardResult {
  success: boolean;
  error?: string;
}

export interface KeyboardInfo {
  isVisible: boolean;
  height: number;
}

// ============================================
// Network Types
// ============================================

export interface NetworkStatus {
  connected: boolean;
  connectionType: 'wifi' | 'cellular' | 'none' | 'unknown';
}

export interface NetworkResult {
  success: boolean;
  status?: NetworkStatus;
  error?: string;
}
