import { resolveServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { ServiceFactoryDeps, ServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type {
  AuthResponse,
  LoginCredentials,
  PasswordResetInfo,
  PasswordResetRequest,
  PasswordResetVerifyInfo,
  RegisterInfo,
} from '../types';

const TAG = 'AuthSdkService';
const APP_API_PREFIX = '/app/v3/api';
const AUTH_TOKEN_STORAGE_KEY = 'sys_auth_token';

interface SdkApiResult<T> {
  data: T;
  code: string;
  msg: string;
  requestId?: string;
  ip?: string;
  hostname?: string;
  errorName?: string;
}

interface SdkUserInfoVO {
  id?: string | number;
  username?: string;
  nickname?: string;
  avatar?: string;
}

interface SdkLoginVO {
  accessToken?: string;
  refreshToken?: string;
  userInfo?: SdkUserInfoVO;
}

interface SdkUserProfileVO {
  id?: string | number;
  username?: string;
  nickname?: string;
  avatar?: string;
}

interface SdkPasswordResetRequestForm {
  account: string;
  channel: 'EMAIL' | 'SMS';
  deviceId?: string;
  locale?: string;
  redirectUri?: string;
}

interface SdkPasswordResetForm {
  account: string;
  code: string;
  newPassword: string;
  confirmPassword: string;
}

interface SdkVerifyCodeCheckForm {
  target: string;
  type: 'REGISTER' | 'LOGIN' | 'RESET_PASSWORD' | 'BIND_EMAIL' | 'BIND_PHONE';
  verifyType?: string;
  code: string;
}

export interface AuthSdkError {
  code?: string;
  message: string;
}

export interface AuthSdkSession {
  response: AuthResponse;
  refreshToken?: string;
}

export interface AuthSdkRefreshResult {
  token: string;
  refreshToken?: string;
}

export interface IAuthSdkService {
  hasSdkBaseUrl(): boolean;
  getLastError(): AuthSdkError | null;
  login(credentials: LoginCredentials): Promise<AuthSdkSession | null>;
  register(info: RegisterInfo): Promise<AuthSdkSession | null>;
  requestPasswordReset(request: PasswordResetRequest): Promise<boolean | null>;
  verifyPasswordResetCode(info: PasswordResetVerifyInfo): Promise<boolean | null>;
  resetPassword(info: PasswordResetInfo): Promise<boolean | null>;
  refreshToken(refreshToken: string): Promise<AuthSdkRefreshResult | null>;
  logout(): Promise<void>;
}

class AuthSdkServiceImpl implements IAuthSdkService {
  private readonly deps: ServiceFactoryRuntimeDeps;
  private lastError: AuthSdkError | null = null;

  constructor(deps?: ServiceFactoryDeps) {
    this.deps = resolveServiceFactoryRuntimeDeps(deps);
  }

  private resolveEnv(name: string): string | undefined {
    const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
    return env?.[name];
  }

  private resolveBaseUrl(): string {
    const value = this.resolveEnv('VITE_API_BASE_URL') || '';
    return value.trim().replace(/\/+$/g, '');
  }

  hasSdkBaseUrl(): boolean {
    return this.resolveBaseUrl().length > 0;
  }

  getLastError(): AuthSdkError | null {
    return this.lastError;
  }

  private setLastError(error: AuthSdkError | null): void {
    this.lastError = error;
  }

  private buildAppApiPath(path: string): string {
    const normalizedPrefixRaw = APP_API_PREFIX.trim();
    const normalizedPrefix = normalizedPrefixRaw ? `/${normalizedPrefixRaw.replace(/^\/+|\/+$/g, '')}` : '';
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    if (!normalizedPrefix || normalizedPrefix === '/') return normalizedPath;
    if (normalizedPath === normalizedPrefix || normalizedPath.startsWith(`${normalizedPrefix}/`)) return normalizedPath;
    return `${normalizedPrefix}${normalizedPath}`;
  }

  private buildUrl(path: string): string {
    return `${this.resolveBaseUrl()}${this.buildAppApiPath(path)}`;
  }

  private async resolveAuthHeaders(options?: {
    includeContentType?: boolean;
    accessToken?: string;
  }): Promise<Record<string, string>> {
    const headers: Record<string, string> = {};
    if (options?.includeContentType !== false) {
      headers['Content-Type'] = 'application/json';
    }

    const accessTokenEnv = this.resolveEnv('VITE_ACCESS_TOKEN');
    const accessTokenStorage = await Promise.resolve(this.deps.storage.get<string>(AUTH_TOKEN_STORAGE_KEY));
    const accessToken = (options?.accessToken || accessTokenEnv || accessTokenStorage || '').trim();

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
      return headers;
    }

    return headers;
  }

  private isSuccessCode(code: string | undefined): boolean {
    return code === '2000';
  }

  private async requestJson<T>(
    path: string,
    init: RequestInit,
    options?: { includeContentType?: boolean; accessToken?: string }
  ): Promise<T> {
    if (typeof fetch !== 'function') {
      throw new Error('Global fetch is not available');
    }

    const headers = await this.resolveAuthHeaders(options);
    const response = await fetch(this.buildUrl(path), {
      ...init,
      headers: {
        ...headers,
        ...(init.headers || {}),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    return (await response.json()) as T;
  }

  private mapUser(info: SdkUserInfoVO | SdkUserProfileVO | undefined, usernameHint: string): AuthResponse['user'] {
    const username = (info?.username || usernameHint || 'sdk_user').trim();
    const id = info?.id !== undefined && info?.id !== null ? String(info.id) : username;
    const displayName = (info?.nickname || username).trim() || username;

    return {
      id,
      username,
      name: displayName,
      avatar: info?.avatar || '',
    };
  }

  private async fetchProfile(accessToken: string): Promise<SdkUserProfileVO | null> {
    try {
      const result = await this.requestJson<SdkApiResult<SdkUserProfileVO>>(
        '/user/profile',
        { method: 'GET' },
        { includeContentType: false, accessToken },
      );

      if (!this.isSuccessCode(result.code)) {
        return null;
      }
      return result.data || null;
    } catch (error) {
      this.deps.logger.warn(TAG, 'Fetch profile failed after login', error);
      return null;
    }
  }

  private async mapLoginSession(data: SdkLoginVO | undefined, usernameHint: string): Promise<AuthSdkSession | null> {
    const accessToken = data?.accessToken?.trim();
    if (!accessToken) return null;

    let mappedUser = this.mapUser(data?.userInfo, usernameHint);
    if (!data?.userInfo) {
      const profile = await this.fetchProfile(accessToken);
      if (profile) {
        mappedUser = this.mapUser(profile, usernameHint);
      }
    }

    return {
      response: {
        token: accessToken,
        user: mappedUser,
      },
      refreshToken: data?.refreshToken,
    };
  }

  private resolveResetChannel(account: string, preferred?: 'EMAIL' | 'SMS'): 'EMAIL' | 'SMS' {
    if (preferred) return preferred;
    return account.includes('@') ? 'EMAIL' : 'SMS';
  }

  async login(credentials: LoginCredentials): Promise<AuthSdkSession | null> {
    if (!this.hasSdkBaseUrl()) return null;
    this.setLastError(null);

    try {
      const result = await this.requestJson<SdkApiResult<SdkLoginVO>>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password,
        }),
      });

      if (!this.isSuccessCode(result.code)) {
        this.setLastError({ code: result.code, message: result.msg || 'Login failed' });
        this.deps.logger.warn(TAG, 'SDK login failed', { code: result.code, message: result.msg });
        return null;
      }

      const session = await this.mapLoginSession(result.data, credentials.username);
      if (!session) {
        this.setLastError({ message: 'Login response missing access token' });
      }
      return session;
    } catch (error) {
      this.setLastError({
        message: error instanceof Error ? error.message : 'Login request failed',
      });
      this.deps.logger.warn(TAG, 'SDK login request failed', error);
      return null;
    }
  }

  async register(info: RegisterInfo): Promise<AuthSdkSession | null> {
    if (!this.hasSdkBaseUrl()) return null;
    this.setLastError(null);

    try {
      const result = await this.requestJson<SdkApiResult<SdkUserInfoVO>>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          username: info.username,
          password: info.password,
          confirmPassword: info.confirmPassword,
          email: info.email,
          phone: info.phone,
        }),
      });

      if (!this.isSuccessCode(result.code)) {
        this.setLastError({ code: result.code, message: result.msg || 'Registration failed' });
        this.deps.logger.warn(TAG, 'SDK register failed', { code: result.code, message: result.msg });
        return null;
      }

      return this.login({
        username: info.username,
        password: info.password,
      });
    } catch (error) {
      this.setLastError({
        message: error instanceof Error ? error.message : 'Register request failed',
      });
      this.deps.logger.warn(TAG, 'SDK register request failed', error);
      return null;
    }
  }

  async requestPasswordReset(request: PasswordResetRequest): Promise<boolean | null> {
    if (!this.hasSdkBaseUrl()) return null;
    this.setLastError(null);

    const account = (request.account || '').trim();
    if (!account) {
      this.setLastError({ message: 'Account is required' });
      return false;
    }

    const body: SdkPasswordResetRequestForm = {
      account,
      channel: this.resolveResetChannel(account, request.channel),
    };

    try {
      const result = await this.requestJson<SdkApiResult<unknown>>('/auth/password/reset/request', {
        method: 'POST',
        body: JSON.stringify(body),
      });

      if (!this.isSuccessCode(result.code)) {
        this.setLastError({ code: result.code, message: result.msg || 'Request reset challenge failed' });
        this.deps.logger.warn(TAG, 'SDK requestPasswordReset failed', { code: result.code, message: result.msg });
        return false;
      }
      return true;
    } catch (error) {
      this.setLastError({
        message: error instanceof Error ? error.message : 'Request reset challenge failed',
      });
      this.deps.logger.warn(TAG, 'SDK requestPasswordReset request failed', error);
      return false;
    }
  }

  async verifyPasswordResetCode(info: PasswordResetVerifyInfo): Promise<boolean | null> {
    if (!this.hasSdkBaseUrl()) return null;
    this.setLastError(null);

    const account = (info.account || '').trim();
    const code = (info.code || '').trim();
    if (!account || !code) {
      this.setLastError({ message: 'Account and verification code are required' });
      return false;
    }

    const channel = this.resolveResetChannel(account, info.channel);
    const body: SdkVerifyCodeCheckForm = {
      target: account,
      type: 'RESET_PASSWORD',
      verifyType: channel,
      code,
    };

    try {
      const result = await this.requestJson<SdkApiResult<unknown>>('/auth/sms/verify', {
        method: 'POST',
        body: JSON.stringify(body),
      });

      if (!this.isSuccessCode(result.code)) {
        this.setLastError({ code: result.code, message: result.msg || 'Verification failed' });
        this.deps.logger.warn(TAG, 'SDK verifyPasswordResetCode failed', { code: result.code, message: result.msg });
        return false;
      }
      return true;
    } catch (error) {
      this.setLastError({
        message: error instanceof Error ? error.message : 'Verification request failed',
      });
      this.deps.logger.warn(TAG, 'SDK verifyPasswordResetCode request failed', error);
      return false;
    }
  }

  async resetPassword(info: PasswordResetInfo): Promise<boolean | null> {
    if (!this.hasSdkBaseUrl()) return null;
    this.setLastError(null);

    const account = (info.account || '').trim();
    const code = (info.code || '').trim();
    if (!account || !code || !info.newPassword || !info.confirmPassword) {
      this.setLastError({ message: 'Please complete all required fields' });
      return false;
    }

    const body: SdkPasswordResetForm = {
      account,
      code,
      newPassword: info.newPassword,
      confirmPassword: info.confirmPassword,
    };

    try {
      const result = await this.requestJson<SdkApiResult<unknown>>('/auth/password/reset', {
        method: 'POST',
        body: JSON.stringify(body),
      });

      if (!this.isSuccessCode(result.code)) {
        this.setLastError({ code: result.code, message: result.msg || 'Reset password failed' });
        this.deps.logger.warn(TAG, 'SDK resetPassword failed', { code: result.code, message: result.msg });
        return false;
      }
      return true;
    } catch (error) {
      this.setLastError({
        message: error instanceof Error ? error.message : 'Reset password request failed',
      });
      this.deps.logger.warn(TAG, 'SDK resetPassword request failed', error);
      return false;
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthSdkRefreshResult | null> {
    if (!this.hasSdkBaseUrl() || !refreshToken) return null;

    try {
      const result = await this.requestJson<SdkApiResult<SdkLoginVO>>('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });

      if (!this.isSuccessCode(result.code) || !result.data?.accessToken) {
        this.deps.logger.warn(TAG, 'SDK token refresh failed', { code: result.code, message: result.msg });
        return null;
      }

      return {
        token: result.data.accessToken,
        refreshToken: result.data.refreshToken,
      };
    } catch (error) {
      this.deps.logger.warn(TAG, 'SDK token refresh request failed', error);
      return null;
    }
  }

  async logout(): Promise<void> {
    if (!this.hasSdkBaseUrl()) return;

    try {
      const result = await this.requestJson<SdkApiResult<unknown>>('/auth/logout', {
        method: 'POST',
      });
      if (!this.isSuccessCode(result.code)) {
        this.deps.logger.warn(TAG, 'SDK logout returned business failure', {
          code: result.code,
          message: result.msg,
        });
      }
    } catch (error) {
      this.deps.logger.warn(TAG, 'SDK logout request failed', error);
    }
  }
}

export function createAuthSdkService(_deps?: ServiceFactoryDeps): IAuthSdkService {
  return new AuthSdkServiceImpl(_deps);
}

export const authSdkService: IAuthSdkService = createAuthSdkService();
