/** 校验验证码请求 */
export interface VerifyCodeCheckForm {
  /** 目标地址(邮箱或手机号) */
  target: string;
  /** 验证码类型: REGISTER/LOGIN/RESET_PASSWORD/BIND_EMAIL/BIND_PHONE */
  type: 'REGISTER' | 'LOGIN' | 'RESET_PASSWORD' | 'BIND_EMAIL' | 'BIND_PHONE';
  /** 验证类型: EMAIL/PHONE */
  verifyType?: string;
  /** 验证码 */
  code: string;
}
