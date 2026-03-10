// Types
export * from './types';

// Services
export { appAuthService } from './services/appAuthService';
export {
  useAppSdkClient,
  getAppSdkClient,
  initAppSdkClient,
  resetAppSdkClient,
  createAppSdkClientConfig,
  createAppSdkRuntimeConfig,
  applyAppSdkSessionTokens,
} from './services/useAppSdkClient';

// Stores
export { useAuthStore } from './stores/authStore';

// Hooks
export { useAuth, useCurrentUser, useIsAuthenticated, useAuthToken } from './hooks/useAuth';

// Pages
export { LoginPage, OAuthCallbackPage, RegisterPage, ForgotPasswordPage } from './pages';

// Utils
export {
  hashPassword,
  verifyPassword,
  generateToken,
  generateSalt,
  calculatePasswordStrength,
  validatePassword,
} from './utils/crypto';

// i18n
export { authTranslations } from './i18n';

// Bridge
export {
  initAuthBridge,
  isBiometricAvailable,
  requestNativeSocialAuthorization,
  requestBiometricAuth,
} from './bridge';
