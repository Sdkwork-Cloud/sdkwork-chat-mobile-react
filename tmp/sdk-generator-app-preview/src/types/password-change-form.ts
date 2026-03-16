/** 密码修改请求 */
export interface PasswordChangeForm {
  /** 旧密码 */
  oldPassword?: string;
  /** 新密码 */
  newPassword?: string;
  /** 确认密码 */
  confirmPassword?: string;
  /** 验证码 */
  verifyCode?: string;
}
