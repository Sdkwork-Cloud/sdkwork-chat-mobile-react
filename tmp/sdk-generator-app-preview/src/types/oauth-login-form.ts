/** OAuth登录请求 */
export interface OAuthLoginForm {
  /** OAuth提供商 */
  provider: 'WECHAT' | 'WECHAT_MINI' | 'QQ' | 'GITHUB' | 'GOOGLE' | 'APPLE';
  /** 授权码(从第三方平台回调中获取) */
  code: string;
  /** 状态参数(与获取授权URL时的state一致) */
  state?: string;
  /** 设备ID */
  deviceId?: string;
  /** 设备类型: ios/android/web */
  deviceType?: string;
}
