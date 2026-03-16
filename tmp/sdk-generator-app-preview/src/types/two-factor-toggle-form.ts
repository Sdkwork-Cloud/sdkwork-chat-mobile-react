/** 两步验证设置请求 */
export interface TwoFactorToggleForm {
  /** 是否启用两步验证 */
  enable?: boolean;
  /** 验证方式：app/sms/email */
  method?: string;
  /** 验证代码（开启时需要） */
  verificationCode?: string;
}
