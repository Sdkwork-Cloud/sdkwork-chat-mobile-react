// Types
export * from './types';

// Services
export { authService, createAuthService } from './services/AuthService';
export { authSdkService, createAuthSdkService } from './services/AuthSdkService';

// Stores
export { useAuthStore } from './stores/authStore';

// Hooks
export { useAuth, useCurrentUser, useIsAuthenticated, useAuthToken } from './hooks/useAuth';

// Pages
export { LoginPage, RegisterPage, ForgotPasswordPage } from './pages';

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
  requestBiometricAuth,
} from './bridge';
