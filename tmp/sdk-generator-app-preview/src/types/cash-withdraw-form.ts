/** 现金提现请求 */
export interface CashWithdrawForm {
  /** 提现金额 */
  amount: number;
  /** 提现方式: ALIPAY-支付宝, WECHAT-微信, BANK-银行卡 */
  withdrawMethod: string;
  /** 收款账户 */
  accountNo?: string;
  /** 收款账户名称 */
  accountName?: string;
  /** 开户行 */
  bankName?: string;
  /** 备注 */
  remarks?: string;
}
