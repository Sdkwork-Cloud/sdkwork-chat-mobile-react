/** 钱包提现请求 */
export interface WalletWithdrawalForm {
  /** 提现金额 */
  amount: number;
  /** 提现方式: ALIPAY/WECHAT/BANK */
  withdrawMethod: string;
  /** 收款账户 */
  accountNo?: string;
  /** 收款账户名称 */
  accountName?: string;
  /** 开户行 */
  bankName?: string;
  /** 幂等请求号(建议前端传UUID) */
  requestNo?: string;
  /** 备注 */
  remarks?: string;
}
