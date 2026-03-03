import {
  AbstractStorageService,
  resolveServiceFactoryRuntimeDeps,
  Result,
} from '@sdkwork/react-mobile-core';
import type { ServiceFactoryDeps, ServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type {
  UserAccount,
  AuthResponse,
  LoginCredentials,
  PasswordResetInfo,
  PasswordResetRequest,
  PasswordResetVerifyInfo,
  RegisterInfo,
  SocialProvider,
  IAuthService,
} from '../types';
import { hashPassword, verifyPassword, generateToken } from '../utils/crypto';
import { generateUUID } from '../utils/uuid';
import { createAuthSdkService } from './AuthSdkService';
import type { IAuthSdkService } from './AuthSdkService';

const TAG = 'AuthService';
const AUTH_EVENTS = {
  REGISTER: 'auth:register',
  LOGIN: 'auth:login',
  LOGOUT: 'auth:logout',
  SESSION_EXPIRED: 'auth:session_expired',
  TOKEN_REFRESH: 'auth:token_refresh',
  PASSWORD_RESET_REQUESTED: 'auth:password_reset_requested',
  PASSWORD_RESET_VERIFIED: 'auth:password_reset_verified',
  PASSWORD_RESET: 'auth:password_reset',
} as const;

interface LocalPasswordResetChallenge {
  account: string;
  code: string;
  expireAt: number;
  createTime: number;
}

class AuthServiceImpl extends AbstractStorageService<UserAccount> implements IAuthService {
  protected STORAGE_KEY = 'sys_auth_users_v1';
  private TOKEN_KEY = 'sys_auth_token';
  private REFRESH_TOKEN_KEY = 'sys_auth_refresh_token';
  private CURRENT_USER_KEY = 'sys_auth_current_user';
  private PASSWORD_RESET_CHALLENGE_KEY = 'sys_auth_password_reset_challenges_v1';
  private PASSWORD_RESET_REQUEST_RATE_KEY = 'sys_auth_password_reset_request_rate_v1';
  private PASSWORD_RESET_CODE_EXPIRE_MS = 10 * 60 * 1000;
  private PASSWORD_RESET_REQUEST_INTERVAL_MS = 60 * 1000;
  private readonly deps: ServiceFactoryRuntimeDeps;
  private readonly sdkService: IAuthSdkService;

  constructor(deps?: ServiceFactoryDeps, sdkService?: IAuthSdkService) {
    super();
    this.deps = resolveServiceFactoryRuntimeDeps(deps);
    this.sdkService = sdkService || createAuthSdkService(deps);
  }

  private async getFromRuntimeStorage<T>(key: string): Promise<T | null> {
    const value = await Promise.resolve(this.deps.storage.get<T>(key));
    return value ?? null;
  }

  private async setToRuntimeStorage<T>(key: string, value: T): Promise<void> {
    await Promise.resolve(this.deps.storage.set<T>(key, value));
  }

  private async removeFromRuntimeStorage(key: string): Promise<void> {
    await Promise.resolve(this.deps.storage.remove(key));
  }

  private normalizeAccount(account: string): string {
    return (account || '').trim();
  }

  private resolveResetChannel(account: string, preferred?: 'EMAIL' | 'SMS'): 'EMAIL' | 'SMS' {
    if (preferred) return preferred;
    return account.includes('@') ? 'EMAIL' : 'SMS';
  }

  private createResetCode(): string {
    const value = Math.floor(100000 + Math.random() * 900000);
    return String(value);
  }

  private async getPasswordResetChallenges(): Promise<LocalPasswordResetChallenge[]> {
    const raw = await this.getFromRuntimeStorage<LocalPasswordResetChallenge[] | string>(this.PASSWORD_RESET_CHALLENGE_KEY);
    if (!raw) return [];
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw) as LocalPasswordResetChallenge[];
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return Array.isArray(raw) ? raw : [];
  }

  private async savePasswordResetChallenges(challenges: LocalPasswordResetChallenge[]): Promise<void> {
    await this.setToRuntimeStorage(this.PASSWORD_RESET_CHALLENGE_KEY, challenges);
  }

  private async cleanupExpiredPasswordResetChallenges(): Promise<LocalPasswordResetChallenge[]> {
    const now = this.deps.clock.now();
    const challenges = await this.getPasswordResetChallenges();
    const valid = challenges.filter((item) => item.expireAt > now);
    if (valid.length !== challenges.length) {
      await this.savePasswordResetChallenges(valid);
    }
    return valid;
  }

  private async getPasswordResetRequestRateMap(): Promise<Record<string, number>> {
    const raw = await this.getFromRuntimeStorage<Record<string, number> | string>(this.PASSWORD_RESET_REQUEST_RATE_KEY);
    if (!raw) return {};
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw) as Record<string, number>;
        return parsed && typeof parsed === 'object' ? parsed : {};
      } catch {
        return {};
      }
    }
    return raw && typeof raw === 'object' ? raw : {};
  }

  private async savePasswordResetRequestRateMap(rateMap: Record<string, number>): Promise<void> {
    await this.setToRuntimeStorage(this.PASSWORD_RESET_REQUEST_RATE_KEY, rateMap);
  }

  private async checkPasswordResetRequestRateLimit(account: string): Promise<Result<void>> {
    const now = this.deps.clock.now();
    const rateMap = await this.getPasswordResetRequestRateMap();
    const accountKey = account.toLowerCase();
    const lastRequestAt = rateMap[accountKey];
    if (lastRequestAt && now - lastRequestAt < this.PASSWORD_RESET_REQUEST_INTERVAL_MS) {
      const remainingSeconds = Math.ceil((this.PASSWORD_RESET_REQUEST_INTERVAL_MS - (now - lastRequestAt)) / 1000);
      return { success: false, error: `Please wait ${remainingSeconds}s before requesting a new code` };
    }

    const next: Record<string, number> = {};
    Object.entries(rateMap).forEach(([key, timestamp]) => {
      if (now - timestamp < this.PASSWORD_RESET_REQUEST_INTERVAL_MS * 10) {
        next[key] = timestamp;
      }
    });
    next[accountKey] = now;
    await this.savePasswordResetRequestRateMap(next);
    return { success: true, data: undefined };
  }

  private mapSdkError(defaultMessage: string): string {
    const error = this.sdkService.getLastError();
    if (!error) return defaultMessage;

    const code = (error.code || '').toUpperCase();
    const message = (error.message || '').toLowerCase();

    if (
      code.includes('INVALID_CREDENTIAL') ||
      code.includes('PASSWORD_ERROR') ||
      code === '401' ||
      (message.includes('invalid') && message.includes('password'))
    ) {
      return 'Username or password is incorrect';
    }
    if (code.includes('USER_NOT_FOUND') || code.includes('ACCOUNT_NOT_FOUND') || message.includes('not found')) {
      return 'Account not found';
    }
    if (
      code.includes('USER_EXISTS') ||
      code.includes('ALREADY_EXISTS') ||
      code.includes('DUPLICATE') ||
      message.includes('already')
    ) {
      return 'Username already exists';
    }
    if (
      code.includes('VERIFY') ||
      code.includes('CODE') ||
      message.includes('verification code') ||
      message.includes('invalid code')
    ) {
      return 'Invalid or expired verification code';
    }
    if (
      code.includes('RATE') ||
      code.includes('TOO_MANY') ||
      message.includes('too many') ||
      message.includes('frequent')
    ) {
      return 'Request too frequent, please try again later';
    }
    return error.message || defaultMessage;
  }

  private getTokenExpiration(token: string): number | null {
    try {
      const parts = token.split('.');
      if (parts.length < 2) return null;
      const payload = JSON.parse(atob(parts[1]));
      return typeof payload?.exp === 'number' ? payload.exp : null;
    } catch {
      return null;
    }
  }

  async register(info: RegisterInfo): Promise<Result<AuthResponse>> {
    this.deps.logger.info(TAG, 'Registering new user', { username: info.username });

    if (info.password !== info.confirmPassword) {
      return { success: false, error: 'Passwords do not match' };
    }

    const sdkSession = await this.sdkService.register(info);
    if (sdkSession) {
      await this.setSession(sdkSession.response, false, sdkSession.refreshToken);
      this.deps.eventBus.emit(AUTH_EVENTS.REGISTER, { user: sdkSession.response.user });
      this.deps.logger.info(TAG, 'User registered through SDK', { userId: sdkSession.response.user.id });
      return { success: true, data: sdkSession.response };
    }
    if (this.sdkService.hasSdkBaseUrl()) {
      return { success: false, error: this.mapSdkError('Registration failed') };
    }

    const existingUsersPage = await this.findAll();
    const existingUsers = existingUsersPage.content || [];
    if (existingUsers.some(u => u.username === info.username)) {
      return { success: false, error: 'Username already exists' };
    }

    const salt = generateUUID();
    const passwordHash = await hashPassword(info.password, salt);

    const user: UserAccount = {
      id: generateUUID(),
      username: info.username,
      passwordHash,
      salt,
      userId: generateUUID(),
      createdAt: this.deps.clock.now(),
      updatedAt: this.deps.clock.now(),
    };

    await this.save(user);

    const token = generateToken(user.userId);
    const response: AuthResponse = {
      token,
      user: {
        id: user.userId,
        username: user.username,
        name: user.username,
        avatar: '',
      },
    };

    await this.setSession(response);
    this.deps.eventBus.emit(AUTH_EVENTS.REGISTER, { user: response.user });

    this.deps.logger.info(TAG, 'User registered successfully', { userId: user.userId });
    return { success: true, data: response };
  }

  async requestPasswordReset(request: PasswordResetRequest): Promise<Result<void>> {
    const account = this.normalizeAccount(request.account);
    if (!account) {
      return { success: false, error: 'Account is required' };
    }

    const sdkResult = await this.sdkService.requestPasswordReset({
      account,
      channel: this.resolveResetChannel(account, request.channel),
    });
    if (sdkResult) {
      this.deps.eventBus.emit(AUTH_EVENTS.PASSWORD_RESET_REQUESTED, { account, channel: request.channel });
      this.deps.logger.info(TAG, 'Password reset challenge requested through SDK', { account });
      return { success: true, data: undefined };
    }
    if (sdkResult === false && this.sdkService.hasSdkBaseUrl()) {
      return { success: false, error: this.mapSdkError('Failed to request password reset') };
    }

    const rateLimitResult = await this.checkPasswordResetRequestRateLimit(account);
    if (!rateLimitResult.success) {
      return rateLimitResult;
    }

    const now = this.deps.clock.now();
    const code = this.createResetCode();
    const existing = await this.cleanupExpiredPasswordResetChallenges();
    const next = existing.filter((item) => item.account !== account);
    next.push({
      account,
      code,
      expireAt: now + this.PASSWORD_RESET_CODE_EXPIRE_MS,
      createTime: now,
    });
    await this.savePasswordResetChallenges(next);

    this.deps.eventBus.emit(AUTH_EVENTS.PASSWORD_RESET_REQUESTED, {
      account,
      channel: this.resolveResetChannel(account, request.channel),
    });
    this.deps.logger.info(TAG, 'Password reset challenge generated locally', { account, code });
    return { success: true, data: undefined };
  }

  async verifyPasswordResetCode(info: PasswordResetVerifyInfo): Promise<Result<void>> {
    const account = this.normalizeAccount(info.account);
    const code = (info.code || '').trim();
    if (!account || !code) {
      return { success: false, error: 'Account and verification code are required' };
    }

    const sdkResult = await this.sdkService.verifyPasswordResetCode({
      account,
      code,
      channel: this.resolveResetChannel(account, info.channel),
    });
    if (sdkResult) {
      this.deps.eventBus.emit(AUTH_EVENTS.PASSWORD_RESET_VERIFIED, { account });
      this.deps.logger.info(TAG, 'Password reset verification succeeded through SDK', { account });
      return { success: true, data: undefined };
    }
    if (sdkResult === false && this.sdkService.hasSdkBaseUrl()) {
      return { success: false, error: this.mapSdkError('Verification failed') };
    }

    const challenges = await this.cleanupExpiredPasswordResetChallenges();
    const matchedChallenge = challenges.find((item) => item.account === account && item.code === code);
    if (!matchedChallenge) {
      return { success: false, error: 'Invalid or expired verification code' };
    }

    this.deps.eventBus.emit(AUTH_EVENTS.PASSWORD_RESET_VERIFIED, { account });
    this.deps.logger.info(TAG, 'Password reset verification succeeded locally', { account });
    return { success: true, data: undefined };
  }

  async resetPassword(info: PasswordResetInfo): Promise<Result<void>> {
    const account = this.normalizeAccount(info.account);
    const code = (info.code || '').trim();
    if (!account || !code || !info.newPassword || !info.confirmPassword) {
      return { success: false, error: 'Please complete all required fields' };
    }

    if (info.newPassword !== info.confirmPassword) {
      return { success: false, error: 'Passwords do not match' };
    }

    const sdkResult = await this.sdkService.resetPassword({
      account,
      code,
      newPassword: info.newPassword,
      confirmPassword: info.confirmPassword,
    });
    if (sdkResult) {
      this.deps.eventBus.emit(AUTH_EVENTS.PASSWORD_RESET, { account });
      this.deps.logger.info(TAG, 'Password reset through SDK', { account });
      return { success: true, data: undefined };
    }
    if (sdkResult === false && this.sdkService.hasSdkBaseUrl()) {
      return { success: false, error: this.mapSdkError('Password reset failed') };
    }

    const challenges = await this.cleanupExpiredPasswordResetChallenges();
    const matchedChallenge = challenges.find((item) => item.account === account && item.code === code);
    if (!matchedChallenge) {
      return { success: false, error: 'Invalid or expired verification code' };
    }

    const usersPage = await this.findAll();
    const users = usersPage.content || [];
    const user = users.find((item) => item.username === account);
    if (!user) {
      return { success: false, error: 'Account not found' };
    }

    const salt = generateUUID();
    const passwordHash = await hashPassword(info.newPassword, salt);
    const updatedUser: UserAccount = {
      ...user,
      salt,
      passwordHash,
      updatedAt: this.deps.clock.now(),
    };
    await this.save(updatedUser);

    const remaining = challenges.filter((item) => !(item.account === account && item.code === code));
    await this.savePasswordResetChallenges(remaining);

    this.deps.eventBus.emit(AUTH_EVENTS.PASSWORD_RESET, { account });
    this.deps.logger.info(TAG, 'Password reset locally', { account });
    return { success: true, data: undefined };
  }

  async login(credentials: LoginCredentials): Promise<Result<AuthResponse>> {
    this.deps.logger.info(TAG, 'User login attempt', { username: credentials.username });

    const sdkSession = await this.sdkService.login(credentials);
    if (sdkSession) {
      await this.setSession(sdkSession.response, credentials.remember, sdkSession.refreshToken);
      this.deps.eventBus.emit(AUTH_EVENTS.LOGIN, { user: sdkSession.response.user });
      this.deps.logger.info(TAG, 'User logged in through SDK', { userId: sdkSession.response.user.id });
      return { success: true, data: sdkSession.response };
    }
    if (this.sdkService.hasSdkBaseUrl()) {
      return { success: false, error: this.mapSdkError('Login failed') };
    }

    const usersPage = await this.findAll();
    const users = usersPage.content || [];
    const user = users.find(u => u.username === credentials.username);
    if (!user) {
      return {
        success: false,
        error:
          'Account not found (local mode). Configure VITE_API_BASE_URL to enable real SDK login request.',
      };
    }

    const isValid = await verifyPassword(credentials.password, user.passwordHash, user.salt);
    if (!isValid) {
      return { success: false, error: 'Invalid username or password' };
    }

    const token = generateToken(user.userId);
    const response: AuthResponse = {
      token,
      user: {
        id: user.userId,
        username: user.username,
        name: user.username,
        avatar: '',
      },
    };

    await this.setSession(response, credentials.remember);
    this.deps.eventBus.emit(AUTH_EVENTS.LOGIN, { user: response.user });

    this.deps.logger.info(TAG, 'User logged in successfully', { userId: user.userId });
    return { success: true, data: response };
  }

  async loginWithSocial(provider: SocialProvider): Promise<Result<AuthResponse>> {
    this.deps.logger.info(TAG, 'Social login attempt', { provider });

    try {
      const result = await this.deps.command.execute<{ code: string; state?: string }>({
        type: 'auth:social_login',
        payload: { provider },
      });

      if (!result.success) {
        return { success: false, error: result.error || 'Social login failed' };
      }

      const userId = generateUUID();
      const token = generateToken(userId);
      const response: AuthResponse = {
        token,
        user: {
          id: userId,
          username: `${provider}_user`,
          name: `${provider} User`,
          avatar: '',
        },
      };

      await this.setSession(response);
      this.deps.eventBus.emit(AUTH_EVENTS.LOGIN, { user: response.user });

      this.deps.logger.info(TAG, 'Social login successful', { provider, userId });
      return { success: true, data: response };
    } catch (error) {
      this.deps.logger.error(TAG, 'Social login failed', error);
      return { success: false, error: 'Social login failed' };
    }
  }

  async logout(): Promise<void> {
    this.deps.logger.info(TAG, 'User logout');

    await this.sdkService.logout();
    await this.removeFromRuntimeStorage(this.TOKEN_KEY);
    await this.removeFromRuntimeStorage(this.REFRESH_TOKEN_KEY);
    await this.removeFromRuntimeStorage(this.CURRENT_USER_KEY);

    this.deps.eventBus.emit(AUTH_EVENTS.LOGOUT, undefined);
    this.deps.logger.info(TAG, 'User logged out');
  }

  async checkSession(): Promise<Result<AuthResponse>> {
    try {
      const token = await this.getFromRuntimeStorage<string>(this.TOKEN_KEY);
      const user = await this.getFromRuntimeStorage<AuthResponse['user']>(this.CURRENT_USER_KEY);

      if (!token || !user) {
        return { success: false, error: 'No active session' };
      }

      const exp = this.getTokenExpiration(token);
      if (exp && exp < this.deps.clock.now()) {
        await this.logout();
        this.deps.eventBus.emit(AUTH_EVENTS.SESSION_EXPIRED, undefined);
        return { success: false, error: 'Session expired' };
      }

      return {
        success: true,
        data: { token, user },
      };
    } catch (error) {
      this.deps.logger.error(TAG, 'Session check failed', error);
      return { success: false, error: 'Session check failed' };
    }
  }

  async refreshToken(): Promise<Result<string>> {
    const session = await this.checkSession();
    if (!session.success || !session.data) {
      return { success: false, error: 'No active session' };
    }

    const refreshToken = await this.getFromRuntimeStorage<string>(this.REFRESH_TOKEN_KEY);
    const sdkRefreshResult = refreshToken
      ? await this.sdkService.refreshToken(refreshToken)
      : null;
    const newToken = sdkRefreshResult?.token || generateToken(session.data.user.id);

    await this.setToRuntimeStorage(this.TOKEN_KEY, newToken);
    if (sdkRefreshResult?.refreshToken) {
      await this.setToRuntimeStorage(this.REFRESH_TOKEN_KEY, sdkRefreshResult.refreshToken);
    }

    this.deps.eventBus.emit(AUTH_EVENTS.TOKEN_REFRESH, { token: newToken });
    this.deps.logger.info(TAG, 'Token refreshed', { userId: session.data.user.id });

    return { success: true, data: newToken };
  }

  async getCurrentUser(): Promise<Result<AuthResponse['user']>> {
    const session = await this.checkSession();
    if (!session.success) {
      return { success: false, error: session.error };
    }
    return { success: true, data: session.data!.user };
  }

  private async setSession(response: AuthResponse, _remember = false, refreshToken?: string): Promise<void> {
    await this.setToRuntimeStorage(this.TOKEN_KEY, response.token);
    await this.setToRuntimeStorage(this.CURRENT_USER_KEY, response.user);
    if (refreshToken) {
      await this.setToRuntimeStorage(this.REFRESH_TOKEN_KEY, refreshToken);
    } else {
      await this.removeFromRuntimeStorage(this.REFRESH_TOKEN_KEY);
    }
  }
}

export function createAuthService(_deps?: ServiceFactoryDeps): IAuthService {
  return new AuthServiceImpl(_deps);
}

export function createAuthServiceWithSdk(_deps?: ServiceFactoryDeps, sdkService?: IAuthSdkService): IAuthService {
  return new AuthServiceImpl(_deps, sdkService);
}

export const authService: IAuthService = createAuthService();

