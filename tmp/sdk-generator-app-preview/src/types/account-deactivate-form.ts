/** 账户注销请求 */
export interface AccountDeactivateForm {
  /** 注销原因 */
  reason?: string;
  /** 验证码 */
  verifyCode?: string;
  /** 密码 */
  password?: string;
  /** 是否确认注销 */
  confirm?: boolean;
  /** 备注 */
  remark?: string;
}
