/** 删除账户请求 */
export interface AccountDeleteForm {
  /** 密码验证 */
  password: string;
  /** 删除原因 */
  reason?: string;
  /** 确认删除 */
  confirm?: boolean;
  /** 删除时间戳 */
  timestamp?: number;
}
