/** 钱包兑换请求(积分兑换现金或Token) */
export interface WalletExchangeForm {
  /** 兑换积分 */
  points: number;
  /** 兑换目标: CASH/TOKEN */
  target: 'CASH' | 'TOKEN';
  /** 幂等请求号(建议前端传UUID) */
  requestNo?: string;
  /** 备注 */
  remarks?: string;
}
