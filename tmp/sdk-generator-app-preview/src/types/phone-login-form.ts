/** 手机号验证码登录请求 */
export interface PhoneLoginForm {
  /** 手机号码 */
  phone: string;
  /** 短信验证码 */
  code: string;
  /** 设备唯一标识 */
  deviceId?: string;
  /** 设备类型: ios/android/web/mini_program */
  deviceType?: 'ios' | 'android' | 'web' | 'mini_program' | 'pc';
  /** 设备名称 */
  deviceName?: string;
  /** 应用版本号 */
  appVersion?: string;
}
