import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { LoginForm, OAuthAuthUrlForm, OAuthLoginForm, PasswordResetForm, PasswordResetRequestForm, PhoneLoginForm, PlusApiResultLoginVO, PlusApiResultOAuthUrlVO, PlusApiResultQrCodeStatusVO, PlusApiResultQrCodeVO, PlusApiResultUserInfoVO, PlusApiResultVerifyResultVO, PlusApiResultVoid, QrCodeConfirmForm, RegisterForm, TokenRefreshForm, VerifyCodeCheckForm, VerifyCodeSendForm } from '../types';


export class AuthApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** 验证验证码 */
  async verifySmsCode(body: VerifyCodeCheckForm): Promise<PlusApiResultVerifyResultVO> {
    return this.client.post<PlusApiResultVerifyResultVO>(appApiPath(`/auth/sms/verify`), body);
  }

/** 发送验证码 */
  async sendSmsCode(body: VerifyCodeSendForm): Promise<PlusApiResultVoid> {
    return this.client.post<PlusApiResultVoid>(appApiPath(`/auth/sms/send`), body);
  }

/** 用户注册 */
  async register(body: RegisterForm): Promise<PlusApiResultUserInfoVO> {
    return this.client.post<PlusApiResultUserInfoVO>(appApiPath(`/auth/register`), body);
  }

/** 刷新令牌 */
  async refreshToken(body: TokenRefreshForm): Promise<PlusApiResultLoginVO> {
    return this.client.post<PlusApiResultLoginVO>(appApiPath(`/auth/refresh`), body);
  }

/** 生成登录二维码 */
  async generateQrCode(): Promise<PlusApiResultQrCodeVO> {
    return this.client.post<PlusApiResultQrCodeVO>(appApiPath(`/auth/qr/generate`));
  }

/** 确认二维码登录 */
  async confirmQrCodeLogin(body: QrCodeConfirmForm): Promise<PlusApiResultVoid> {
    return this.client.post<PlusApiResultVoid>(appApiPath(`/auth/qr/confirm`), body);
  }

/** 手机号验证码登录 */
  async phoneLogin(body: PhoneLoginForm): Promise<PlusApiResultLoginVO> {
    return this.client.post<PlusApiResultLoginVO>(appApiPath(`/auth/phone/login`), body);
  }

/** 重置密码 */
  async resetPassword(body: PasswordResetForm): Promise<PlusApiResultVoid> {
    return this.client.post<PlusApiResultVoid>(appApiPath(`/auth/password/reset`), body);
  }

/** Request password reset challenge */
  async requestPasswordResetChallenge(body: PasswordResetRequestForm): Promise<PlusApiResultVoid> {
    return this.client.post<PlusApiResultVoid>(appApiPath(`/auth/password/reset/request`), body);
  }

/** OAuth授权URL */
  async getOauthUrl(body: OAuthAuthUrlForm): Promise<PlusApiResultOAuthUrlVO> {
    return this.client.post<PlusApiResultOAuthUrlVO>(appApiPath(`/auth/oauth/url`), body);
  }

/** OAuth登录 */
  async oauthLogin(body: OAuthLoginForm): Promise<PlusApiResultLoginVO> {
    return this.client.post<PlusApiResultLoginVO>(appApiPath(`/auth/oauth/login`), body);
  }

/** 用户登出 */
  async logout(): Promise<PlusApiResultVoid> {
    return this.client.post<PlusApiResultVoid>(appApiPath(`/auth/logout`));
  }

/** 用户登录 */
  async login(body: LoginForm): Promise<PlusApiResultLoginVO> {
    return this.client.post<PlusApiResultLoginVO>(appApiPath(`/auth/login`), body);
  }

/** 检查二维码状态 */
  async checkQrCodeStatus(qrKey: string | number): Promise<PlusApiResultQrCodeStatusVO> {
    return this.client.get<PlusApiResultQrCodeStatusVO>(appApiPath(`/auth/qr/status/${qrKey}`));
  }

/** 二维码统一入口 */
  async qrCodeEntry(qrKey: string | number): Promise<void> {
    return this.client.get<void>(appApiPath(`/auth/qr/entry/${qrKey}`));
  }
}

export function createAuthApi(client: HttpClient): AuthApi {
  return new AuthApi(client);
}
