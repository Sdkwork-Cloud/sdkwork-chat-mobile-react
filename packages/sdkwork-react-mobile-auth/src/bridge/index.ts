import { platformService, logger } from '@sdkwork/react-mobile-core';
import type { SocialProvider } from '../types';

const TAG = 'AuthBridge';

/**
 * Auth bridge for native-only capabilities.
 */
export function initAuthBridge(): void {
  logger.info(TAG, 'Initializing auth bridge');
  logger.info(TAG, 'Auth bridge initialized');
}

/**
 * Delegates native OAuth authorization to the platform bridge.
 */
async function openNativeOAuth(provider: SocialProvider): Promise<{ code: string; state?: string }> {
  logger.info(TAG, 'Native OAuth', { provider });

  // Placeholder implementation until provider-specific native plugins land.
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ code: `mock_code_${provider}_${Date.now()}`, state: generateState() });
    }, 1000);
  });
}

/**
 * Requests native social authorization and returns the auth code payload.
 */
export async function requestNativeSocialAuthorization(
  provider: SocialProvider
): Promise<{ code: string; state?: string }> {
  if (!platformService.isNative()) {
    throw new Error('Native social authorization requires native runtime');
  }

  return openNativeOAuth(provider);
}

/**
 * Handles biometric authentication through the native runtime.
 */
async function handleBiometricAuth(): Promise<{ success: boolean; error?: string }> {
  logger.info(TAG, 'Handling biometric authentication');

  try {
    if (!platformService.isNative()) {
      return { success: false, error: 'Biometric auth not available in web' };
    }

    // Placeholder for a Capacitor biometric plugin integration.
    return { success: true };
  } catch (error) {
    logger.error(TAG, 'Biometric auth failed', error);
    return { success: false, error: 'Biometric authentication failed' };
  }
}

/**
 * Generates a short OAuth state token for mock callbacks.
 */
function generateState(): string {
  return Math.random().toString(36).substring(2, 15);
}

export async function isBiometricAvailable(): Promise<boolean> {
  if (!platformService.isNative()) {
    return false;
  }

  // Placeholder for a Capacitor biometric capability check.
  return false;
}

export async function requestBiometricAuth(): Promise<boolean> {
  const result = await handleBiometricAuth();
  return result.success ?? false;
}
