/** 重置密码请求 */
export interface PasswordResetForm {
  /** 账号(用户名/邮箱/手机号) */
  account: string;
  /** 验证码 */
  code: string;
  /** 新密码(6-32位，必须包含字母和数字) */
  newPassword: string;
  /** 确认新密码 */
  confirmPassword: string;
}
