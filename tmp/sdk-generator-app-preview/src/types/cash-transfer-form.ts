/** 现金转账请求 */
export interface CashTransferForm {
  /** 目标用户ID */
  toUserId: string;
  /** 转账金额 */
  amount: number;
  /** 备注 */
  remarks?: string;
  /** 转账密码 */
  payPassword?: string;
}
