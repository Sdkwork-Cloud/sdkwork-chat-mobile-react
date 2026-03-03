import type { BaseEntity, Result } from '@sdkwork/react-mobile-core';

/**
 * 用户账户信息
 */
export interface UserAccount extends BaseEntity {
  username: string;
  passwordHash: string;
  salt: string;
  userId: string;
}

/**
 * 认证响应
 */
export interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    name: string;
    avatar: string;
  };
}

/**
 * 登录凭据
 */
export interface LoginCredentials {
  username: string;
  password: string;
  remember?: boolean;
}

/**
 * 注册信息
 */
export interface RegisterInfo {
  username: string;
  password: string;
  confirmPassword: string;
  email?: string;
  phone?: string;
}

/**
 * 忘记密码请求
 */
export interface PasswordResetRequest {
  account: string;
  channel?: 'EMAIL' | 'SMS';
}

/**
 * 重置密码参数
 */
export interface PasswordResetInfo {
  account: string;
  code: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * 重置密码验证码校验参数
 */
export interface PasswordResetVerifyInfo {
  account: string;
  code: string;
  channel?: 'EMAIL' | 'SMS';
}

/**
 * 社交登录提供者
 */
export type SocialProvider = 'github' | 'google' | 'wechat' | 'apple';

/**
 * 社交登录凭证
 */
export interface SocialCredentials {
  provider: SocialProvider;
  code: string;
  state?: string;
}

/**
 * 认证状态
 */
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthResponse['user'] | null;
  token: string | null;
  error: string | null;
}

/**
 * 认证事件类型
 */
export type AuthEventType =
  | 'auth:login'
  | 'auth:logout'
  | 'auth:register'
  | 'auth:session_expired'
  | 'auth:token_refresh'
  | 'auth:password_reset_requested'
  | 'auth:password_reset_verified'
  | 'auth:password_reset';

/**
 * 认证事件载荷
 */
export interface AuthEventPayload {
  'auth:login': { user: AuthResponse['user'] };
  'auth:logout': void;
  'auth:register': { user: AuthResponse['user'] };
  'auth:session_expired': void;
  'auth:token_refresh': { token: string };
  'auth:password_reset_requested': { account: string; channel?: 'EMAIL' | 'SMS' };
  'auth:password_reset_verified': { account: string };
  'auth:password_reset': { account: string };
}

/**
 * 认证服务接口
 */
export interface IAuthService {
  login(credentials: LoginCredentials): Promise<Result<AuthResponse>>;
  register(info: RegisterInfo): Promise<Result<AuthResponse>>;
  requestPasswordReset(request: PasswordResetRequest): Promise<Result<void>>;
  verifyPasswordResetCode(info: PasswordResetVerifyInfo): Promise<Result<void>>;
  resetPassword(info: PasswordResetInfo): Promise<Result<void>>;
  loginWithSocial(provider: SocialProvider): Promise<Result<AuthResponse>>;
  logout(): Promise<void>;
  checkSession(): Promise<Result<AuthResponse>>;
  refreshToken(): Promise<Result<string>>;
  getCurrentUser(): Promise<Result<AuthResponse['user']>>;
}

/**
 * 密码强度
 */
export type PasswordStrength = 'weak' | 'medium' | 'strong';

/**
 * 密码验证结果
 */
export interface PasswordValidationResult {
  isValid: boolean;
  strength: PasswordStrength;
  errors: string[];
}
