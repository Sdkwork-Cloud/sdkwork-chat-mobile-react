/** 验证分享请求 */
export interface ShareVerifyForm {
  /** 分享ID */
  shareId?: string;
  /** 分享密码 */
  password?: string;
  /** 验证码 */
  verificationCode?: string;
}
