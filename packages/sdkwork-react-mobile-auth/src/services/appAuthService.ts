import type {
  LoginForm,
  LoginVO,
  OAuthAuthUrlForm,
  OAuthLoginForm,
  OAuthUrlVO,
  PasswordResetForm,
  PasswordResetRequestForm,
  RegisterForm,
  TokenRefreshForm,
  UserInfoVO,
  UserProfileVO,
  VerifyCodeCheckForm,
  VerifyCodeSendForm,
  VerifyResultVO,
} from '@sdkwork/app-sdk';
import type { SocialLoginRequest, SocialProvider } from '../types';
import { requestNativeSocialAuthorization } from '../bridge';
import { executeOAuthAuthorization } from '../oauth/oauthAuthorization';
import { getOAuthProviderById } from '../oauth/oauthProviders';
import {
  resolveOAuthInteractionMode,
  resolveOAuthInteractionRuntime,
} from '../oauth/oauthFlow';
import {
  applyAppSdkSessionTokens,
  clearAppSdkSessionTokens,
  getAppSdkClientWithSession,
  persistAppSdkSessionTokens,
  readAppSdkSessionTokens,
  resolveAppSdkAccessToken,
} from './useAppSdkClient';

export type AppAuthVerifyType = 'EMAIL' | 'PHONE';
export type AppAuthScene = 'LOGIN' | 'REGISTER' | 'RESET_PASSWORD';

export interface AppAuthLoginInput {
  username: string;
  password: string;
  remember?: boolean;
}

export interface AppAuthRegisterInput {
  username: string;
  password: string;
  confirmPassword?: string;
  email?: string;
  phone?: string;
  name?: string;
  verificationCode?: string;
}

export interface AppAuthSendVerifyCodeInput {
  target: string;
  verifyType: AppAuthVerifyType;
  scene: AppAuthScene;
}

export interface AppAuthVerifyCodeInput extends AppAuthSendVerifyCodeInput {
  code: string;
}

export interface AppAuthPasswordResetRequestInput {
  account: string;
  channel?: 'EMAIL' | 'SMS';
  deviceId?: string;
  locale?: string;
  redirectUri?: string;
}

export interface AppAuthPasswordResetInput {
  account: string;
  code: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AppAuthSocialLoginInput extends SocialLoginRequest {}

export interface AppAuthSession {
  userId: string;
  username: string;
  displayName: string;
  authToken: string;
  accessToken: string;
  refreshToken?: string;
}

export interface IAppAuthService {
  login(input: AppAuthLoginInput): Promise<AppAuthSession>;
  register(input: AppAuthRegisterInput): Promise<AppAuthSession>;
  restoreSession(): Promise<AppAuthSession | null>;
  logout(): Promise<void>;
  refreshToken(refreshToken?: string): Promise<AppAuthSession>;
  sendVerifyCode(input: AppAuthSendVerifyCodeInput): Promise<void>;
  verifyCode(input: AppAuthVerifyCodeInput): Promise<boolean>;
  requestPasswordReset(input: AppAuthPasswordResetRequestInput): Promise<void>;
  resetPassword(input: AppAuthPasswordResetInput): Promise<void>;
  loginWithSocial(input: AppAuthSocialLoginInput): Promise<AppAuthSession>;
  getCurrentSession(): Promise<AppAuthSession | null>;
}

interface ApiEnvelope<T> {
  code?: string | number;
  data?: T;
  msg?: string;
  message?: string;
}

function unwrapApiData<T>(payload: T | ApiEnvelope<T>): T {
  if (payload && typeof payload === 'object' && 'data' in (payload as ApiEnvelope<T>)) {
    const envelope = payload as ApiEnvelope<T>;
    if (envelope.data !== undefined) {
      return envelope.data;
    }
  }
  return payload as T;
}

function isInvalidAuthError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const record = error as Record<string, unknown>;
  const status = record.status;
  if (status === 401 || status === 403) {
    return true;
  }

  const code = String(record.code || '').trim().toLowerCase();
  const message = String(record.message || record.msg || '').trim().toLowerCase();
  return (
    code.includes('unauthorized') ||
    code.includes('forbidden') ||
    code.includes('invalid_token') ||
    code.includes('token_invalid') ||
    message.includes('unauthorized') ||
    message.includes('token invalid') ||
    message.includes('invalid token')
  );
}

function mapScene(scene: AppAuthScene): VerifyCodeSendForm['type'] {
  if (scene === 'REGISTER') return 'REGISTER';
  if (scene === 'RESET_PASSWORD') return 'RESET_PASSWORD';
  return 'LOGIN';
}

function mapVerifyType(type: AppAuthVerifyType): VerifyCodeSendForm['verifyType'] {
  return type === 'EMAIL' ? 'EMAIL' : 'PHONE';
}

function mapPasswordResetChannel(
  channel: AppAuthPasswordResetRequestInput['channel'],
  account: string
): PasswordResetRequestForm['channel'] {
  if (channel === 'EMAIL' || channel === 'SMS') return channel;
  return account.includes('@') ? 'EMAIL' : 'SMS';
}

function mapSocialProvider(provider: SocialProvider): OAuthAuthUrlForm['provider'] {
  if (provider === 'github') return 'GITHUB';
  if (provider === 'google') return 'GOOGLE';
  if (provider === 'wechat') return 'WECHAT';
  if (provider === 'qq') return 'QQ';
  if (provider === 'apple') return 'APPLE';
  throw new Error(`Unsupported social provider: ${provider}`);
}

function resolveDefaultRedirectUri(): string | undefined {
  if (typeof window === 'undefined' || !window.location?.origin) {
    return undefined;
  }
  return `${window.location.origin}/auth/callback`;
}

function resolveDefaultDeviceType(): OAuthLoginForm['deviceType'] {
  if (typeof navigator === 'undefined') {
    return 'web';
  }
  const userAgent = navigator.userAgent || '';
  if (/android/i.test(userAgent)) return 'android';
  if (/iphone|ipad|ipod/i.test(userAgent)) return 'ios';
  return 'web';
}

async function openSocialOAuthPopup(
  authUrl: string,
  redirectUri?: string,
  timeoutMs = 120000
): Promise<{ code: string; state?: string }> {
  if (typeof window === 'undefined') {
    throw new Error('Social login requires browser runtime');
  }
  const popup = window.open(
    authUrl,
    'sdkworkOAuth',
    'width=500,height=640,left=200,top=120'
  );
  if (!popup) {
    throw new Error('OAuth popup blocked');
  }

  const targetRedirectUri = redirectUri || resolveDefaultRedirectUri();
  const targetUrl = targetRedirectUri ? new URL(targetRedirectUri, window.location.origin) : undefined;

  return new Promise((resolve, reject) => {
    let timer = 0;
    let timeoutHandle = 0;
    const cleanup = () => {
      if (timer) {
        window.clearInterval(timer);
      }
      if (timeoutHandle) {
        window.clearTimeout(timeoutHandle);
      }
    };

    timer = window.setInterval(() => {
      if (popup.closed) {
        cleanup();
        reject(new Error('OAuth login cancelled'));
        return;
      }
      try {
        const currentHref = popup.location.href;
        if (!currentHref) return;
        const current = new URL(currentHref);

        if (targetUrl) {
          if (current.origin !== targetUrl.origin || current.pathname !== targetUrl.pathname) {
            return;
          }
        } else if (current.origin !== window.location.origin) {
          return;
        }

        const error = (current.searchParams.get('error') || current.searchParams.get('error_description') || '').trim();
        if (error) {
          popup.close();
          cleanup();
          reject(new Error(error));
          return;
        }

        const code = (current.searchParams.get('code') || '').trim();
        const state = (current.searchParams.get('state') || '').trim() || undefined;
        if (!code) {
          return;
        }

        popup.close();
        cleanup();
        resolve({ code, state });
      } catch {
        // Ignore cross-origin access until callback redirects to same origin.
      }
    }, 400);

    timeoutHandle = window.setTimeout(() => {
      popup.close();
      cleanup();
      reject(new Error('OAuth login timeout'));
    }, timeoutMs);
  });
}

function beginOAuthRedirect(authUrl: string): Promise<never> {
  if (typeof window === 'undefined') {
    throw new Error('OAuth redirect requires browser runtime');
  }
  window.location.assign(authUrl);
  return new Promise<never>(() => undefined);
}

function mapUserSessionFields(
  profile: UserInfoVO | UserProfileVO | undefined,
  usernameHint: string
): Pick<AppAuthSession, 'userId' | 'username' | 'displayName'> {
  const profileRecord = (profile ?? {}) as Record<string, unknown>;
  const idRaw = profileRecord.id;
  const id = idRaw !== undefined && idRaw !== null ? String(idRaw) : '';
  const username = String(profileRecord.username || usernameHint || id || '').trim();
  const displayName = String(profileRecord.nickname || username || id || '').trim();
  return {
    userId: id || username,
    username,
    displayName: displayName || username,
  };
}

async function resolveProfileOrFallback(
  usernameHint: string,
  loginUserInfo?: UserInfoVO
): Promise<Pick<AppAuthSession, 'userId' | 'username' | 'displayName'>> {
  if (loginUserInfo) {
    return mapUserSessionFields(loginUserInfo, usernameHint);
  }
  try {
    const client = getAppSdkClientWithSession();
    const profileResponse = await client.user.getUserProfile();
    const profile = unwrapApiData<UserProfileVO>(profileResponse);
    return mapUserSessionFields(profile, usernameHint);
  } catch {
    return mapUserSessionFields(undefined, usernameHint);
  }
}

function mapSessionFromLoginVO(
  loginData: LoginVO,
  userFields: Pick<AppAuthSession, 'userId' | 'username' | 'displayName'>
): AppAuthSession {
  const authToken = (((loginData as LoginVO & { authToken?: string })?.authToken) || '').trim();
  if (!authToken) {
    throw new Error('Auth token is required');
  }
  return {
    ...userFields,
    authToken,
    accessToken: resolveAppSdkAccessToken(),
    refreshToken: (loginData.refreshToken || '').trim() || undefined,
  };
}

function persistAndBindSession(session: AppAuthSession): void {
  persistAppSdkSessionTokens({
    authToken: session.authToken,
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
  });
  applyAppSdkSessionTokens({
    authToken: session.authToken,
    accessToken: session.accessToken,
  });
}

export const appAuthService: IAppAuthService = {
  async login(input: AppAuthLoginInput): Promise<AppAuthSession> {
    const client = getAppSdkClientWithSession();
    const request: LoginForm = {
      username: input.username,
      password: input.password,
    };
    const response = await client.auth.login(request);
    const loginData = unwrapApiData<LoginVO>(response);
    const userFields = await resolveProfileOrFallback(input.username, loginData.userInfo);
    const session = mapSessionFromLoginVO(loginData, userFields);
    persistAndBindSession(session);
    return session;
  },

  async register(input: AppAuthRegisterInput): Promise<AppAuthSession> {
    const client = getAppSdkClientWithSession();
    const request: RegisterForm = {
      username: input.username,
      password: input.password,
      confirmPassword: input.confirmPassword || input.password,
      email: input.email,
      phone: input.phone,
    };
    await client.auth.register(request);
    return this.login({
      username: input.username,
      password: input.password,
    });
  },

  async restoreSession(): Promise<AppAuthSession | null> {
    const tokens = readAppSdkSessionTokens();
    const authToken = (tokens.authToken || '').trim();
    if (!authToken) {
      return null;
    }

    try {
      const client = getAppSdkClientWithSession();
      const profileResponse = await client.user.getUserProfile();
      const profile = unwrapApiData<UserProfileVO>(profileResponse);
      const userFields = mapUserSessionFields(profile, '');
      return {
        ...userFields,
        authToken,
        accessToken: resolveAppSdkAccessToken(),
        refreshToken: tokens.refreshToken,
      };
    } catch (error) {
      if (isInvalidAuthError(error)) {
        clearAppSdkSessionTokens();
      }
      return null;
    }
  },

  async logout(): Promise<void> {
    const client = getAppSdkClientWithSession();
    try {
      await client.auth.logout();
    } catch {
      // Local cleanup is authoritative for logout completion.
    } finally {
      clearAppSdkSessionTokens();
    }
  },

  async refreshToken(refreshToken?: string): Promise<AppAuthSession> {
    const client = getAppSdkClientWithSession();
    const currentTokens = readAppSdkSessionTokens();
    const nextRefreshToken = (refreshToken || currentTokens.refreshToken || '').trim();
    if (!nextRefreshToken) {
      throw new Error('Refresh token is required');
    }

    const request: TokenRefreshForm = { refreshToken: nextRefreshToken };
    const response = await client.auth.refreshToken(request);
    const loginData = unwrapApiData<LoginVO>(response);
    const current = await this.getCurrentSession();
    const userFields = current
      ? {
          userId: current.userId,
          username: current.username,
          displayName: current.displayName,
        }
      : await resolveProfileOrFallback('');
    const session = mapSessionFromLoginVO(loginData, userFields);
    persistAndBindSession({
      ...session,
      refreshToken: session.refreshToken || nextRefreshToken,
    });
    return {
      ...session,
      refreshToken: session.refreshToken || nextRefreshToken,
    };
  },

  async sendVerifyCode(input: AppAuthSendVerifyCodeInput): Promise<void> {
    const client = getAppSdkClientWithSession();
    const request: VerifyCodeSendForm = {
      target: input.target,
      type: mapScene(input.scene),
      verifyType: mapVerifyType(input.verifyType),
    };
    await client.auth.sendSmsCode(request);
  },

  async verifyCode(input: AppAuthVerifyCodeInput): Promise<boolean> {
    const client = getAppSdkClientWithSession();
    const request: VerifyCodeCheckForm = {
      target: input.target,
      type: mapScene(input.scene),
      verifyType: mapVerifyType(input.verifyType),
      code: input.code,
    };
    const response = await client.auth.verifySmsCode(request);
    const data = unwrapApiData<VerifyResultVO>(response);
    return Boolean(data?.valid);
  },

  async requestPasswordReset(input: AppAuthPasswordResetRequestInput): Promise<void> {
    const client = getAppSdkClientWithSession();
    const account = (input.account || '').trim();
    if (!account) {
      throw new Error('Account is required');
    }
    const request: PasswordResetRequestForm = {
      account,
      channel: mapPasswordResetChannel(input.channel, account),
      deviceId: input.deviceId,
      locale: input.locale,
      redirectUri: input.redirectUri,
    };
    await client.auth.requestPasswordResetChallenge(request);
  },

  async resetPassword(input: AppAuthPasswordResetInput): Promise<void> {
    const client = getAppSdkClientWithSession();
    const request: PasswordResetForm = {
      account: (input.account || '').trim(),
      code: (input.code || '').trim(),
      newPassword: input.newPassword,
      confirmPassword: input.confirmPassword,
    };
    if (!request.account || !request.code || !request.newPassword || !request.confirmPassword) {
      throw new Error('Please complete all required fields');
    }
    await client.auth.resetPassword(request);
  },

  async loginWithSocial(input: AppAuthSocialLoginInput): Promise<AppAuthSession> {
    const client = getAppSdkClientWithSession();
    const providerDescriptor = getOAuthProviderById(input.provider);
    const provider = mapSocialProvider(input.provider);
    const redirectUri = input.redirectUri || resolveDefaultRedirectUri();

    let code = (input.code || '').trim();
    let state = (input.state || '').trim() || undefined;

    if (!code) {
      const oauthUrlResult = await client.auth.getOauthUrl({
        provider,
        redirectUri,
        scope: input.scope,
        state,
      });
      const oauthUrlData = unwrapApiData<OAuthUrlVO>(oauthUrlResult);
      const authUrl = (oauthUrlData?.authUrl || '').trim();
      if (!authUrl) {
        throw new Error('OAuth authorization URL is empty');
      }
      const runtime = resolveOAuthInteractionRuntime();
      const mode = resolveOAuthInteractionMode(providerDescriptor, runtime);
      const authResult = await executeOAuthAuthorization({
        mode,
        authUrl,
        redirectUri,
        provider: input.provider,
        popupExecutor: openSocialOAuthPopup,
        redirectExecutor: beginOAuthRedirect,
        nativeExecutor: requestNativeSocialAuthorization,
      });

      if (!authResult.code) {
        return new Promise<never>(() => undefined);
      }

      code = authResult.code;
      state = authResult.state || state;
    }

    const oauthLoginResult = await client.auth.oauthLogin({
      provider,
      code,
      state,
      deviceId: input.deviceId,
      deviceType: input.deviceType || resolveDefaultDeviceType(),
    });
    const loginData = unwrapApiData<LoginVO>(oauthLoginResult);
    const userFields = await resolveProfileOrFallback('', loginData.userInfo);
    const session = mapSessionFromLoginVO(loginData, userFields);
    persistAndBindSession(session);
    return session;
  },

  async getCurrentSession(): Promise<AppAuthSession | null> {
    return this.restoreSession();
  },
};
